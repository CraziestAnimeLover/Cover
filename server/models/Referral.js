import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  referred: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'expired'],
    default: 'pending',
  },
  commissionEarned: {
    type: Number,
    default: 0,
  },
  completedAt: Date,
}, {
  timestamps: true,
});

const Referral = mongoose.model('Referral', referralSchema);
export default Referral;