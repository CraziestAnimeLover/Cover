import CommissionConfig from '../models/CommissionConfig.js';

// @desc    Get commission configuration
// @route   GET /api/admin/commission-config
// @access  Private (Admin)
export const getCommissionConfig = async (req, res) => {
  try {
    let config = await CommissionConfig.findOne();
    if (!config) {
      // Create default config if none exists
      config = await CommissionConfig.create({});
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update commission configuration
// @route   PUT /api/admin/commission-config
// @access  Private (Admin)
export const updateCommissionConfig = async (req, res) => {
  try {
    const {
      level1, level2, level3, level4, level5,
      payoutSettings
    } = req.body;

    let config = await CommissionConfig.findOne();
    if (!config) {
      config = new CommissionConfig();
    }

    if (level1) config.level1 = { ...config.level1, ...level1 };
    if (level2) config.level2 = { ...config.level2, ...level2 };
    if (level3) config.level3 = { ...config.level3, ...level3 };
    if (level4) config.level4 = { ...config.level4, ...level4 };
    if (level5) config.level5 = { ...config.level5, ...level5 };
    if (payoutSettings) config.payoutSettings = { ...config.payoutSettings, ...payoutSettings };
    config.updatedBy = req.user._id;

    await config.save();
    res.json({ message: 'Commission configuration updated', config });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};