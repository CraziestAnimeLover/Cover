import Commission from '../models/Commission.js';
import User from '../models/User.js';
import Payout from '../models/Payout.js';

// @desc    Get agent earnings
// @route   GET /api/agent/earnings
// @access  Private (Agent/Instructor)
export const getAgentEarnings = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const commissions = await Commission.find({ userId })
      .populate('sourceUserId', 'name email')
      .populate('courseId', 'title')
      .sort('-createdAt');
    
    const totalEarned = commissions.reduce((sum, c) => sum + c.amount, 0);
    const pending = commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0);
    const paid = commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0);
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = commissions
      .filter(c => new Date(c.createdAt) >= startOfMonth)
      .reduce((sum, c) => sum + c.amount, 0);
    
    const user = await User.findById(userId);
    
    res.json({
      totalEarned,
      pending,
      paid,
      thisMonth,
      withdrawableBalance: user?.withdrawableBalance || 0,
      commissions
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get agent dashboard stats
// @route   GET /api/agent/dashboard
// @access  Private (Agent/Instructor)
export const getAgentDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const totalCommissions = await Commission.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const pendingCommissions = await Commission.aggregate([
      { $match: { userId: userId, status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const paidCommissions = await Commission.aggregate([
      { $match: { userId: userId, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const user = await User.findById(userId);
    
    res.json({
      totalEarned: totalCommissions[0]?.total || 0,
      pending: pendingCommissions[0]?.total || 0,
      paid: paidCommissions[0]?.total || 0,
      withdrawableBalance: user?.withdrawableBalance || 0,
      totalWithdrawn: user?.totalWithdrawn || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request payout
// @route   POST /api/agent/request-payout
// @access  Private (Agent)
export const requestPayout = async (req, res) => {
  try {
    const { amount, paymentMethod, bankDetails } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (amount < 500) {
      return res.status(400).json({ message: 'Minimum withdrawal amount is ₹500' });
    }
    
    if (amount > user.withdrawableBalance) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    
    const payout = await Payout.create({
      agent: req.user._id,
      amount,
      paymentMethod,
      bankDetails,
      status: 'pending'
    });
    
    // Deduct from withdrawable balance
    user.withdrawableBalance -= amount;
    user.pendingWithdrawals += amount;
    await user.save();
    
    res.status(201).json(payout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get payout history
// @route   GET /api/agent/payouts
// @access  Private (Agent)
export const getPayoutHistory = async (req, res) => {
  try {
    const payouts = await Payout.find({ agent: req.user._id }).sort('-createdAt');
    res.json(payouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};