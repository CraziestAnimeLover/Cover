import { useState } from 'react';
import { FiX, FiDollarSign, FiCreditCard, FiAlertCircle } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { requestPayout } from '../../features/referral/referralSlice';
import toast from 'react-hot-toast';

const WithdrawModal = ({ onClose, balance, onSuccess }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    accountHolderName: ''
  });

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || (Number(value) >= 500 && Number(value) <= balance)) {
      setAmount(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const withdrawAmount = Number(amount);
    if (withdrawAmount < 500) {
      toast.error('Minimum withdrawal amount is ₹500');
      return;
    }
    
    if (withdrawAmount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);
    try {
      await dispatch(requestPayout({
        amount: withdrawAmount,
        paymentMethod,
        bankDetails
      })).unwrap();
      
      toast.success('Withdrawal request submitted successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error || 'Failed to submit withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Request Withdrawal</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Balance Display */}
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-green-700 mb-1">Available Balance</p>
            <p className="text-3xl font-bold text-green-700">₹{balance.toLocaleString()}</p>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium mb-1">Withdrawal Amount (₹) *</label>
            <div className="relative">
              <FiDollarSign className="absolute left-3 top-3 text-gray-400" />
              <input
                type="number"
                value={amount}
                onChange={handleAmountChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pl-10"
                placeholder="Enter amount (min ₹500)"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum: ₹500 | Maximum: ₹{balance.toLocaleString()}</p>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium mb-2">Payment Method *</label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank_transfer"
                  checked={paymentMethod === 'bank_transfer'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <FiCreditCard className="mr-2 text-gray-500" />
                <div>
                  <p className="font-medium">Bank Transfer</p>
                  <p className="text-xs text-gray-500">Direct transfer to your bank account</p>
                </div>
              </label>
            </div>
          </div>

          {/* Bank Details (shown for bank transfer) */}
          {paymentMethod === 'bank_transfer' && (
            <div className="space-y-3 border-t pt-4">
              <h3 className="font-medium text-sm">Bank Account Details</h3>
              <div>
                <label className="block text-xs font-medium mb-1">Account Holder Name *</label>
                <input
                  type="text"
                  value={bankDetails.accountHolderName}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  required
                  placeholder="Name as per bank account"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Bank Name *</label>
                <input
                  type="text"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  required
                  placeholder="e.g., State Bank of India"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Account Number *</label>
                <input
                  type="text"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  required
                  placeholder="Your bank account number"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">IFSC Code *</label>
                <input
                  type="text"
                  value={bankDetails.ifscCode}
                  onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  required
                  placeholder="e.g., SBIN0001234"
                />
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="bg-yellow-50 rounded-lg p-3 flex items-start space-x-2">
            <FiAlertCircle className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-800">
              Withdrawal requests are processed within 7 business days after verification.
            </p>
          </div>

          <div className="flex space-x-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !amount || amount < 500 || amount > balance}
              className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Request Withdrawal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WithdrawModal;