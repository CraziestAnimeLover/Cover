import Withdrawal from '../models/Withdrawal.js';
import User from '../models/User.js';
import Commission from '../models/Commission.js';
import CommissionConfig from '../models/CommissionConfig.js';

class PayoutService {
  
  // Request withdrawal
  async requestWithdrawal(userId, amount, paymentMethod, bankDetails) {
    try {
      const user = await User.findById(userId);
      
      // Check KYC status
      if (user.kycStatus !== 'approved') {
        throw new Error('KYC verification required before withdrawal');
      }
      
      // Check minimum amount
      const config = await CommissionConfig.findOne();
      const minAmount = config?.payoutSettings?.minimumWithdrawal || 500;
      
      if (amount < minAmount) {
        throw new Error(`Minimum withdrawal amount is ₹${minAmount}`);
      }
      
      // Check sufficient balance
      if (user.withdrawableBalance < amount) {
        throw new Error('Insufficient withdrawable balance');
      }
      
      // Create withdrawal request
      const withdrawal = await Withdrawal.create({
        userId,
        amount,
        paymentMethod,
        bankDetails,
        status: 'pending'
      });
      
      // Deduct from withdrawable balance
      await User.findByIdAndUpdate(userId, {
        $inc: { withdrawableBalance: -amount }
      });
      
      return withdrawal;
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      throw error;
    }
  }
  
  // Get user's withdrawal history
  async getUserWithdrawals(userId) {
    const withdrawals = await Withdrawal.find({ userId })
      .sort('-createdAt');
    return withdrawals;
  }
  
  // Get pending withdrawals (admin)
  async getPendingWithdrawals(limit = 50, skip = 0) {
    const withdrawals = await Withdrawal.find({ status: 'pending' })
      .populate('userId', 'name email phone')
      .sort('-createdAt')
      .limit(limit)
      .skip(skip);
    
    const total = await Withdrawal.countDocuments({ status: 'pending' });
    const totalAmount = await Withdrawal.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    return {
      withdrawals,
      total,
      totalAmount: totalAmount[0]?.total || 0
    };
  }
  
  // Process withdrawal (admin)
  async processWithdrawal(withdrawalId, action, transactionId = null, adminNotes = '') {
    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      throw new Error('Withdrawal request not found');
    }
    
    if (action === 'approve') {
      withdrawal.status = 'processing';
      withdrawal.transactionId = transactionId;
      withdrawal.adminNotes = adminNotes;
      withdrawal.processedAt = new Date();
      
      await withdrawal.save();
      
      // Mark commissions as paid
      await Commission.updateMany(
        { userId: withdrawal.userId, status: 'pending' },
        { 
          status: 'paid',
          payoutId: withdrawal._id
        }
      );
      
    } else if (action === 'complete') {
      withdrawal.status = 'completed';
      withdrawal.transactionId = transactionId;
      withdrawal.processedAt = new Date();
      await withdrawal.save();
      
      // Update user's total withdrawn amount
      await User.findByIdAndUpdate(withdrawal.userId, {
        $inc: { totalWithdrawn: withdrawal.amount }
      });
      
    } else if (action === 'reject') {
      withdrawal.status = 'rejected';
      withdrawal.adminNotes = adminNotes;
      await withdrawal.save();
      
      // Refund the amount back to user's withdrawable balance
      await User.findByIdAndUpdate(withdrawal.userId, {
        $inc: { withdrawableBalance: withdrawal.amount }
      });
    }
    
    return withdrawal;
  }
  
  // Get withdrawal stats (admin)
  async getWithdrawalStats() {
    const stats = await Withdrawal.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    const result = {
      pending: { count: 0, amount: 0 },
      processing: { count: 0, amount: 0 },
      completed: { count: 0, amount: 0 },
      rejected: { count: 0, amount: 0 },
      failed: { count: 0, amount: 0 }
    };
    
    for (const stat of stats) {
      if (result[stat._id]) {
        result[stat._id] = {
          count: stat.count,
          amount: stat.totalAmount
        };
      }
    }
    
    return result;
  }
  
  // Export withdrawals to CSV
  async exportToCSV(status = 'pending') {
    const withdrawals = await Withdrawal.find({ status })
      .populate('userId', 'name email phone')
      .sort('-createdAt');
    
    const csvRows = [
      ['Withdrawal ID', 'User Name', 'Email', 'Phone', 'Amount', 'Method', 'Status', 'Requested Date', 'Transaction ID']
    ];
    
    for (const w of withdrawals) {
      csvRows.push([
        w.withdrawalId,
        w.userId?.name || 'N/A',
        w.userId?.email || 'N/A',
        w.userId?.phone || 'N/A',
        w.amount,
        w.paymentMethod,
        w.status,
        new Date(w.createdAt).toLocaleString(),
        w.transactionId || 'N/A'
      ]);
    }
    
    return csvRows.map(row => row.join(',')).join('\n');
  }
}

export default new PayoutService();