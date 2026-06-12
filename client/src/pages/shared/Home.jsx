import { Link } from 'react-router-dom';
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
} from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="overflow-x-hidden bg-slate-900 text-white">
      {/* ========== HERO SECTION ========== */}
      <section className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-20 lg:py-32">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 text-center lg:text-left">
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-4 animate-fadeInUp">
              Start Learning With Us Now!
            </h2>
            <p className="text-lg text-slate-300 mb-8 animate-fadeInUp delay-100">
              Cras faucibus ornare ipsum, non luctus leo imperdiet sit amet. Praesent egestas orci eu risus iaculis luctus.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <input
                type="email"
                placeholder="Your Email Address..."
                className="px-5 py-3 rounded-full text-slate-800 w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button className="bg-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition shadow-lg">
                Subscribe Now
              </button>
            </div>
          </div>
          <div className="lg:w-1/2 mt-12 lg:mt-0 flex justify-center">
            <img src="/img/slider/slider_img05.png" alt="Learning" className="max-w-md animate-float" />
          </div>
        </div>
      </section>

      {/* ========== ABOUT SECTION ========== */}
      <section className="py-20 bg-slate-800">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 relative">
            <img src="/img/features/about_img.png" alt="About" className="rounded-2xl shadow-xl" />
            <div className="absolute -bottom-6 -left-6 bg-orange-500 text-white rounded-lg p-4 shadow-lg">
              <h3 className="text-4xl font-bold">50</h3>
              <span>years of<br />experience</span>
            </div>
          </div>
          <div className="lg:w-1/2">
            <span className="text-orange-400 font-semibold tracking-wide">About</span>
            <h2 className="text-3xl lg:text-4xl font-bold mt-2 mb-4 text-white">Welcome To Online Class Educato</h2>
            <p className="text-slate-300 mb-4">
              Curabitur tristique, sem id sagittis varius, lacus ligula mollis dui, ac condimentum felis metus ut nulla.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2 text-slate-300">
                <FiStar className="text-orange-500 mt-1" />
                <span>Nulla pellentesque posuere metus, sed hendrerit purus venenatis in.</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <FiStar className="text-orange-500 mt-1" />
                <span>Etiam quis lacinia ipsum. Aliquam blandit, mauris nec molestie interdum.</span>
              </li>
            </ul>
            <Link to="/about" className="inline-block bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition">
              Read More
            </Link>
          </div>
        </div>
      </section>

      {/* ========== VIDEO SECTION ========== */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4 text-center">
          <span className="text-orange-400 font-semibold">Watch Us</span>
          <h2 className="text-3xl lg:text-4xl font-bold mt-2 mb-8 text-white">Start Growing With Community</h2>
          <div className="relative max-w-3xl mx-auto">
            <img src="/img/video/vedio-img.png" alt="Video" className="rounded-2xl shadow-2xl" />
            <a
              href="https://www.youtube.com/watch?v=gyGsPlt06bo"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="bg-orange-500 rounded-full p-5 shadow-lg hover:scale-110 transition">
                <FiPlay className="text-white text-3xl" />
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ========== SERVICES SECTION ========== */}
      <section className="py-20 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="lg:flex justify-between items-end mb-12">
            <div className="lg:w-2/5">
              <span className="text-orange-400 font-semibold">Services</span>
              <h2 className="text-3xl lg:text-4xl font-bold mt-2 text-white">What We Provide To You</h2>
              <p className="text-slate-300 mt-4">
                Pellentesque fringilla, massa sit amet feugiat mollis, leo turpis elementum justo.
              </p>
              <Link to="/services" className="inline-block mt-6 bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition">
                View All Services
              </Link>
            </div>
            <div className="lg:w-3/5 mt-8 lg:mt-0">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { icon: '/img/icon/pv-icon1.png', title: 'Skilled Lecturers', desc: 'Cras ornare sagittis tortor a facilisis.' },
                  { icon: '/img/icon/pv-icon2.png', title: 'Hot Stone Message', desc: 'Cras ornare sagittis tortor a facilisis.' },
                  { icon: '/img/icon/pv-icon3.png', title: 'Book Library', desc: 'Cras ornare sagittis tortor a facilisis.' },
                  { icon: '/img/icon/pv-icon4.png', title: 'Online Classes', desc: 'Cras ornare sagittis tortor a facilisis.' },
                  { icon: '/img/icon/pv-icon5.png', title: 'Home Projects', desc: 'Cras ornare sagittis tortor a facilisis.' },
                  { icon: '/img/icon/pv-icon6.png', title: '24x7 Support', desc: 'Cras ornare sagittis tortor a facilisis.' },
                ].map((service, idx) => (
                  <div key={idx} className="bg-slate-700/50 p-6 rounded-xl text-center hover:shadow-lg transition">
                    <img src={service.icon} alt={service.title} className="mx-auto h-16 mb-4" />
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
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-orange-400 font-semibold">Best Courses</span>
            <h2 className="text-3xl lg:text-4xl font-bold mt-2 text-white">Featured Courses</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition">
                <img src={`/img/featured-courses/courses-img${i}.png`} alt="Course" className="w-full h-56 object-cover" />
                <div className="p-5">
                  <span className="text-orange-400 text-sm font-semibold">3 Years</span>
                  <h3 className="text-xl font-bold text-white mt-1">Civil Engineering</h3>
                  <Link to="/courses/details" className="inline-block mt-4 text-orange-400 font-medium hover:underline">Learn More →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== UPCOMING EVENTS ========== */}
      <section className="py-20 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-orange-400 font-semibold">Our Events</span>
            <h2 className="text-3xl lg:text-4xl font-bold mt-2 text-white">Upcoming Events</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { day: 18, month: 'March, 2021', title: 'Cras faucibus ornare ipsum luctus.', time: '9:00Am - 3:00Pm', place: 'Mumbai, India' },
              { day: 3, month: 'Jun, 2021', title: 'Cras faucibus ornare ipsum luctus.', time: '9:00Am - 3:00Pm', place: 'Mumbai, India' },
              { day: 7, month: 'March, 2021', title: 'Cras faucibus ornare ipsum luctus.', time: '9:00Am - 3:00Pm', place: 'Mumbai, India' },
              { day: 17, month: 'Jan, 2021', title: 'Cras faucibus ornare ipsum luctus.', time: '9:00Am - 3:00Pm', place: 'Mumbai, India' },
            ].map((event, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-4 bg-slate-700/50 p-5 rounded-xl shadow-sm hover:shadow-md transition">
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
            <Link to="/events" className="inline-block bg-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition">
              View All Events
            </Link>
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-12">
          <div className="lg:w-2/5">
            <span className="text-orange-400 font-semibold">Testimonial</span>
            <h2 className="text-3xl lg:text-4xl font-bold mt-2 text-white">See What Our Client Say’s</h2>
            <p className="text-slate-300 mt-4">
              Curabitur tristique, sem id sagittis varius, lacus ligula mollis dui, ac condimentum felis metus ut nulla.
            </p>
          </div>
          <div className="lg:w-3/5">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <img src="/img/testimonial/testi_avatar.png" alt="Avatar" className="w-14 h-14 rounded-full" />
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
      <section className="py-20 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-orange-400 font-semibold">Our Blog</span>
            <h2 className="text-3xl lg:text-4xl font-bold mt-2 text-white">Latest News Feed</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-700/50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition">
                <img src={`/img/blog/blog_img0${i}.png`} alt="Blog" className="w-full h-56 object-cover" />
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