import mongoose from 'mongoose';

const commissionSchema = new mongoose.Schema({
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  referral: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Referral',
  },
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
  },
  amount: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending',
  },
  payoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payout',
  },
  description: String,
}, {
  timestamps: true,
});

const Commission = mongoose.model('Commission', commissionSchema);
export default Commission;