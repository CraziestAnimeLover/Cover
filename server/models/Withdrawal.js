import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
  withdrawalId: { type: String, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'rejected'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'upi', 'paypal'],
    required: true
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    accountHolderName: String,
    upiId: String,
    paypalEmail: String
  },
  transactionId: { type: String },
  adminNotes: { type: String },
  processedAt: { type: Date },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Generate withdrawal ID before saving
withdrawalSchema.pre('save', async function(next) {
  if (!this.withdrawalId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model('Withdrawal').countDocuments();
    this.withdrawalId = `WDR${year}${month}${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

const Withdrawal = mongoose.models.Withdrawal || mongoose.model('Withdrawal', withdrawalSchema);
export default Withdrawal;