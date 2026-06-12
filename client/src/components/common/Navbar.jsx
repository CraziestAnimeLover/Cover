import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../features/auth/authSlice'
import { FiMenu, FiX, FiUser, FiLogOut, FiShoppingCart, FiChevronDown } from 'react-icons/fi'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    setIsDropdownOpen(false)
    setIsOpen(false)
    navigate('/login')
  }

  // Removed 'Home' from navLinks
  const navLinks = [
    { name: 'Courses', path: '/courses' },
  ]

  if (user) {
    if (user.role === 'student') {
      navLinks.push({ name: 'Dashboard', path: '/dashboard' })
      navLinks.push({ name: 'My Learning', path: '/my-learning' })
    } else if (user.role === 'instructor' || user.role === 'agent') {
      navLinks.push({ name: 'Agent Dashboard', path: '/agent/dashboard' })
      navLinks.push({ name: 'Earnings', path: '/agent/earnings' })
    } else if (user.role === 'admin') {
      navLinks.push({ name: 'Admin', path: '/admin/dashboard' })
    }
  }

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 font-sans selection:bg-orange-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Left Side: Brand Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center text-white font-extrabold shadow-md shadow-orange-500/10 transition-transform group-hover:scale-105">
                Z
              </div>
              <div>
                <h1 className="text-base font-black tracking-wider text-white leading-none">LMS Platform</h1>
                <span className="text-[8px] tracking-[0.16em] text-orange-500 font-bold uppercase block mt-0.5">Study Assistant</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <div className="flex items-center space-x-1 mr-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-slate-300 hover:text-white hover:bg-slate-800/60 px-3.5 py-2 rounded-xl text-sm font-medium transition-all"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            {user ? (
              <div className="flex items-center space-x-4 border-l border-slate-800 pl-4">
                <Link to="/cart" className="relative p-2 text-slate-400 hover:text-orange-500 hover:bg-slate-800/40 rounded-xl transition-all group">
                  <FiShoppingCart className="text-xl" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-slate-900 scale-0 group-hover:scale-100 transition-transform" />
                </Link>

                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                    className="flex items-center space-x-2.5 p-1.5 pr-3 bg-slate-950/40 border border-slate-800/80 rounded-xl hover:bg-slate-800/40 transition-all text-left"
                  >
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=ff6b00&color=fff`}
                      alt={user.name}
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-700/50"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-slate-200 max-w-[90px] truncate">{user.name}</span>
                      <FiChevronDown size={14} className={`text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180 text-orange-500' : ''}`} />
                    </div>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1.5 text-slate-300 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-800 mb-1">
                        <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Signed in as</p>
                        <p className="text-xs font-bold text-white truncate mt-0.5">{user.email || user.name}</p>
                      </div>
                      
                      <Link to="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-slate-800/60 hover:text-white transition-colors">
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
                <Link to="/login" className="text-slate-300 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                  Login
                </Link>
                <Link to="/register" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-orange-500/10 transition-all active:scale-95">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {user && (
              <Link to="/cart" className="p-2 text-slate-400 hover:text-orange-500 rounded-lg">
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

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-md animate-in slide-in-from-top duration-200">
          <div className="px-3 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block px-4 py-2.5 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
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
                <Link to="/login" onClick={() => setIsOpen(false)} className="border border-slate-700 text-slate-300 text-center py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800">
                  Login
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="bg-orange-500 text-white text-center py-2.5 rounded-xl text-sm font-bold shadow-md">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar