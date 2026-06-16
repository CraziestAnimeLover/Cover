import { useState, useEffect } from 'react';
import { FiX, FiMail, FiGift, FiCheckCircle } from 'react-icons/fi';

const DiscountPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [discountCode] = useState('WELCOME40');

  // Show popup after 5 seconds, only once per session
  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('popupSeen');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => setIsOpen(true), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      sessionStorage.setItem('popupSeen', 'true');
      // You can also send email to your backend here
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('popupSeen', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-300">
        {/* Decorative top bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition"
        >
          <FiX size={22} />
        </button>

        {/* Content */}
        <div className="p-6 pt-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
            <FiGift className="w-8 h-8 text-orange-500" />
          </div>
          
          {!submitted ? (
            <>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                🎁 Get 40% Off Your First Course!
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Subscribe to our newsletter and receive an exclusive discount code instantly.
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-2.5 rounded-xl hover:shadow-lg transition transform active:scale-95"
                >
                  Claim Discount →
                </button>
              </form>
              <p className="text-xs text-gray-400 mt-4">
                No spam, unsubscribe anytime.
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <FiCheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                🎉 Here’s Your Code!
              </h3>
              <div className="bg-gray-100 rounded-xl p-3 my-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Use code at checkout</p>
                <p className="text-2xl font-mono font-bold text-orange-600 tracking-wider">
                  {discountCode}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-full bg-gray-800 text-white font-medium py-2.5 rounded-xl hover:bg-gray-900 transition"
              >
                Start Learning Now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscountPopup;