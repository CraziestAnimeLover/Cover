import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import {
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiShoppingCart,
  FiChevronDown,
  FiBell,
} from 'react-icons/fi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect for glass navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleLogout = () => {
    dispatch(logout());
    setIsDropdownOpen(false);
    setIsOpen(false);
    navigate('/student-login');
  };

  // Nav links logic
  const navLinks = [{ name: 'Courses', path: '/courses' }];
  if (user) {
    if (user.role === 'student') {
      navLinks.push({ name: 'Dashboard', path: '/dashboard' });
      navLinks.push({ name: 'My Learning', path: '/my-learning' });
    } else if (user.role === 'instructor' || user.role === 'agent') {
      navLinks.push({ name: 'Agent Dashboard', path: '/agent/dashboard' });
      navLinks.push({ name: 'Earnings', path: '/agent/earnings' });
    } else if (user.role === 'admin') {
      navLinks.push({ name: 'Admin', path: '/admin/dashboard' });
    }
  }

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 shadow-xl'
            : 'bg-slate-900 border-b border-slate-800'
        } font-sans`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Brand Logo */}
            <div className="flex items-center">
              <Link
                to="/"
                className="flex-shrink-0 flex items-center gap-2.5 group transition-transform duration-200 hover:scale-[1.02]"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center text-white font-extrabold shadow-md shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-all">
                  Z
                </div>
                <div>
                  <h1 className="text-base font-black tracking-wider text-white leading-none">
                    LMS Platform
                  </h1>
                  <span className="text-[8px] tracking-[0.16em] text-orange-500 font-bold uppercase block mt-0.5">
                    Study Assistant
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {/* Nav Links */}
              <div className="flex items-center space-x-1 mr-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive(link.path)
                        ? 'text-white bg-orange-500/10 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {link.name}
                    {isActive(link.path) && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-orange-500 rounded-full" />
                    )}
                  </Link>
                ))}
              </div>

              {user ? (
                <div className="flex items-center space-x-3 border-l border-slate-800 pl-4">
                  {/* Notification Bell */}
                  <button className="relative p-2 text-slate-400 hover:text-orange-500 hover:bg-slate-800/40 rounded-xl transition-all group">
                    <FiBell className="text-xl" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-slate-900 group-hover:scale-125 transition-transform" />
                  </button>

                  {/* Cart Icon */}
                  <Link
                    to="/cart"
                    className="relative p-2 text-slate-400 hover:text-orange-500 hover:bg-slate-800/40 rounded-xl transition-all group"
                  >
                    <FiShoppingCart className="text-xl" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform">
                      0
                    </span>
                  </Link>

                  {/* User Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center space-x-2.5 p-1.5 pr-3 bg-slate-800/40 backdrop-blur-sm border border-slate-700/80 rounded-xl hover:bg-slate-800/60 transition-all duration-200"
                    >
                      <img
                        src={
                          user.avatar ||
                          `https://ui-avatars.com/api/?name=${user.name}&background=ff6b00&color=fff&bold=true&size=28`
                        }
                        alt={user.name}
                        className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-600"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-slate-200 max-w-[90px] truncate">
                          {user.name}
                        </span>
                        <FiChevronDown
                          size={14}
                          className={`text-slate-500 transition-transform duration-200 ${
                            isDropdownOpen ? 'rotate-180 text-orange-500' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl py-1.5 text-slate-300 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-2 border-b border-slate-800 mb-1">
                          <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                            Signed in as
                          </p>
                          <p className="text-xs font-bold text-white truncate mt-0.5">
                            {user.email || user.name}
                          </p>
                        </div>

                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-slate-800/60 hover:text-white transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <FiUser size={16} className="text-slate-400" />
                          Profile Settings
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors text-left font-medium"
                        >
                          <FiLogOut size={16} />
                          Logout session
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2.5 border-l border-slate-800 pl-4">
                  <Link
                    to="/student-login"
                    className="text-slate-300 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:bg-slate-800/60"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md shadow-orange-500/20 transition-all active:scale-95"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button + cart icon */}
            <div className="md:hidden flex items-center space-x-2">
              {user && (
                <Link to="/cart" className="relative p-2 text-slate-400 hover:text-orange-500 rounded-lg">
                  <FiShoppingCart size={20} />
                </Link>
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
              >
                {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer - separate from main content, with proper overlay */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${
          isOpen ? 'visible' : 'invisible'
        }`}
        style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsOpen(false)}
        />
        
        {/* Drawer panel */}
        <div
          className={`absolute top-0 right-0 h-full w-80 bg-slate-900/95 backdrop-blur-xl shadow-2xl border-l border-slate-800 transform transition-transform duration-300 ease-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-end p-4">
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-2.5 rounded-xl text-base font-medium transition-all ${
                    isActive(link.path)
                      ? 'bg-orange-500/10 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              {user ? (
                <div className="pt-4 mt-4 border-t border-slate-800 space-y-1">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800"
                    onClick={() => setIsOpen(false)}
                  >
                    <FiUser size={18} />
                    <span>Profile Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 text-left font-medium"
                  >
                    <FiLogOut size={18} />
                    <span>Logout session</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 pt-4 mt-2 border-t border-slate-800">
                  <Link
                    to="/student-login"
                    onClick={() => setIsOpen(false)}
                    className="border border-slate-700 text-slate-300 text-center py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="bg-gradient-to-r from-orange-500 to-amber-600 text-white text-center py-2.5 rounded-xl text-sm font-bold shadow-md"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;