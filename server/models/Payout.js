import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema({
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'bank_transfer'],
    required: true,
  },
  transactionId: String,
  processedAt: Date,
  notes: String,
}, {
  timestamps: true,
});

const Payout = mongoose.model('Payout', payoutSchema);
export default Payout;