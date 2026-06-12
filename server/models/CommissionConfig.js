import mongoose from 'mongoose';

const commissionConfigSchema = new mongoose.Schema({
  level1: {
    percentage: { type: Number, default: 25 },
    description: { type: String, default: 'Direct Referral Commission' }
  },
  level2: {
    percentage: { type: Number, default: 15 },
    description: { type: String, default: '2nd Level Commission' }
  },
  level3: {
    percentage: { type: Number, default: 10 },
    description: { type: String, default: '3rd Level Commission' }
  },
  level4: {
    percentage: { type: Number, default: 5 },
    description: { type: String, default: '4th Level Commission' }
  },
  level5: {
    percentage: { type: Number, default: 3 },
    description: { type: String, default: '5th Level Commission' }
  },
  payoutSettings: {
    minimumWithdrawal: { type: Number, default: 500 },
    withdrawalFee: { type: Number, default: 0 },
    processingDays: { type: Number, default: 7 },
    kycRequired: { type: Boolean, default: true }
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const CommissionConfig = mongoose.models.CommissionConfig || mongoose.model('CommissionConfig', commissionConfigSchema);
export default CommissionConfig;