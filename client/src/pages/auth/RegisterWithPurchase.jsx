import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { FiUser, FiMail, FiPhone, FiLock, FiGift, FiShoppingCart, FiCheckCircle } from 'react-icons/fi';

const useRazorpay = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => setIsLoaded(true);
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);
  return isLoaded;
};

const RegistrationForm = ({ selectedCourse, sponsorCode, onBack }) => {
  const navigate = useNavigate();
  const isRazorpayLoaded = useRazorpay();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    sponsorCode: sponsorCode || ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (!isRazorpayLoaded) {
      toast.error('Payment system is loading. Please wait.');
      return;
    }

    setLoading(true);
    try {
      // 1. Create order on backend
      const { data } = await api.post('/payments/create-razorpay-order', {
        courseId: selectedCourse._id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        referralCode: formData.sponsorCode,
      });

      const { order, amount, course } = data;

      // 2. Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'LMS Platform',
        description: `Purchase of ${course.title}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            // 3. Verify payment signature on backend
            await api.post('/payments/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Payment successful! Your account will be created.');
            setTimeout(() => navigate('/login'), 3000);
          } catch (err) {
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: '#6366f1' },
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="text-primary mb-4 hover:underline flex items-center">
        ← Back to courses
      </button>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">You're enrolling in:</h3>
          <p className="text-xl font-bold">{selectedCourse.title}</p>
          <p className="text-3xl font-bold mt-2">₹{selectedCourse.price}</p>
        </div>

        <form onSubmit={handlePayment} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1"><FiUser className="inline mr-1" /> Full Name *</label>
            <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1"><FiMail className="inline mr-1" /> Email *</label>
            <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1"><FiPhone className="inline mr-1" /> Phone *</label>
            <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1"><FiLock className="inline mr-1" /> Password *</label>
            <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1"><FiLock className="inline mr-1" /> Confirm Password *</label>
            <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleInputChange} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1"><FiGift className="inline mr-1" /> Referral Code</label>
            <input type="text" name="sponsorCode" value={formData.sponsorCode} onChange={handleInputChange} className="input bg-gray-50" disabled={!!sponsorCode} />
          </div>

          <button type="submit" disabled={loading || !isRazorpayLoaded} className="w-full btn-primary py-3 flex items-center justify-center">
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div> : <FiCheckCircle className="mr-2" />}
            {loading ? 'Processing...' : `Pay ₹${selectedCourse.price}`}
          </button>
          <p className="text-xs text-gray-500 text-center">Your account will be created automatically after successful payment.</p>
        </form>
      </div>
    </div>
  );
};

const RegisterWithPurchase = () => {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const sponsorCode = searchParams.get('ref') || '';

  useEffect(() => {
    api.get('/courses?isPublished=true&limit=20').then(res => setCourses(res.data.courses || [])).catch(() => toast.error('Failed to load courses'));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold"><span className="text-primary">LMS</span><span className="text-gray-700">Platform</span></Link>
        </div>
        <div className="mb-12 flex justify-center items-center">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <div className="ml-3"><p className="text-sm text-gray-500">Step 1</p><p className="font-medium">Select Course</p></div>
          </div>
          <div className="w-24 h-0.5 bg-gray-300 mx-4"></div>
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
            <div className="ml-3"><p className="text-sm text-gray-500">Step 2</p><p className="font-medium">Register & Pay</p></div>
          </div>
        </div>

        {step === 1 && (
          <>
            <h1 className="text-3xl font-bold text-center mb-4">Choose Your Course</h1>
            <p className="text-center text-gray-600 mb-12">Select a course to get started. Registration is free with course purchase.</p>
            {sponsorCode && <div className="max-w-md mx-auto mb-8 p-3 bg-green-50 border border-green-200 rounded-lg text-center"><p className="text-green-700 text-sm"><FiGift className="inline mr-1" /> You were referred by: <strong>{sponsorCode}</strong></p></div>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <div key={course._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition">
                  <img src={course.thumbnail || 'https://picsum.photos/300/200'} alt={course.title} className="w-full h-48 object-cover" />
                  <div className="p-6">
                    <div className="flex justify-between mb-2"><span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">{course.level || 'Beginner'}</span><span className="text-sm text-gray-500">{course.totalLectures || 0} lectures</span></div>
                    <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-primary">₹{course.price}</span>
                      <button onClick={() => { setSelectedCourse(course); setStep(2); }} className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"><FiShoppingCart /><span>Select</span></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 2 && selectedCourse && (
          <RegistrationForm selectedCourse={selectedCourse} sponsorCode={sponsorCode} onBack={() => setStep(1)} />
        )}
      </div>
    </div>
  );
};

export default RegisterWithPurchase;