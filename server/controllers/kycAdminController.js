// Add these imports at the top of adminController.js
import KYC from '../models/KYC.js';
import User from '../models/User.js';

// @desc    Get pending KYC requests
// @route   GET /api/admin/kyc/pending
// @access  Private (Admin)
export const getPendingKYC = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const kycs = await KYC.find({ status: 'pending' })
      .populate('userId', 'name email phone')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip(skip);

    const total = await KYC.countDocuments({ status: 'pending' });

    res.json({
      kycs,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

    // Update user's KYC status
    await User.findByIdAndUpdate(kyc.userId, { kycStatus: 'approved' });

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

    // Update user's KYC status
    await User.findByIdAndUpdate(kyc.userId, { kycStatus: 'rejected' });

    res.json({ message: 'KYC rejected', kyc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};