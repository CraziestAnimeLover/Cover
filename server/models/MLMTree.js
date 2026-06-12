import mongoose from 'mongoose';

const mlmTreeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  sponsorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  path: {
    type: String,  // Materialized path: "parentId.childId.grandchildId"
    required: true
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  leftChild: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rightChild: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  totalDownline: {
    type: Number,
    default: 0
  },
  activeDownline: {
    type: Number,
    default: 0
  },
  totalCommission: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for faster queries
mlmTreeSchema.index({ path: 1 });
mlmTreeSchema.index({ sponsorId: 1 });
mlmTreeSchema.index({ level: 1 });

const MLMTree = mongoose.models.MLMTree || mongoose.model('MLMTree', mlmTreeSchema);
export default MLMTree;