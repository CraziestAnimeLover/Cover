import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  FiBook,
  FiUsers,
  FiTrendingUp,
  FiAward,
  FiPlay,
  FiStar,
  FiCalendar,
  FiMapPin,
  FiClock,
  FiMail,
  FiPhone,
  FiChevronRight,
  FiPlayCircle,
  FiGift,
} from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  // Refs for sections
  const heroRef = useRef(null);
  const heroImageRef = useRef(null);
  const aboutRef = useRef(null);
  const videoRef = useRef(null);
  const servicesRef = useRef(null);
  const coursesRef = useRef(null);
  const eventsRef = useRef(null);
  const testimonialsRef = useRef(null);
  const blogRef = useRef(null);

  // Refs for cards to apply hover animations
  const serviceCardsRef = useRef([]);
  const courseCardsRef = useRef([]);
  const eventCardsRef = useRef([]);
  const blogCardsRef = useRef([]);

  useEffect(() => {
    // Hero section animation (on load)
    const tl = gsap.timeline();
    tl.fromTo(
      heroRef.current?.querySelectorAll('.animate-item'),
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'power2.out' }
    );
    tl.fromTo(
      heroImageRef.current,
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1, ease: 'back.out(1.2)' },
      '-=0.5'
    );

    // Scroll-triggered animations
    const sections = [
      { ref: aboutRef, id: 'about', y: 60 },
      { ref: videoRef, id: 'video', y: 50 },
      { ref: servicesRef, id: 'services', y: 60 },
      { ref: coursesRef, id: 'courses', y: 60 },
      { ref: eventsRef, id: 'events', y: 60 },
      { ref: testimonialsRef, id: 'testimonials', y: 50 },
      { ref: blogRef, id: 'blog', y: 60 },
    ];

    sections.forEach((section) => {
      if (section.ref.current) {
        gsap.fromTo(
          section.ref.current.querySelectorAll('.scroll-item'),
          { y: section.y, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section.ref.current,
              start: 'top 80%',
              end: 'bottom 20%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    });

    // Stagger animations for cards
    if (serviceCardsRef.current.length) {
      gsap.fromTo(
        serviceCardsRef.current,
        { scale: 0.9, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(0.8)',
          scrollTrigger: {
            trigger: servicesRef.current,
            start: 'top 80%',
          },
        }
      );
    }

    if (courseCardsRef.current.length) {
      gsap.fromTo(
        courseCardsRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: coursesRef.current,
            start: 'top 80%',
          },
        }
      );
    }

    if (eventCardsRef.current.length) {
      gsap.fromTo(
        eventCardsRef.current,
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: eventsRef.current,
            start: 'top 85%',
          },
        }
      );
    }

    if (blogCardsRef.current.length) {
      gsap.fromTo(
        blogCardsRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          scrollTrigger: {
            trigger: blogRef.current,
            start: 'top 85%',
          },
        }
      );
    }

    // Cleanup ScrollTrigger on unmount
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Hover animations for cards
  const onCardHover = (card, isEnter) => {
    gsap.to(card, {
      scale: isEnter ? 1.03 : 1,
      boxShadow: isEnter ? '0 20px 25px -12px rgba(0,0,0,0.3)' : '0 10px 15px -3px rgba(0,0,0,0.1)',
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  return (
    <div className="overflow-x-hidden bg-slate-900 text-white">
      {/* ========== HERO SECTION ========== */}
      <section ref={heroRef} className="bg-gradient-to-br from-slate-800 via-slate-900 to-orange-900/20 text-white py-20 lg:py-32">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 text-center lg:text-left">
            <h2 className="animate-item text-4xl lg:text-5xl font-bold leading-tight mb-4">
              Start Learning With Us Now!
            </h2>
            <p className="animate-item text-lg text-slate-300 mb-8">
              Cras faucibus ornare ipsum, non luctus leo imperdiet sit amet. Praesent egestas orci eu risus iaculis luctus.
            </p>
            <div className="animate-item flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <input
                type="email"
                placeholder="Your Email Address..."
                className="px-5 py-3 rounded-full text-slate-800 w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button className="bg-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition shadow-lg hover:shadow-orange-500/20">
                Subscribe Now
              </button>
            </div>
          </div>
          <div className="lg:w-1/2 mt-12 lg:mt-0 flex justify-center">
            <img
              ref={heroImageRef}
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=500&fit=crop"
              alt="Learning"
              className="max-w-md rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* ========== ABOUT SECTION ========== */}
      <section ref={aboutRef} className="py-20 bg-slate-800">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 relative scroll-item">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&h=400&fit=crop"
              alt="About"
              className="rounded-2xl shadow-xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-orange-500 text-white rounded-lg p-4 shadow-lg">
              <h3 className="text-4xl font-bold">50</h3>
              <span>years of<br />experience</span>
            </div>
          </div>
          <div className="lg:w-1/2">
            <span className="text-orange-400 font-semibold tracking-wide scroll-item">About</span>
            <h2 className="text-3xl lg:text-4xl font-bold mt-2 mb-4 text-white scroll-item">Welcome To Online Class Educato</h2>
            <p className="text-slate-300 mb-4 scroll-item">
              Curabitur tristique, sem id sagittis varius, lacus ligula mollis dui, ac condimentum felis metus ut nulla.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2 text-slate-300 scroll-item">
                <FiStar className="text-orange-500 mt-1" />
                <span>Nulla pellentesque posuere metus, sed hendrerit purus venenatis in.</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300 scroll-item">
                <FiStar className="text-orange-500 mt-1" />
                <span>Etiam quis lacinia ipsum. Aliquam blandit, mauris nec molestie interdum.</span>
              </li>
            </ul>
            <Link
              to="/about"
              className="inline-block bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition shadow-md scroll-item"
            >
              Read More
            </Link>
          </div>
        </div>
      </section>

      {/* ========== VIDEO SECTION ========== */}
      <section ref={videoRef} className="py-20 bg-slate-900">
        <div className="container mx-auto px-4 text-center">
          <span className="text-orange-400 font-semibold scroll-item">Watch Us</span>
          <h2 className="text-3xl lg:text-4xl font-bold mt-2 mb-8 text-white scroll-item">Start Growing With Community</h2>
          <div className="relative max-w-3xl mx-auto scroll-item">
            <img
              src="https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=800&h=450&fit=crop"
              alt="Video"
              className="rounded-2xl shadow-2xl"
            />
            <a
              href="https://www.youtube.com/watch?v=gyGsPlt06bo"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="bg-orange-500 rounded-full p-5 shadow-lg hover:scale-110 transition duration-300">
                <FiPlay className="text-white text-3xl" />
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ========== SERVICES SECTION ========== */}
      <section ref={servicesRef} className="py-20 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="lg:flex justify-between items-end mb-12">
            <div className="lg:w-2/5">
              <span className="text-orange-400 font-semibold scroll-item">Services</span>
              <h2 className="text-3xl lg:text-4xl font-bold mt-2 text-white scroll-item">What We Provide To You</h2>
              <p className="text-slate-300 mt-4 scroll-item">
                Pellentesque fringilla, massa sit amet feugiat mollis, leo turpis elementum justo.
              </p>
              <Link
                to="/services"
                className="inline-block mt-6 bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition scroll-item"
              >
                View All Services
              </Link>
            </div>
            <div className="lg:w-3/5 mt-8 lg:mt-0">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { icon: '📚', title: 'Skilled Lecturers', desc: 'Cras ornare sagittis tortor a facilisis.' },
                  { icon: '🔥', title: 'Hot Stone Message', desc: 'Cras ornare sagittis tortor a facilisis.' },
                  { icon: '📖', title: 'Book Library', desc: 'Cras ornare sagittis tortor a facilisis.' },
                  { icon: '💻', title: 'Online Classes', desc: 'Cras ornare sagittis tortor a facilisis.' },
                  { icon: '🏠', title: 'Home Projects', desc: 'Cras ornare sagittis tortor a facilisis.' },
                  { icon: '🛡️', title: '24x7 Support', desc: 'Cras ornare sagittis tortor a facilisis.' },
                ].map((service, idx) => (
                  <div
                    key={idx}
                    ref={(el) => (serviceCardsRef.current[idx] = el)}
                    className="bg-slate-700/50 p-6 rounded-xl text-center hover:shadow-lg transition cursor-pointer"
                    onMouseEnter={() => onCardHover(serviceCardsRef.current[idx], true)}
                    onMouseLeave={() => onCardHover(serviceCardsRef.current[idx], false)}
                  >
                    <div className="text-5xl mb-4">{service.icon}</div>
                    <h3 className="text-xl font-semibold text-white mb-2">{service.title}</h3>
                    <p className="text-slate-300 text-sm">{service.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FEATURED COURSES ========== */}
      <section ref={coursesRef} className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-orange-400 font-semibold scroll-item">Best Courses</span>
            <h2 className="text-3xl lg:text-4xl font-bold mt-2 text-white scroll-item">Featured Courses</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i, idx) => (
              <div
                key={i}
                ref={(el) => (courseCardsRef.current[idx] = el)}
                className="bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition cursor-pointer"
                onMouseEnter={() => onCardHover(courseCardsRef.current[idx], true)}
                onMouseLeave={() => onCardHover(courseCardsRef.current[idx], false)}
              >
                <img
                  src={`https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop&random=${i}`}
                  alt="Course"
                  className="w-full h-56 object-cover"
                />
                <div className="p-5">
                  <span className="text-orange-400 text-sm font-semibold">3 Years</span>
                  <h3 className="text-xl font-bold text-white mt-1">Civil Engineering</h3>
                  <Link to="/courses/details" className="inline-block mt-4 text-orange-400 font-medium hover:underline">
                    Learn More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== UPCOMING EVENTS ========== */}
      <section ref={eventsRef} className="py-20 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-orange-400 font-semibold scroll-item">Our Events</span>
            <h2 className="text-3xl lg:text-4xl font-bold mt-2 text-white scroll-item">Upcoming Events</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { day: 18, month: 'March, 2021', title: 'Cras faucibus ornare ipsum luctus.', time: '9:00Am - 3:00Pm', place: 'Mumbai, India' },
              { day: 3, month: 'Jun, 2021', title: 'Cras faucibus ornare ipsum luctus.', time: '9:00Am - 3:00Pm', place: 'Mumbai, India' },
              { day: 7, month: 'March, 2021', title: 'Cras faucibus ornare ipsum luctus.', time: '9:00Am - 3:00Pm', place: 'Mumbai, India' },
              { day: 17, month: 'Jan, 2021', title: 'Cras faucibus ornare ipsum luctus.', time: '9:00Am - 3:00Pm', place: 'Mumbai, India' },
            ].map((event, idx) => (
              <div
                key={idx}
                ref={(el) => (eventCardsRef.current[idx] = el)}
                className="flex flex-col sm:flex-row gap-4 bg-slate-700/50 p-5 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
                onMouseEnter={() => onCardHover(eventCardsRef.current[idx], true)}
                onMouseLeave={() => onCardHover(eventCardsRef.current[idx], false)}
              >
                <div className="bg-orange-500 text-white rounded-lg text-center p-4 min-w-[100px]">
                  <h3 className="text-3xl font-bold">{event.day}</h3>
                  <span>{event.month}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{event.title}</h3>
                  <div className="flex flex-wrap gap-4 text-slate-300 text-sm mb-2">
                    <span className="flex items-center gap-1"><FiClock /> {event.time}</span>
                    <span className="flex items-center gap-1"><FiMapPin /> {event.place}</span>
                  </div>
                  <p className="text-slate-400">Phasellus maximus orci metus. Nullam enim ex, facilisis at lacinia sed.</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/events"
              className="inline-block bg-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition scroll-item"
            >
              View All Events
            </Link>
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section ref={testimonialsRef} className="py-20 bg-slate-900">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-12">
          <div className="lg:w-2/5">
            <span className="text-orange-400 font-semibold scroll-item">Testimonial</span>
            <h2 className="text-3xl lg:text-4xl font-bold mt-2 text-white scroll-item">See What Our Client Say’s</h2>
            <p className="text-slate-300 mt-4 scroll-item">
              Curabitur tristique, sem id sagittis varius, lacus ligula mollis dui, ac condimentum felis metus ut nulla.
            </p>
          </div>
          <div className="lg:w-3/5">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-lg scroll-item">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src="https://randomuser.me/api/portraits/women/68.jpg"
                  alt="Avatar"
                  className="w-14 h-14 rounded-full"
                />
                <div>
                  <h4 className="font-bold text-white text-lg">Eity Akhter</h4>
                  <span className="text-slate-400">Student</span>
                </div>
              </div>
              <p className="text-slate-300 italic">
                “Etiam quis lacinia ipsum. Aliquam blandit, mauris nec molestie interdum, quam massa finibus turpis, ut eleifend tellus massa eget nunc.”
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== BLOG SECTION ========== */}
      <section ref={blogRef} className="py-20 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-orange-400 font-semibold scroll-item">Our Blog</span>
            <h2 className="text-3xl lg:text-4xl font-bold mt-2 text-white scroll-item">Latest News Feed</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i, idx) => (
              <div
                key={i}
                ref={(el) => (blogCardsRef.current[idx] = el)}
                className="bg-slate-700/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition cursor-pointer"
                onMouseEnter={() => onCardHover(blogCardsRef.current[idx], true)}
                onMouseLeave={() => onCardHover(blogCardsRef.current[idx], false)}
              >
                <img
                  src={`https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&h=400&fit=crop&random=${i}`}
                  alt="Blog"
                  className="w-full h-56 object-cover"
                />
                <div className="p-6 text-center">
                  <div className="text-slate-400 text-sm mb-2 flex items-center justify-center gap-1"><FiCalendar /> 7 March, 2019</div>
                  <h3 className="text-xl font-semibold text-white mb-3">How do I Sell Affiliate Products to My Customers</h3>
                  <Link to="/blog/details" className="text-orange-400 font-medium inline-flex items-center gap-1 hover:gap-2 transition">
                    Read More <FiChevronRight />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;