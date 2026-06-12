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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId, name, email, phone, referralCode } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Payment is valid – now create user account and enrollment
    let user = await User.findOne({ email });
    if (!user) {
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      user = await User.create({
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'student',
        referralCode: generateReferralCode(name, email),
        isVerified: true,
      });

      // Handle sponsor (referral)
      let sponsor = null;
      if (referralCode) sponsor = await User.findOne({ referralCode });
      if (sponsor) {
        user.referredBy = sponsor._id;
        await user.save();
        // Place in MLM tree
        await MLMService.createTreeNode(user._id, sponsor._id);
      } else {
        await MLMService.createTreeNode(user._id, null);
      }
    }

    // Enroll in course
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const enrollment = await Enrollment.create({
      user: user._id,
      course: courseId,
      amount: course.price,
      paymentId: razorpay_payment_id,
    });

    await sendPaymentConfirmation(user, course, course.price);
    
    // Distribute commissions
    await MLMService.distributeCommission(user._id, course.price, courseId);

    res.json({ message: 'Payment verified and account created', enrollment });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
};