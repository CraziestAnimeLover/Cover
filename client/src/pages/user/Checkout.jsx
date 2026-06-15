import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiCreditCard, FiLock, FiShield, FiArrowRight } from 'react-icons/fi';

const Checkout = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Get course details from navigation state
  const courseId = state?.courseId;
  const coursePrice = state?.coursePrice || 4999;
  const courseTitle = state?.courseTitle || 'Course Enrollment';

  useEffect(() => {
    // Redirect if not logged in
    if (!user && !loading) {
      navigate('/student-login');
      return;
    }
    // Load Razorpay script
    if (!document.querySelector('#razorpay-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => setRazorpayLoaded(true);
      document.body.appendChild(script);
    } else {
      setRazorpayLoaded(true);
    }
  }, [user, navigate]);

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      toast.error('Payment system is loading. Please try again.');
      return;
    }

    setLoading(true);
    try {
      // 1. Create order on backend
      const { data } = await api.post('/payments/create-razorpay-order', {
        courseId,
        amount: coursePrice,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          userId: user?._id,
          courseId,
        },
      });

      const { order, amount, course } = data;

      // 2. Configure Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'LMS Platform',
        description: `Purchase of ${course.title}`,
        order_id: order.id,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone || '',
        },
        theme: {
          color: '#6366f1',
        },
        handler: async (response) => {
          // 3. Verify payment on backend
          try {
            await api.post('/payments/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId,
              amount,
            });
            toast.success('Payment successful! You are now enrolled.');
            navigate('/my-learning');
          } catch (err) {
            console.error(err);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.error('Payment cancelled.');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  if (!courseId) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">Invalid checkout session. Please go back and select a course.</p>
        <button onClick={() => navigate('/courses')} className="btn-primary mt-4">Browse Courses</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 font-sans">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Checkout Securely</h1>
        <p className="text-slate-500 text-sm mt-2">Finalize your enrollment selection and unlock your full learning syllabus.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Methods */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <FiCreditCard /> Select Payment Method
            </h2>
            <div className="space-y-3">
              <label className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-slate-50 transition">
                <input type="radio" name="payment" defaultChecked className="mr-3 accent-orange-500" />
                <div>
                  <p className="font-medium">Credit / Debit Card</p>
                  <p className="text-xs text-slate-500">Pay securely using Visa, Mastercard, or RuPay networks.</p>
                </div>
              </label>
              <label className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-slate-50 transition">
                <input type="radio" name="payment" className="mr-3 accent-orange-500" />
                <div>
                  <p className="font-medium">Instant UPI Gateway</p>
                  <p className="text-xs text-slate-500">Authorize directly with Google Pay, PhonePe, or Paytm apps.</p>
                </div>
              </label>
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <FiLock size={14} />
            <span>Your payment details are encrypted and secure</span>
            <FiShield size={14} />
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-md sticky top-24">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-3 mb-3">Order Summary</h3>
            <div className="flex justify-between text-sm py-2">
              <span>Modules Selected</span>
              <span>1 Course</span>
            </div>
            <div className="flex justify-between text-sm py-2 font-semibold border-t pt-3 mt-2">
              <span>Total Amount</span>
              <span className="text-xl text-orange-600">₹{coursePrice}</span>
            </div>
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full mt-6 bg-slate-900 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : 'Pay Now'}
              <FiArrowRight />
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-4 flex items-center justify-center gap-1">
              <FiLock size={10} /> AES 256-Bit Secure Encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;