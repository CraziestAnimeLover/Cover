import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Payout from '../models/Payout.js';
import Commission from '../models/Commission.js';
import Withdrawal from '../models/Withdrawal.js';
import KYC from '../models/KYC.js';
import MLMService from '../services/mlmService.js';
import { sendPayoutStatusUpdate, sendKYCStatusUpdate } from '../services/emailService.js';

// ==================== DASHBOARD & STATS ====================

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
export const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalInstructors = await User.countDocuments({ role: 'instructor' });
    const totalAgents = await User.countDocuments({ role: 'agent' });
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ isPublished: true });
    const totalEnrollments = await Enrollment.countDocuments();
    const totalRevenue = await Enrollment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const recentCourses = await Course.find()
      .populate('instructor', 'name')
      .sort('-createdAt')
      .limit(5);

    const recentUsers = await User.find()
      .select('-password')
      .sort('-createdAt')
      .limit(5);

    res.json({
      stats: {
        totalUsers,
        totalStudents,
        totalInstructors,
        totalAgents,
        totalCourses,
        publishedCourses,
        totalEnrollments,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      recentCourses,
      recentUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== USER MANAGEMENT ====================

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    let query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role (admin)
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({ message: 'User role updated', user: { id: user._id, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search users by name or email
// @route   GET /api/admin/users/search?q=...
// @access  Private (Admin)
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);
    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    })
    .select('_id name email role')
    .limit(10);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get downline tree for a given user (admin)
// @route   GET /api/admin/network/:userId
// @access  Private (Admin)
export const getUserNetwork = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('name email');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const tree = await MLMService.getDownlineTree(userId, 5);
    if (!tree) {
      return res.json({ user, children: [] });
    }

    const result = {
      user: { _id: user._id, name: user.name, email: user.email },
      downline: tree
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== COURSE MANAGEMENT ====================

// @desc    Approve course (admin)
// @route   PUT /api/admin/courses/:id/approve
// @access  Private (Admin)
export const approveCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    course.isApproved = true;
    await course.save();
    res.json({ message: 'Course approved', course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending courses (admin)
// @route   GET /api/admin/courses/pending
// @access  Private (Admin)
export const getPendingCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isApproved: false })
      .populate('instructor', 'name email')
      .populate('category', 'name')
      .sort('-createdAt');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all courses for admin (with filtering)
// @route   GET /api/admin/courses
// @access  Private (Admin)
export const getAllCoursesForAdmin = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};
    if (status === 'pending') query.isApproved = false;
    if (status === 'published') query.isPublished = true;

    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .populate('category', 'name')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Course.countDocuments(query);
    res.json({
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== PAYOUT / WITHDRAWAL MANAGEMENT ====================

// @desc    Get pending withdrawals
// @route   GET /api/admin/withdrawals/pending
// @access  Private (Admin)
export const getPendingWithdrawals = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const withdrawals = await Withdrawal.find({ status: 'pending' })
      .populate('userId', 'name email phone')   // 'userId' matches your Withdrawal model
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Withdrawal.countDocuments({ status: 'pending' });
    const totalAmount = await Withdrawal.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      withdrawals,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalAmount: totalAmount[0]?.total || 0
    });
  } catch (error) {
    console.error('getPendingWithdrawals error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get withdrawal stats (pending, processing, completed, rejected)
// @route   GET /api/admin/withdrawals/stats
// @access  Private (Admin)
export const getWithdrawalStats = async (req, res) => {
  try {
    const stats = await Withdrawal.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$amount' } } }
    ]);

    const result = {
      pending: { count: 0, amount: 0 },
      processing: { count: 0, amount: 0 },
      completed: { count: 0, amount: 0 },
      rejected: { count: 0, amount: 0 },
      failed: { count: 0, amount: 0 }
    };

    for (const stat of stats) {
      if (result[stat._id]) {
        result[stat._id] = { count: stat.count, amount: stat.amount };
      }
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk process withdrawals (approve multiple)
// @route   POST /api/admin/withdrawals/bulk-process
// @access  Private (Admin)
export const bulkProcessWithdrawals = async (req, res) => {
  try {
    const { withdrawalIds, status = 'completed', transactionIdPrefix = 'BULK' } = req.body;
    if (!withdrawalIds || !withdrawalIds.length) {
      return res.status(400).json({ message: 'No withdrawal IDs provided' });
    }

    const results = [];
    for (const id of withdrawalIds) {
      const payout = await Withdrawal.findById(id);
      if (!payout || payout.status !== 'pending') {
        results.push({ id, success: false, message: 'Not found or already processed' });
        continue;
      }

      payout.status = status;
      payout.transactionId = `${transactionIdPrefix}_${Date.now()}_${payout._id.toString().slice(-6)}`;
      payout.processedAt = new Date();
      await payout.save();

      if (status === 'completed') {
        // Update related commissions if you have a payoutId field
        // await Commission.updateMany({ payoutId: payout._id }, { status: 'paid' });
        await User.findByIdAndUpdate(payout.userId, { $inc: { pendingWithdrawals: -payout.amount } });
      }

      // Send email notification
      try {
        const user = await User.findById(payout.userId);
        if (user) await sendPayoutStatusUpdate(user, payout, status);
      } catch (emailError) {
        console.error('Email failed for withdrawal', payout._id);
      }

      results.push({ id, success: true, amount: payout.amount });
    }

    res.json({ message: `Processed ${results.filter(r => r.success).length} withdrawals`, results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export withdrawals to CSV
// @route   GET /api/admin/withdrawals/export
// @access  Private (Admin)
export const exportWithdrawalsToCSV = async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const withdrawals = await Withdrawal.find({ status })
      .populate('userId', 'name email phone')
      .sort('-createdAt');

    const csvRows = [
      ['Withdrawal ID', 'User Name', 'Email', 'Phone', 'Amount', 'Method', 'Status', 'Requested Date', 'Transaction ID', 'Bank Account', 'IFSC']
    ];

    for (const w of withdrawals) {
      csvRows.push([
        w.withdrawalId || w._id.toString(),
        w.userId?.name || 'N/A',
        w.userId?.email || 'N/A',
        w.userId?.phone || 'N/A',
        w.amount,
        w.paymentMethod,
        w.status,
        new Date(w.createdAt).toLocaleString(),
        w.transactionId || '',
        w.bankDetails?.accountNumber || '',
        w.bankDetails?.ifscCode || ''
      ]);
    }

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=withdrawals_${status}_${Date.now()}.csv`);
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Legacy payout functions (if you still use Payout model)
// @desc    Get all payouts (admin)
// @route   GET /api/admin/payouts
// @access  Private (Admin)
export const getAllPayouts = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;
    const payouts = await Payout.find(query).populate('agent', 'name email').sort('-createdAt');
    res.json(payouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Process payout (admin)
// @route   PUT /api/admin/payouts/:id/process
// @access  Private (Admin)
export const processPayout = async (req, res) => {
  try {
    const { status, transactionId } = req.body;
    const payout = await Payout.findById(req.params.id);
    if (!payout) return res.status(404).json({ message: 'Payout not found' });

    payout.status = status;
    payout.transactionId = transactionId;
    payout.processedAt = new Date();
    await payout.save();

    if (status === 'completed') {
      await Commission.updateMany({ payoutId: payout._id }, { status: 'paid' });
      await User.findByIdAndUpdate(payout.agent, { $inc: { pendingWithdrawals: -payout.amount } });
    }

    // Send email
    try {
      const user = await User.findById(payout.agent);
      if (user) await sendPayoutStatusUpdate(user, payout, status);
    } catch (emailError) {}

    res.json(payout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== KYC MANAGEMENT ====================

// @desc    Approve KYC
// @route   PUT /api/admin/kyc/:id/approve
// @access  Private (Admin)
export const approveKYC = async (req, res) => {
  try {
    const { comments } = req.body;
    const kyc = await KYC.findById(req.params.id);
    if (!kyc) return res.status(404).json({ message: 'KYC not found' });

    kyc.status = 'approved';
    kyc.adminComments = comments || 'Approved';
    kyc.verifiedAt = new Date();
    kyc.verifiedBy = req.user._id;
    await kyc.save();

    await User.findByIdAndUpdate(kyc.userId, { kycStatus: 'approved' });

    try {
      const user = await User.findById(kyc.userId);
      if (user) await sendKYCStatusUpdate(user, 'approved', comments);
    } catch (emailError) {}

    res.json({ message: 'KYC approved successfully', kyc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject KYC
// @route   PUT /api/admin/kyc/:id/reject
// @access  Private (Admin)
export const rejectKYC = async (req, res) => {
  try {
    const { reason } = req.body;
    const kyc = await KYC.findById(req.params.id);
    if (!kyc) return res.status(404).json({ message: 'KYC not found' });

    kyc.status = 'rejected';
    kyc.adminComments = reason || 'Rejected';
    kyc.verifiedAt = new Date();
    kyc.verifiedBy = req.user._id;
    await kyc.save();

    await User.findByIdAndUpdate(kyc.userId, { kycStatus: 'rejected' });

    try {
      const user = await User.findById(kyc.userId);
      if (user) await sendKYCStatusUpdate(user, 'rejected', reason);
    } catch (emailError) {}

    res.json({ message: 'KYC rejected', kyc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== ANALYTICS ====================

// @desc    Get platform analytics (monthly revenue & user registrations)
// @route   GET /api/admin/analytics
// @access  Private (Admin)
export const getPlatformAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    let groupFormat, dateFilter = {};
    const now = new Date();

    switch (period) {
      case 'week':
        groupFormat = '%Y-%m-%d';
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
        break;
      case 'month':
        groupFormat = '%Y-%m-%d';
        dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
        break;
      case 'year':
        groupFormat = '%Y-%m';
        dateFilter = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
        break;
      default:
        groupFormat = '%Y-%m-%d';
        dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 6)) };
    }

    const revenueData = await Enrollment.aggregate([
      { $match: { createdAt: dateFilter } },
      { $group: { _id: { $dateToString: { format: groupFormat, date: '$createdAt' } }, revenue: { $sum: '$amount' } } },
      { $sort: { _id: 1 } }
    ]);

    const userData = await User.aggregate([
      { $match: { createdAt: dateFilter } },
      { $group: { _id: { $dateToString: { format: groupFormat, date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      labels: revenueData.map(item => item._id),
      revenue: revenueData.map(item => item.revenue),
      users: userData.map(item => item.count),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};