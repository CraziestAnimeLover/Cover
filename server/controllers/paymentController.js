import stripe from '../config/stripe.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import Commission from '../models/Commission.js';
import generateReferralCode from '../utils/referralCode.js';
import MLMService from '../services/mlmService.js';
import { sendPaymentConfirmation } from '../services/emailService.js';

// ==================== LAZY RAZORPAY INITIALISATION ====================
let razorpayInstance = null;
const getRazorpay = () => {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
    }
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

// ==================== STRIPE FUNCTIONS ====================

export const createPaymentIntent = async (req, res) => {
  try {
    const { courseId, name, email, phone, referralCode } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(course.price * 100),
      currency: 'usd',
      metadata: { courseId: courseId.toString(), name, email, phone, referralCode: referralCode || '' },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(req.params.paymentIntentId);
    res.json({ status: paymentIntent.status, amount: paymentIntent.amount / 100 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { courseId, name, email, phone, referralCode } = paymentIntent.metadata;

    let user = await User.findOne({ email });
    if (!user) {
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      user = await User.create({
        name, email, phone,
        password: hashedPassword,
        role: 'student',
        referralCode: generateReferralCode(name, email),
        isVerified: true,
      });
      if (referralCode) {
        const sponsor = await User.findOne({ referralCode });
        if (sponsor) {
          user.referredBy = sponsor._id;
          await user.save();
          await MLMService.createTreeNode(user._id, sponsor._id);
        }
      }
    }
    await Enrollment.create({
      user: user._id,
      course: courseId,
      amount: paymentIntent.amount / 100,
      paymentId: paymentIntent.id,
    });
    await MLMService.distributeCommission(user._id, paymentIntent.amount / 100, courseId);
  }
  res.json({ received: true });
};

export const getMyPurchases = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate({ path: 'course', populate: { path: 'instructor', select: 'name avatar' } })
      .populate('course.category', 'name')
      .sort('-createdAt');
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== RAZORPAY FUNCTIONS ====================

export const createRazorpayOrder = async (req, res) => {
  try {
    const razorpay = getRazorpay();
    const { courseId, name, email, phone, referralCode } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const options = {
      amount: Math.round(course.price * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: { courseId: courseId.toString(), name, email, phone, referralCode: referralCode || '' },
    };
    const order = await razorpay.orders.create(options);
    res.status(201).json({ order, amount: course.price, course });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ message: error.message || 'Failed to create payment order' });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId, amount } = req.body;

    // 1. Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // 2. Get course
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    let user;
    const finalAmount = amount || course.price;

    // 3. If user is logged in (token provided)
    if (req.user && req.user._id) {
      user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ message: 'User not found' });
    } else {
      // 4. Fallback for registration flow (new user without token)
      const { name, email, phone, referralCode } = req.body;
      if (!name || !email || !phone) {
        return res.status(400).json({ message: 'Missing registration details' });
      }
      // Check if user already exists (should not happen in registration flow)
      user = await User.findOne({ email });
      if (!user) {
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        user = await User.create({
          name, email, phone,
          password: hashedPassword,
          role: 'student',
          referralCode: generateReferralCode(name, email),
          isVerified: true,
        });
        // Handle sponsor
        let sponsor = null;
        if (referralCode) sponsor = await User.findOne({ referralCode });
        if (sponsor) {
          user.referredBy = sponsor._id;
          await user.save();
          await MLMService.createTreeNode(user._id, sponsor._id);
        } else {
          await MLMService.createTreeNode(user._id, null);
        }
      }
    }

    // 5. Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ user: user._id, course: courseId });
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // 6. Create enrollment
    const enrollment = await Enrollment.create({
      user: user._id,
      course: courseId,
      amount: finalAmount,
      paymentId: razorpay_payment_id,
    });

    // 7. Update course student count
    await Course.findByIdAndUpdate(courseId, { $inc: { totalStudents: 1 } });

    // 8. Send email confirmation
    await sendPaymentConfirmation(user, course, finalAmount);

    // 9. Distribute MLM commissions
    await MLMService.distributeCommission(user._id, finalAmount, courseId);

    res.json({ success: true, message: 'Payment verified and enrolled', enrollment });
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    res.status(500).json({ message: error.message });
  }
};