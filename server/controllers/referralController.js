import Referral from '../models/Referral.js';
import Commission from '../models/Commission.js';
import User from '../models/User.js';

// @desc    Get user's referrals
// @route   GET /api/referrals/my-referrals
// @access  Private
export const getMyReferrals = async (req, res) => {
  try {
    const referrals = await Referral.find({ referrer: req.user._id })
      .populate('referred', 'name email createdAt')
      .sort('-createdAt');
    
    const stats = {
      total: referrals.length,
      completed: referrals.filter(r => r.status === 'completed').length,
      pending: referrals.filter(r => r.status === 'pending').length,
      totalEarnings: referrals.reduce((sum, r) => sum + (r.commissionEarned || 0), 0),
    };
    
    res.json({ referrals, stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get referral link
// @route   GET /api/referrals/link
// @access  Private
export const getReferralLink = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const referralLink = `${process.env.FRONTEND_URL}/register?ref=${user.referralCode}`;
    
    res.json({ referralLink, referralCode: user.referralCode });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Track referral conversion
// @route   POST /api/referrals/track/:referralCode
// @access  Private
export const trackReferralConversion = async (req, res) => {
  try {
    const { referralCode } = req.params;
    const { enrollmentId, amount } = req.body;
    
    const referrer = await User.findOne({ referralCode });
    if (!referrer) {
      return res.status(404).json({ message: 'Referral code not found' });
    }
    
    const referral = await Referral.findOne({
      referrer: referrer._id,
      referred: req.user._id,
    });
    
    if (!referral) {
      return res.status(404).json({ message: 'Referral relationship not found' });
    }
    
    const commissionRate = 0.20; // 20% commission
    const commissionAmount = amount * commissionRate;
    
    referral.status = 'completed';
    referral.commissionEarned = commissionAmount;
    referral.completedAt = new Date();
    await referral.save();
    
    const commission = await Commission.create({
      agent: referrer._id,
      referral: referral._id,
      enrollment: enrollmentId,
      amount: commissionAmount,
      percentage: commissionRate * 100,
      status: 'pending',
      description: `Commission from referral purchase`,
    });
    
    // Update referrer's total earnings
    await User.findByIdAndUpdate(referrer._id, {
      $inc: { totalEarnings: commissionAmount }
    });
    
    res.json({ success: true, commissionAmount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get commission history
// @route   GET /api/referrals/commissions
// @access  Private
export const getCommissions = async (req, res) => {
  try {
    const commissions = await Commission.find({ agent: req.user._id })
      .populate('enrollment', 'course amount')
      .populate({
        path: 'enrollment',
        populate: { path: 'course', select: 'title thumbnail' }
      })
      .sort('-createdAt');
    
    const stats = {
      totalEarned: commissions.reduce((sum, c) => sum + c.amount, 0),
      pending: commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0),
      paid: commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0),
    };
    
    res.json({ commissions, stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};