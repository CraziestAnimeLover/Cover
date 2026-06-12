import mongoose from 'mongoose';

const kycSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  aadhaarNumber: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  address: {
    type: String,
    required: true
  },
  frontImageUrl: {
    type: String,
    required: true
  },
  backImageUrl: {
    type: String,
    required: true
  },
  panCard: {
    type: String
  },
  bankAccountNumber: {
    type: String,
    required: true
  },
  ifscCode: {
    type: String,
    required: true
  },
  bankName: {
    type: String,
    required: true
  },
  accountHolderName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'resubmit'],
    default: 'pending'
  },
  adminComments: {
    type: String
  },
  verifiedAt: {
    type: Date
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster lookups
kycSchema.index({ userId: 1 });
kycSchema.index({ status: 1 });
kycSchema.index({ aadhaarNumber: 1 });

const KYC = mongoose.models.KYC || mongoose.model('KYC', kycSchema);
export default KYC;