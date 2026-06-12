import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCreditCard, FiLock, FiCheckCircle } from 'react-icons/fi';

const Checkout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('card');

  const handlePayment = async () => {
    setLoading(true);
    // Simulate payment resolution
    setTimeout(() => {
      setLoading(false);
      navigate('/my-learning');
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 font-sans selection:bg-orange-500/20">
      
      {/* View Header Section */}
      <div className="mb-8 border-b border-slate-100 pb-6">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Checkout Securely</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">
          Finalize your enrollment selection and unlock your full learning syllabus.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Select Methods Block */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.02)] p-6">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mb-5 flex items-center gap-2">
              <FiCreditCard className="text-orange-500 stroke-[2.5]" /> Select Payment Method
            </h2>
            
            <div className="space-y-3.5">
              {/* Credit / Debit Options card */}
              <label 
                className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                  selectedMethod === 'card' 
                    ? 'border-orange-500 bg-orange-50/30 ring-1 ring-orange-500/20' 
                    : 'border-slate-200 hover:bg-slate-50/50 hover:border-slate-300'
                }`}
                onClick={() => setSelectedMethod('card')}
              >
                <input 
                  type="radio" 
                  name="payment" 
                  checked={selectedMethod === 'card'}
                  onChange={() => setSelectedMethod('card')}
                  className="w-4 h-4 accent-orange-600 border-slate-300 mr-4 cursor-pointer focus:ring-0" 
                />
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-sm tracking-tight">Credit / Debit Card</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Pay securely using Visa, Mastercard, or RuPay networks.</p>
                </div>
              </label>
              
              {/* UPI Options card */}
              <label 
                className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                  selectedMethod === 'upi' 
                    ? 'border-orange-500 bg-orange-50/30 ring-1 ring-orange-500/20' 
                    : 'border-slate-200 hover:bg-slate-50/50 hover:border-slate-300'
                }`}
                onClick={() => setSelectedMethod('upi')}
              >
                <input 
                  type="radio" 
                  name="payment" 
                  checked={selectedMethod === 'upi'}
                  onChange={() => setSelectedMethod('upi')}
                  className="w-4 h-4 accent-orange-600 border-slate-300 mr-4 cursor-pointer focus:ring-0" 
                />
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-sm tracking-tight">Instant UPI Gateway</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Authorize directly with Google Pay, PhonePe, or Paytm apps.</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Side: Order Summary sticky container */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-100 rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.02)] p-6 sticky top-24">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight border-b border-slate-100 pb-4 mb-4">
              Order Summary
            </h3>
            
            <div className="space-y-3 mb-6 text-sm font-medium text-slate-500">
              <div className="flex justify-between items-center">
                <span>Modules Selected</span>
                <span className="text-slate-800 font-bold">1 Course</span>
              </div>
              <div className="border-t border-slate-100 pt-4 mt-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-900 font-bold">Total Amount</span>
                  <span className="text-2xl font-black text-orange-600 tracking-tight">MAXX_TOTAL₹4,999</span>
                </div>
              </div>
            </div>

            {/* Gateway Checkout Submission CTA */}
            <button
              type="button"
              onClick={handlePayment}
              disabled={loading}
              className="w-full h-12 bg-slate-900 hover:bg-orange-600 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-orange-500/20 tracking-wide text-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed select-none"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent data-theme-loader"></div>
              ) : (
                <>
                  <FiLock className="stroke-[2.5]" />
                  <span>Authorize Payment • ₹4,999</span>
                </>
              )}
            </button>
            
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-bold uppercase tracking-wider text-center mt-4 bg-slate-50 py-2 rounded-xl border border-slate-100/60">
              <FiCheckCircle className="text-emerald-500 stroke-[2.5]" />
              <span>AES 256-Bit Secure Encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;