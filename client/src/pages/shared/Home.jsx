import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import DiscountBanner from '../../components/DiscountBanner';
import DiscountPopup from '../../components/DiscountPopup';
import api from '../../services/api'; // <-- added API import
import {
  FiStar,
  FiDownload,
  FiCheckCircle,
  FiChevronDown,
  FiUsers,
  FiTrendingUp,
  FiAward,
  FiBookOpen,
  FiVideo,
  FiShoppingCart,
  FiX,
  FiMail,
  FiLock,
} from 'react-icons/fi';
import {
  FaLinkedinIn,
  FaYoutube,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaWhatsapp,
} from 'react-icons/fa';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const navigate = useNavigate();

  // Modal state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const modalRef = useRef(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Banner state
  const [banners, setBanners] = useState([]);

  // Section refs
  const heroRef = useRef(null);
  const heroImageRef = useRef(null);
  const highlightsRef = useRef(null);
  const categoriesRef = useRef(null);
  const coursesRef = useRef(null);
  const howItWorksRef = useRef(null);
  const testimonialsRef = useRef(null);
  const statsRef = useRef(null);
  const ctaRef = useRef(null);
  const faqRef = useRef(null);

  // Stat counters refs
  const studentCountRef = useRef(null);
  const courseCountRef = useRef(null);
  const instructorCountRef = useRef(null);
  const satisfactionCountRef = useRef(null);

  // FAQ state
  const [faqCategory, setFaqCategory] = useState('General');
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Helper to animate numbers counting up
  const animateNumber = (element, start, end, duration = 2) => {
    if (!element) return;
    let current = start;
    const step = (end - start) / (60 * duration);
    const timer = setInterval(() => {
      current += step;
      if (current >= end) {
        clearInterval(timer);
        element.textContent = end.toLocaleString() + (end === 98 ? '%' : '+');
      } else {
        element.textContent = Math.floor(current).toLocaleString() + (end === 98 ? '%' : '+');
      }
    }, 16);
  };

  // Open modal with GSAP pop animation
  const openModal = () => {
    setShowLoginModal(true);
    setTimeout(() => {
      if (modalRef.current) {
        gsap.fromTo(
          modalRef.current,
          { scale: 0.8, opacity: 0, y: 50 },
          { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.2)' }
        );
      }
    }, 10);
  };

  const closeModal = () => {
    if (modalRef.current) {
      gsap.to(modalRef.current, {
        scale: 0.8,
        opacity: 0,
        y: 50,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => setShowLoginModal(false),
      });
    } else {
      setShowLoginModal(false);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // Replace with your Redux login action
    console.log('Login:', loginEmail, loginPassword);
    closeModal();
    navigate('/student-login');
  };

  // Fetch banners on mount
  useEffect(() => {
    api
      .get('/banners/active')
      .then((res) => setBanners(res.data))
      .catch(() => {});
  }, []);

  // GSAP animations on mount
  useEffect(() => {
    // 1. Parallax hero image
    if (heroImageRef.current) {
      gsap.to(heroImageRef.current, {
        y: 200,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }

    // 2. Fade-in animations for sections
    const sections = [
      { ref: highlightsRef, y: 60 },
      { ref: categoriesRef, y: 60 },
      { ref: coursesRef, y: 60 },
      { ref: howItWorksRef, y: 50 },
      { ref: testimonialsRef, y: 60 },
      { ref: ctaRef, y: 60 },
      { ref: faqRef, y: 50 },
    ];

    sections.forEach((section) => {
      if (section.ref.current) {
        const items = section.ref.current.querySelectorAll('.animate-item');
        if (items.length) {
          gsap.fromTo(
            items,
            { y: section.y, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              stagger: 0.15,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: section.ref.current,
                start: 'top 85%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }
      }
    });

    // 3. Stats counter
    if (statsRef.current) {
      ScrollTrigger.create({
        trigger: statsRef.current,
        start: 'top 80%',
        onEnter: () => {
          if (studentCountRef.current) animateNumber(studentCountRef.current, 0, 50000, 2);
          if (courseCountRef.current) animateNumber(courseCountRef.current, 0, 2000, 2);
          if (instructorCountRef.current) animateNumber(instructorCountRef.current, 0, 100, 2);
          if (satisfactionCountRef.current) animateNumber(satisfactionCountRef.current, 0, 98, 2);
        },
        once: true,
      });
    }

    // 4. Staggered category cards
    const categoryCards = document.querySelectorAll('#categories .category-card');
    if (categoryCards.length) {
      gsap.fromTo(
        categoryCards,
        { scale: 0.9, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(0.8)',
          scrollTrigger: {
            trigger: categoriesRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }

    // 5. Featured course cards entrance
    const courseCards = document.querySelectorAll('#featured-courses .swiper-slide');
    if (courseCards.length) {
      gsap.fromTo(
        courseCards,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.15,
          scrollTrigger: {
            trigger: coursesRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }

    // 6. Testimonial cards entrance
    const testimonialCards = document.querySelectorAll('#testimonials .swiper-slide');
    if (testimonialCards.length) {
      gsap.fromTo(
        testimonialCards,
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          scrollTrigger: {
            trigger: testimonialsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // Featured courses data
  const featuredCourses = [
    {
      id: 1,
      title: 'The Complete Web Development Bootcamp',
      instructor: 'Dr. Angela Yu',
      price: 4999,
      rating: 4.7,
      students: 45000,
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop',
    },
    {
      id: 2,
      title: 'Python for Data Science and Machine Learning',
      instructor: 'Jose Portilla',
      price: 3999,
      rating: 4.8,
      students: 38000,
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=250&fit=crop',
    },
    {
      id: 3,
      title: 'React – The Complete Guide',
      instructor: 'Maximilian Schwarzmüller',
      price: 4499,
      rating: 4.6,
      students: 52000,
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
    },
    {
      id: 4,
      title: 'Ultimate AWS Certified Solutions Architect',
      instructor: 'Stephane Maarek',
      price: 5999,
      rating: 4.9,
      students: 62000,
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop',
    },
    {
      id: 5,
      title: 'JavaScript: The Advanced Concepts',
      instructor: 'Andrei Neagoie',
      price: 3499,
      rating: 4.8,
      students: 31000,
      image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=250&fit=crop',
    },
    {
      id: 6,
      title: 'Artificial Intelligence A-Z 2024',
      instructor: 'Kirill Eremenko',
      price: 5499,
      rating: 4.7,
      students: 28000,
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop',
    },
  ];

  return (
    <div className="overflow-x-hidden bg-white font-sans text-slate-800">
      {/* Add discount banner */}
      <DiscountBanner />

      {/* Add popup modal */}
      <DiscountPopup />

      {/* ========== LOGIN MODAL ========== */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div
            ref={modalRef}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            >
              <FiX size={20} />
            </button>
            <h2 className="mb-2 text-2xl font-bold text-gray-800">Welcome Back</h2>
            <p className="mb-6 text-sm text-gray-500">Sign in to continue your learning journey</p>
            <form onSubmit={handleLoginSubmit}>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="student@example.com"
                    required
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-orange-600 py-2 font-semibold text-white transition hover:bg-orange-700"
              >
                Sign In
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" onClick={closeModal} className="text-orange-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* ========== HERO SECTION ========== */}
      <section ref={heroRef} className="relative h-full w-full overflow-hidden pb-9">
        <div className="absolute inset-0 z-0">
          <picture>
            <source
              media="(min-width: 768px)"
              srcSet="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=800&fit=crop"
            />
            <img
              ref={heroImageRef}
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
              alt="Hero"
              className="h-full w-full object-cover"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-orange-500/30" />
        </div>

        <div className="container relative z-10 mx-auto px-4 py-20 md:py-28 lg:py-32">
          <div className="grid items-center gap-8 lg:grid-cols-7">
            <div className="lg:col-span-4 text-white">
              <div className="flex items-center gap-2 animate-item">
                <div className="flex text-yellow-400">
                  {[...Array(4)].map((_, i) => (
                    <FiStar key={i} className="fill-current" />
                  ))}
                  <FiStar className="text-white/50" />
                </div>
                <span className="text-sm">(50,000+ Students)</span>
              </div>
              <h1 className="mt-4 text-3xl font-bold leading-tight animate-item md:text-5xl">
                Learn From the Best{' '}
                <span className="block text-2xl md:text-3xl">
                  Online Courses for Your Career Growth
                </span>
              </h1>
              <p className="mt-4 text-base text-white/80 animate-item md:text-lg">
                Join millions of learners and start your journey to mastery. Get certified, build
                skills, and advance your career with our expert-led courses.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 animate-item">
                <Link
                  to="/courses"
                  className="rounded-md bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
                >
                  Browse Courses
                </Link>
                {/* <button
                  onClick={openModal}
                  className="rounded-md border border-white px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  Get Started Free
                </button> */}
              </div>
              <div className="mt-8 flex flex-wrap gap-6 animate-item">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-orange-400">2,000+</span> <span>Courses</span>
                  </div>
                  <p className="text-sm text-white/70">Expert-led content</p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-orange-400">50,000+</span> <span>Students</span>
                  </div>
                  <p className="text-sm text-white/70">Worldwide learners</p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-orange-400">100+</span> <span>Experts</span>
                  </div>
                  <p className="text-sm text-white/70">Industry instructors</p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-orange-400">Certificate</span>{' '}
                    <span>of Completion</span>
                  </div>
                  <p className="text-sm text-white/70">Share on LinkedIn</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center lg:col-span-3 animate-item">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=500&fit=crop"
                alt="Learning"
                className="max-w-sm rounded-2xl shadow-2xl md:max-w-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========== BANNER CAROUSEL (ADDED) ========== */}
    {banners.length > 0 && (
  <section className="bg-gradient-to-b from-gray-100 to-white py-8">
    <div className="container mx-auto px-4">
      <Slider
        dots={true}
        infinite={true}
        speed={500}
        slidesToShow={1}
        slidesToScroll={1}
        autoplay={true}
        autoplaySpeed={4000}
        pauseOnHover={true}
        arrows={true}
      >
        {banners.map((banner) => (
          <div key={banner._id}>
            {banner.link ? (
              <a href={banner.link} target="_blank" rel="noopener noreferrer">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-lg"
                />
              </a>
            ) : (
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-lg"
              />
            )}
          </div>
        ))}
      </Slider>
    </div>
  </section>
)}

      {/* ========== KEY HIGHLIGHTS ========== */}
      <section ref={highlightsRef} className="bg-white py-12 shadow-md">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
            {[
              { label: '2,000+ Courses', sub: 'Wide variety of topics.', icon: '📚' },
              { label: 'Lifetime Access', sub: 'Learn at your own pace.', icon: '♾️' },
              { label: 'Certificate of Completion', sub: 'Share your achievement.', icon: '📜' },
              { label: 'Expert Instructors', sub: 'Learn from industry leaders.', icon: '👨‍🏫' },
              { label: '24/7 Support', sub: 'We are here to help.', icon: '💬' },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-3 animate-item">
                <div className="text-3xl">{item.icon}</div>
                <div>
                  <h3 className="text-lg font-bold text-orange-600">{item.label}</h3>
                  <p className="text-sm text-gray-500">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== POPULAR CATEGORIES ========== */}
      <section ref={categoriesRef} className="bg-gray-50 py-16" id="categories">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <span className="font-semibold text-orange-600 animate-item">Categories</span>
            <h2 className="mt-2 text-3xl font-bold text-gray-800 animate-item lg:text-4xl">
              Explore Popular Topics
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600 animate-item">
              Find the perfect course for your career goals.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { name: 'Web Development', icon: '🌐', color: 'bg-blue-100', count: '450+ courses' },
              { name: 'Data Science', icon: '📊', color: 'bg-green-100', count: '320+ courses' },
              { name: 'Cloud Computing', icon: '☁️', color: 'bg-cyan-100', count: '210+ courses' },
              {
                name: 'AI & Machine Learning',
                icon: '🤖',
                color: 'bg-purple-100',
                count: '280+ courses',
              },
              { name: 'Cybersecurity', icon: '🔒', color: 'bg-red-100', count: '190+ courses' },
              { name: 'Mobile Development', icon: '📱', color: 'bg-orange-100', count: '240+ courses' },
              { name: 'DevOps', icon: '⚙️', color: 'bg-gray-100', count: '170+ courses' },
              { name: 'Business & Finance', icon: '💼', color: 'bg-emerald-100', count: '350+ courses' },
            ].map((cat, idx) => (
              <Link
                key={idx}
                to={`/courses?category=${cat.name.toLowerCase()}`}
                className="category-card animate-item"
              >
                <div className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm transition hover:shadow-md">
                  <div
                    className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${cat.color} mb-4 text-3xl`}
                  >
                    {cat.icon}
                  </div>
                  <h3 className="font-semibold text-gray-800">{cat.name}</h3>
                  <p className="mt-1 text-xs text-gray-500">{cat.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURED COURSES (Swiper) ========== */}
      <section ref={coursesRef} className="bg-white py-16" id="featured-courses">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <span className="font-semibold text-orange-600 animate-item">Top Picks</span>
            <h2 className="mt-2 text-3xl font-bold text-gray-800 animate-item lg:text-4xl">
              Featured Courses for You
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600 animate-item">
              Most popular and highest-rated courses.
            </p>
          </div>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000 }}
            className="pb-12"
          >
            {featuredCourses.map((course) => (
              <SwiperSlide key={course.id}>
                <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md transition hover:shadow-xl">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="h-48 w-full object-cover"
                  />
                  <div className="p-5">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-orange-600">Bestseller</span>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <FiStar className="fill-current" />
                        <span className="text-sm font-medium">{course.rating}</span>
                      </div>
                    </div>
                    <h3 className="mb-1 line-clamp-2 text-lg font-bold text-gray-800">
                      {course.title}
                    </h3>
                    <p className="mb-3 text-sm text-gray-500">{course.instructor}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <FiUsers size={14} /> {course.students.toLocaleString()}
                      </div>
                      <div className="text-xl font-bold text-gray-800">
                        ₹{course.price.toLocaleString()}
                      </div>
                    </div>
                    <Link
                      to={`/courses/${course.id}`}
                      className="mt-4 block w-full rounded-md bg-orange-500 py-2 text-center font-semibold text-white transition hover:bg-orange-600"
                    >
                      Enroll Now
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="mt-6 text-center">
            <Link
              to="/courses"
              className="inline-block rounded-full border border-orange-600 px-8 py-3 font-semibold text-orange-600 transition hover:bg-orange-600 hover:text-white"
            >
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section ref={howItWorksRef} className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <span className="font-semibold text-orange-600 animate-item">Simple Process</span>
            <h2 className="mt-2 text-3xl font-bold text-gray-800 animate-item lg:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600 animate-item">
              Start learning in four easy steps.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              {
                step: 1,
                title: 'Browse Courses',
                desc: 'Explore our wide range of courses and find the perfect fit.',
                icon: <FiBookOpen size={40} />,
              },
              {
                step: 2,
                title: 'Enroll & Purchase',
                desc: 'Sign up and securely purchase your chosen course.',
                icon: <FiShoppingCart size={40} />,
              },
              {
                step: 3,
                title: 'Learn Online',
                desc: 'Access video lectures, quizzes, and resources anytime.',
                icon: <FiVideo size={40} />,
              },
              {
                step: 4,
                title: 'Get Certified',
                desc: 'Complete the course and earn your certificate.',
                icon: <FiAward size={40} />,
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center animate-item">
                <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  {item.icon}
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-orange-600 text-sm font-bold text-white">
                    {item.step}
                  </span>
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-800">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section ref={testimonialsRef} className="bg-white py-16" id="testimonials">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <span className="font-semibold text-orange-600 animate-item">Testimonials</span>
            <h2 className="mt-2 text-3xl font-bold text-gray-800 animate-item lg:text-4xl">
              What Our Students Say
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600 animate-item">
              Join thousands of satisfied learners who transformed their careers.
            </p>
          </div>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{ 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000 }}
            className="pb-12"
          >
            {[
              {
                name: 'Sarah Johnson',
                role: 'Web Developer',
                text: 'The web development course was fantastic! I landed a job within 3 months.',
                img: 'https://randomuser.me/api/portraits/women/1.jpg',
              },
              {
                name: 'Michael Chen',
                role: 'Data Analyst',
                text: 'Data science course gave me the skills I needed to switch careers. Highly recommended!',
                img: 'https://randomuser.me/api/portraits/men/2.jpg',
              },
              {
                name: 'Priya Sharma',
                role: 'Cloud Engineer',
                text: 'AWS certification course helped me pass the exam on first try. Great instructors.',
                img: 'https://randomuser.me/api/portraits/women/3.jpg',
              },
              {
                name: 'David Kim',
                role: 'Full Stack Developer',
                text: 'React course was very comprehensive. The projects were challenging but rewarding.',
                img: 'https://randomuser.me/api/portraits/men/4.jpg',
              },
              {
                name: 'Emily Rodriguez',
                role: 'AI Specialist',
                text: 'Machine Learning course is top-notch. The instructor explains complex concepts clearly.',
                img: 'https://randomuser.me/api/portraits/women/5.jpg',
              },
            ].map((test, idx) => (
              <SwiperSlide key={idx}>
                <div className="rounded-xl bg-gray-50 p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-4">
                    <img
                      src={test.img}
                      alt={test.name}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-gray-800">{test.name}</h4>
                      <p className="text-sm text-gray-500">{test.role}</p>
                    </div>
                  </div>
                  <div className="mb-3 flex text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} className="fill-current" />
                    ))}
                  </div>
                  <p className="italic text-gray-600">"{test.text}"</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* ========== STATS SECTION (with count-up) ========== */}
      <section ref={statsRef} className="bg-orange-600 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            <div className="animate-item">
              <div ref={studentCountRef} className="text-4xl font-bold">0+</div>
              <p className="mt-2 text-orange-100">Active Students</p>
            </div>
            <div className="animate-item">
              <div ref={courseCountRef} className="text-4xl font-bold">0+</div>
              <p className="mt-2 text-orange-100">Expert Courses</p>
            </div>
            <div className="animate-item">
              <div ref={instructorCountRef} className="text-4xl font-bold">0+</div>
              <p className="mt-2 text-orange-100">Expert Instructors</p>
            </div>
            <div className="animate-item">
              <div ref={satisfactionCountRef} className="text-4xl font-bold">0%</div>
              <p className="mt-2 text-orange-100">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CERTIFICATE SHOWCASE SECTION ========== */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <span className="font-semibold text-orange-600 animate-item">Earn Your Certificate</span>
            <h2 className="mt-2 text-3xl font-bold text-gray-800 animate-item lg:text-4xl">
              Get Globally Recognised Certification
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600 animate-item">
              Complete any course and receive a verified, shareable certificate that boosts your
              career.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-12 lg:flex-row">
            {/* Certificate Preview */}
            <div className="relative w-full max-w-2xl animate-item">
              <div
                className="group cursor-pointer rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-8 shadow-2xl transition duration-300 hover:shadow-3xl md:p-12"
                onClick={() => document.getElementById('certificateModal').showModal()}
              >
                <div className="absolute right-4 top-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-200/50 opacity-50 transition group-hover:opacity-100">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-600 text-center text-xs font-bold uppercase leading-tight text-amber-700">
                    VERIFIED
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-serif text-2xl font-bold text-gray-800 md:text-3xl">
                    CERTIFICATE OF COMPLETION
                  </h3>
                  <div className="mx-auto my-4 h-0.5 w-24 bg-orange-500"></div>
                  <p className="text-sm text-gray-600">This certificate is proudly presented to</p>
                  <p className="my-4 font-serif text-3xl font-bold text-gray-900 md:text-4xl">
                    Your Name
                  </p>
                  <p className="text-sm text-gray-600">for successfully completing the course</p>
                  <p className="my-3 text-xl font-bold text-orange-600 md:text-2xl">
                    Web Development Bootcamp
                  </p>
                  <p className="text-xs text-gray-500">
                    with a grade of <strong>92%</strong> and demonstrated excellence
                  </p>
                  <div className="mt-6 flex justify-center gap-8 text-xs text-gray-500">
                    <div>
                      <p>Date of Completion</p>
                      <p className="font-semibold text-gray-700">June 15, 2026</p>
                    </div>
                    <div>
                      <p>Certificate ID</p>
                      <p className="font-semibold text-gray-700">LMS-2026-8765</p>
                    </div>
                  </div>
                  <div className="mt-8 flex items-end justify-between">
                    <div className="text-left">
                      <div className="h-0.5 w-32 bg-gray-400"></div>
                      <p className="mt-1 text-xs text-gray-500">Signature</p>
                      <p className="text-sm font-semibold">Dr. Jane Smith</p>
                      <p className="text-xs text-gray-400">Academic Director</p>
                    </div>
                    <div className="text-right">
                      <div className="flex h-12 w-24 items-center justify-center rounded bg-gray-200 text-2xl opacity-50">
                        🏛️
                      </div>
                      <p className="mt-1 text-xs text-gray-500">LMS Platform</p>
                    </div>
                  </div>
                </div>
              </div>
              <button
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 font-semibold text-white transition hover:bg-orange-700"
                onClick={() => document.getElementById('certificateModal').showModal()}
              >
                <FiAward size={20} /> View Full Certificate
              </button>
            </div>

            {/* Info Column */}
            <div className="max-w-md animate-item">
              <h3 className="text-2xl font-bold text-gray-800">Why choose our certificates?</h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="mt-1 flex-shrink-0 text-orange-600" />
                  <span>Globally recognised by employers and institutions</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="mt-1 flex-shrink-0 text-orange-600" />
                  <span>Share instantly on LinkedIn, Twitter, and your CV</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="mt-1 flex-shrink-0 text-orange-600" />
                  <span>Blockchain‑verified for authenticity</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="mt-1 flex-shrink-0 text-orange-600" />
                  <span>Includes ECTS credits (up to 90 credits per master's)</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link
                  to="/courses"
                  className="inline-block rounded-full border border-orange-600 bg-white px-6 py-2 font-semibold text-orange-600 transition hover:bg-orange-600 hover:text-white"
                >
                  Start Learning → Get Certified
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal for full certificate view */}
      <dialog
        id="certificateModal"
        className="w-11/12 max-w-4xl rounded-2xl p-0 shadow-2xl backdrop:bg-black/60"
      >
        <div className="relative rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-8 md:p-12">
          <button
            className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-gray-800"
            onClick={() => document.getElementById('certificateModal').close()}
          >
            ✕
          </button>
          <div className="text-center">
            <h3 className="font-serif text-3xl font-bold text-gray-800 md:text-4xl">
              CERTIFICATE OF COMPLETION
            </h3>
            <div className="mx-auto my-4 h-0.5 w-32 bg-orange-500"></div>
            <p className="text-gray-600">This certificate is proudly presented to</p>
            <p className="my-6 font-serif text-4xl font-bold text-gray-900 md:text-5xl">
              Your Name
            </p>
            <p className="text-gray-600">for successfully completing the course</p>
            <p className="my-4 text-2xl font-bold text-orange-600 md:text-3xl">
              Web Development Bootcamp
            </p>
            <p className="text-gray-500">
              with a grade of <strong>92%</strong> and demonstrated excellence in all modules
            </p>
            <div className="mt-8 flex justify-center gap-12 text-sm text-gray-600">
              <div>
                <span className="font-semibold">Date:</span> June 15, 2026
              </div>
              <div>
                <span className="font-semibold">Certificate ID:</span> LMS-2026-8765
              </div>
              <div>
                <span className="font-semibold">Credits:</span> 12 ECTS
              </div>
            </div>
            <div className="mt-12 flex items-end justify-between">
              <div className="text-left">
                <div className="h-0.5 w-40 bg-gray-500"></div>
                <p className="mt-1 text-sm font-semibold">Dr. Jane Smith</p>
                <p className="text-xs text-gray-500">Academic Director, LMS Platform</p>
              </div>
              <div className="text-right">
                <div className="flex h-16 w-32 items-center justify-center rounded bg-gray-200 text-3xl opacity-70">
                  🏛️
                </div>
                <p className="mt-1 text-xs text-gray-500">LMS Platform – Accredited Institution</p>
              </div>
            </div>
            <div className="mt-10 border-t pt-6 text-center text-xs text-gray-400">
              This certificate is issued by LMS Platform and is verifiable online. It represents 50
              hours of learning.
            </div>
          </div>
        </div>
      </dialog>

      {/* ========== CTA SECTION ========== */}
      <section ref={ctaRef} className="bg-gray-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-800 animate-item lg:text-4xl">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-gray-600 animate-item">
            Join thousands of learners and get access to world-class courses, expert instructors, and
            a supportive community.
          </p>
          <div className="flex flex-wrap justify-center gap-4 animate-item">
            {/* <Link
              to="/register"
              className="rounded-full bg-orange-600 px-8 py-3 font-semibold text-white transition hover:bg-orange-700"
            >
              Get Started Free
            </Link> */}
            <Link
              to="/courses"
              className="rounded-full border border-orange-600 px-8 py-3 font-semibold text-orange-600 transition hover:bg-orange-600 hover:text-white"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </section>

      {/* ========== FAQ SECTION ========== */}
      <section ref={faqRef} className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <span className="font-semibold text-orange-600 animate-item">FAQs</span>
            <h2 className="mt-2 text-3xl font-bold text-gray-800 animate-item lg:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600 animate-item">
              Got questions? We've got answers.
            </p>
          </div>
          <div className="mb-8 flex flex-wrap justify-center gap-3 animate-item">
            {['General', 'Payment', 'Certificate', 'Technical'].map((cat) => (
              <button
                key={cat}
                className={`rounded-full px-5 py-2 transition ${
                  faqCategory === cat
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setFaqCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="mx-auto max-w-3xl">
            {faqCategory === 'General' && (
              <>
                <div className="border-b py-4">
                  <button
                    className="flex w-full items-center justify-between text-left font-medium"
                    onClick={() => toggleFaq(0)}
                  >
                    How do I enroll in a course?
                    <FiChevronDown
                      className={`transform transition ${openFaq === 0 ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openFaq === 0 && (
                    <p className="mt-2 text-gray-600">
                      Simply browse our course catalog, select a course you like, and click "Enroll
                      Now". You'll need to create an account or sign in to complete the purchase.
                    </p>
                  )}
                </div>
                <div className="border-b py-4">
                  <button
                    className="flex w-full items-center justify-between text-left font-medium"
                    onClick={() => toggleFaq(1)}
                  >
                    How long do I have access to a course?
                    <FiChevronDown
                      className={`transform transition ${openFaq === 1 ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openFaq === 1 && (
                    <p className="mt-2 text-gray-600">
                      You get lifetime access to any course you purchase. You can learn at your own
                      pace and revisit the material anytime.
                    </p>
                  )}
                </div>
                <div className="border-b py-4">
                  <button
                    className="flex w-full items-center justify-between text-left font-medium"
                    onClick={() => toggleFaq(2)}
                  >
                    Do I get a certificate after completing a course?
                    <FiChevronDown
                      className={`transform transition ${openFaq === 2 ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openFaq === 2 && (
                    <p className="mt-2 text-gray-600">
                      Yes! You will receive a certificate of completion that you can share on
                      LinkedIn, download, or print.
                    </p>
                  )}
                </div>
              </>
            )}
            {faqCategory === 'Payment' && (
              <>
                <div className="border-b py-4">
                  <button
                    className="flex w-full items-center justify-between text-left font-medium"
                    onClick={() => toggleFaq(3)}
                  >
                    What payment methods do you accept?
                    <FiChevronDown
                      className={`transform transition ${openFaq === 3 ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openFaq === 3 && (
                    <p className="mt-2 text-gray-600">
                      We accept credit/debit cards, UPI, net banking, and EMI options through our
                      payment partners.
                    </p>
                  )}
                </div>
                <div className="border-b py-4">
                  <button
                    className="flex w-full items-center justify-between text-left font-medium"
                    onClick={() => toggleFaq(4)}
                  >
                    Is there a refund policy?
                    <FiChevronDown
                      className={`transform transition ${openFaq === 4 ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openFaq === 4 && (
                    <p className="mt-2 text-gray-600">
                      We offer a 30-day money-back guarantee for most courses. If you're not
                      satisfied, we'll refund your purchase.
                    </p>
                  )}
                </div>
              </>
            )}
            {faqCategory === 'Certificate' && (
              <>
                <div className="border-b py-4">
                  <button
                    className="flex w-full items-center justify-between text-left font-medium"
                    onClick={() => toggleFaq(5)}
                  >
                    How do I get my certificate?
                    <FiChevronDown
                      className={`transform transition ${openFaq === 5 ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openFaq === 5 && (
                    <p className="mt-2 text-gray-600">
                      Once you complete all course requirements (videos, quizzes, assignments), you
                      can download your certificate instantly from your dashboard.
                    </p>
                  )}
                </div>
                <div className="border-b py-4">
                  <button
                    className="flex w-full items-center justify-between text-left font-medium"
                    onClick={() => toggleFaq(6)}
                  >
                    Can I share my certificate on LinkedIn?
                    <FiChevronDown
                      className={`transform transition ${openFaq === 6 ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openFaq === 6 && (
                    <p className="mt-2 text-gray-600">
                      Absolutely! Your certificate includes a unique URL that you can add to your
                      LinkedIn profile and resume.
                    </p>
                  )}
                </div>
              </>
            )}
            {faqCategory === 'Technical' && (
              <>
                <div className="border-b py-4">
                  <button
                    className="flex w-full items-center justify-between text-left font-medium"
                    onClick={() => toggleFaq(7)}
                  >
                    What devices can I use to watch courses?
                    <FiChevronDown
                      className={`transform transition ${openFaq === 7 ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openFaq === 7 && (
                    <p className="mt-2 text-gray-600">
                      Our platform works on desktop, tablet, and mobile. You can also download the
                      mobile app for offline viewing.
                    </p>
                  )}
                </div>
                <div className="border-b py-4">
                  <button
                    className="flex w-full items-center justify-between text-left font-medium"
                    onClick={() => toggleFaq(8)}
                  >
                    How do I contact support?
                    <FiChevronDown
                      className={`transform transition ${openFaq === 8 ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openFaq === 8 && (
                    <p className="mt-2 text-gray-600">
                      You can reach our support team via email at support@lmsplatform.com or through
                      the live chat on our website.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ========== FLOATING WHATSAPP BUTTON ========== */}
      <a
        href="https://wa.me/919876543210?text=Hi!%20I%20want%20to%20learn%20more%20about%20your%20courses."
        target="_blank"
        rel="noopener noreferrer"
        className="group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 shadow-lg transition-all duration-300 hover:bg-green-600"
      >
        <FaWhatsapp size={32} className="text-white" />
        <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          Chat with us
        </span>
      </a>
    </div>
  );
};

export default Home;