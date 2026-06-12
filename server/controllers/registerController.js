import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import generateToken from '../utils/generateToken.js';
import generateReferralCode from '../utils/referralCode.js';
import MLMService from '../services/mlmService.js';
import { isValidEmail, isValidPassword } from '../utils/validators.js';

// @desc    Register after course purchase
// @route   POST /api/register-with-purchase
// @access  Public
export const registerWithPurchase = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      courseId,
      paymentId,
      amount,
      sponsorCode
    } = req.body;

    // Validation
    if (!name || !email || !phone || !password || !courseId || !paymentId) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Get course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Handle sponsor referral
    let sponsorId = null;
    let sponsorNode = null;
    
    if (sponsorCode) {
      const sponsor = await User.findOne({ referralCode: sponsorCode });
      if (sponsor) {
        sponsorId = sponsor._id;
        sponsorNode = await MLMService.getDownlineTree(sponsor._id);
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: 'student', // Initially student, can upgrade to affiliate
      referralCode: generateReferralCode(name, email),
      sponsorId: sponsorId
    });

    // Create MLM tree node
    await MLMService.createTreeNode(user._id, sponsorId);

    // Enroll in course
    const enrollment = await Enrollment.create({
      user: user._id,
      course: course._id,
      paymentId: paymentId,
      amount: amount
    });

    // Update course total students
    await Course.findByIdAndUpdate(course._id, {
      $inc: { totalStudents: 1 }
    });

    // Distribute commission to upline
    await MLMService.distributeCommission(user._id, amount, course._id);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration and enrollment successful!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode
      },
      enrollment: {
        courseId: course._id,
        courseTitle: course.title,
        amount: amount
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get registration form data (courses for selection)
// @route   GET /api/register-data
// @access  Public
export const getRegistrationData = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true, isApproved: true })
      .select('_id title price thumbnail description')
      .limit(20);
    
    res.json({
      courses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};