import MLMService from '../services/mlmService.js';
import KYCService from '../services/kycService.js';
import PayoutService from '../services/payoutService.js';
import Commission from '../models/Commission.js';
import User from '../models/User.js';

// @desc    Get affiliate dashboard data
export const getAffiliateDashboard = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      downlineTree: { children: [] },
      downlineSummary: { total: 0, level1: 0, level2: 0, level3: 0, level4: 0, level5: 0 },
      earningsBreakdown: { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0, total: 0 },
      recentCommissions: [],
      kycStatus: { status: 'pending' },
      balance: { totalEarnings: 0, withdrawableBalance: 0, totalWithdrawn: 0 },
      referralLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?ref=${user.referralCode}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get downline activity (active/inactive per level)
export const getDownlineActivity = async (req, res) => {
  try {
    const activity = await MLMService.getDownlineActivity(req.user._id);
    res.json(activity);
  } catch (error) {
    console.error('❌ DownlineActivity error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get earnings chart data (week/month/year)
export const getEarningsChart = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const userId = req.user._id;
    let groupFormat;
    let dateFilter = {};
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

    const earningsData = await Commission.aggregate([
      { $match: { userId, status: { $in: ['pending', 'paid'] }, createdAt: dateFilter } },
      { $group: { _id: { $dateToString: { format: groupFormat, date: '$createdAt' } }, total: { $sum: '$amount' } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      labels: earningsData.map(item => item._id),
      earnings: earningsData.map(item => item.total),
    });
  } catch (error) {
    console.error('[EarningsChart] Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get formatted downline tree for graphical display
export const getFormattedDownlineTree = async (req, res) => {
  try {
    // Return a single node tree (the user themselves)
    res.json({
      name: req.user.name,
      attributes: { email: req.user.email, level: 1, totalCommission: 0 },
      children: []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ----------------------------------------------
// Existing functions (unchanged)
// ----------------------------------------------

export const getDownlineTree = async (req, res) => {
  try {
    const { maxLevel = 5 } = req.query;
    const tree = await MLMService.getDownlineTree(req.user._id, parseInt(maxLevel));
    res.json(tree);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitKYC = async (req, res) => {
  try {
    const kycData = req.body;
    const files = req.files;
    const kyc = await KYCService.submitKYC(req.user._id, kycData, files);
    res.json({ success: true, message: 'KYC submitted successfully. Waiting for approval.', kyc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getKYCStatus = async (req, res) => {
  try {
    const status = await KYCService.getKYCStatus(req.user._id);
    res.json(status);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const requestWithdrawal = async (req, res) => {
  try {
    const { amount, paymentMethod, bankDetails } = req.body;
    const withdrawal = await PayoutService.requestWithdrawal(req.user._id, amount, paymentMethod, bankDetails);
    res.json({ success: true, message: 'Withdrawal request submitted successfully', withdrawal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWithdrawalHistory = async (req, res) => {
  try {
    const withdrawals = await PayoutService.getUserWithdrawals(req.user._id);
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCommissionHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, level, status } = req.query;
    let query = { userId: req.user._id };
    if (level) query.level = parseInt(level);
    if (status) query.status = status;

    const commissions = await Commission.find(query)
      .populate('sourceUserId', 'name email')
      .populate('courseId', 'title')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Commission.countDocuments(query);
    res.json({ commissions, totalPages: Math.ceil(total / limit), currentPage: parseInt(page), total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};