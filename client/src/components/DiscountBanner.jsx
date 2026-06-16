import { useState, useEffect } from 'react';
import { FiX, FiGift, FiClock } from 'react-icons/fi';

const DiscountBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-orange-600 to-amber-600 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
              <FiGift className="text-yellow-300" />
              <span className="text-xs font-bold uppercase tracking-wide">Limited Offer</span>
            </div>
            <p className="text-sm font-medium">
              🎓 <strong>Up to 40% off</strong> on all courses – Start learning today!
            </p>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 bg-black/30 rounded-full px-3 py-1.5">
              <FiClock className="text-yellow-300" />
              <div className="flex gap-1 text-sm font-mono font-bold">
                <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                <span>:</span>
                <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span>:</span>
                <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>
            <a
              href="/courses"
              className="bg-white text-orange-600 hover:bg-gray-100 px-4 py-1.5 rounded-full text-sm font-bold transition shadow-md"
            >
              Grab Deal →
            </a>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white/80 hover:text-white p-1 rounded-full transition"
              aria-label="Close banner"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountBanner;