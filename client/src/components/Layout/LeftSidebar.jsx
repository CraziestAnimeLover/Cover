import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiBookOpen,
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiSettings,
  FiUser,
  FiLink,
  FiBarChart2,
  FiGrid,
  FiLayers,
  FiAward,
  FiUserCheck,
  FiSliders,
  FiCompass,
  FiLogOut
} from 'react-icons/fi';

const LeftSidebar = () => {
  const { user } = useSelector((state) => state.auth);

  // Student Menu Items
  const studentMenu = [
    { name: 'Dashboard', path: '/dashboard', icon: FiGrid },
    { name: 'My Learning', path: '/my-learning', icon: FiBookOpen },
    { name: 'My Progress', path: '/my-progress', icon: FiTrendingUp },
    { name: 'Certificates', path: '/certificates', icon: FiAward },
    { name: 'Referrals', path: '/referrals', icon: FiLink },
    { name: 'Profile', path: '/profile', icon: FiUser },
  ];

  // Instructor/Agent Menu Items
  const agentMenu = [
    { name: 'Dashboard', path: '/agent/dashboard', icon: FiGrid },
    { name: 'My Courses', path: '/agent/courses', icon: FiBookOpen },
    { name: 'Create Course', path: '/agent/courses/create', icon: FiLayers },
    { name: 'Earnings', path: '/agent/earnings', icon: FiDollarSign },
    { name: 'Referrals', path: '/agent/referrals', icon: FiLink },
    { name: 'Analytics', path: '/agent/analytics', icon: FiBarChart2 },
    { name: 'Profile', path: '/profile', icon: FiUser },
  ];

  // Admin Menu Items (Full list)
  const adminMenu = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: FiGrid },
    { name: 'Users', path: '/admin/users', icon: FiUsers },
    { name: 'Network Explorer', path: '/admin/network', icon: FiUsers },
    { name: 'Courses', path: '/admin/courses', icon: FiBookOpen },
    { name: 'Pending KYC', path: '/admin/pending-kyc', icon: FiUserCheck },
    { name: 'Payouts', path: '/admin/payouts', icon: FiDollarSign },
    { name: 'Commission Config', path: '/admin/commission-config', icon: FiSliders },
    { name: 'Analytics', path: '/admin/analytics', icon: FiBarChart2 },
    { name: 'Settings', path: '/admin/settings', icon: FiSettings },
    { name: 'Profile', path: '/profile', icon: FiUser },
  ];

  // Select menu based on user role
  let menuItems = [];
  if (user?.role === 'student') {
    menuItems = studentMenu;
  } else if (user?.role === 'instructor' || user?.role === 'agent') {
    menuItems = agentMenu;
  } else if (user?.role === 'admin') {
    menuItems = adminMenu;
  }

  // If no user or role not recognized, return null
  if (!user || menuItems.length === 0) {
    return null;
  }

  return (
    <aside className="w-68 bg-slate-900 text-slate-400 h-screen sticky top-0 flex flex-col justify-between flex-shrink-0 border-r border-slate-800 shadow-2xl font-sans">
      
      {/* Top Container */}
      <div className="flex flex-col overflow-y-auto flex-1">
        
        {/* Modern Header Branding Area */}
        {/* <div className="h-20 px-6 flex items-center border-b border-slate-800 gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center text-white font-extrabold shadow-lg shadow-orange-500/20">
            Z
          </div>
          <div>
            <h1 className="text-base font-black tracking-wider text-white leading-none">ZENTASK</h1>
            <span className="text-[9px] tracking-[0.18em] text-orange-500 font-bold uppercase block mt-1">Study Assistant</span>
          </div>
        </div> */}

        {/* Dynamic Navigation Links Block */}
        <nav className="p-4 flex-1">
          <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase px-3 block mb-3">
            Main Menu
          </span>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/dashboard' || item.path === '/agent/dashboard' || item.path === '/admin/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold shadow-md shadow-orange-500/10'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center space-x-3.5">
                        <Icon className={`text-lg transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-400'}`} />
                        <span className="text-sm tracking-wide">{item.name}</span>
                      </div>
                      {/* Interactive pill indicator for active link styles */}
                      {isActive && (
                        <span className="w-1.5 h-5 bg-white rounded-full absolute right-0 top-1/2 -translate-y-1/2" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Bottom Layout Blocks */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        
        {/* Conditional Component Area for Admin Role */}
        {user?.role === 'admin' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 mb-4 shadow-inner">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
              Platform Metrics
            </h4>
            <div className="space-y-2.5 text-xs font-medium">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Users</span>
                <span className="text-white bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700/50">—</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Courses</span>
                <span className="text-white bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700/50">—</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Pending KYC</span>
                <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md font-semibold">—</span>
              </div>
            </div>
          </div>
        )}

        {/* Conditional Component Area for Student Role */}
        {user?.role === 'student' && (
          <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-4 mb-4 shadow-lg shadow-orange-500/10 group">
            {/* Ambient background decoration bubbles */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-md transition-transform duration-500 group-hover:scale-110" />
            <div className="relative z-10">
              <h4 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                <FiCompass className="animate-spin-slow" />
                Invite & Earn
              </h4>
              <p className="text-[11px] text-orange-100 opacity-90 mt-1 leading-relaxed">
                Get a <span className="font-bold text-white text-xs">20% commission</span> for every friend who signs up.
              </p>
              <button className="bg-white hover:bg-orange-50 text-orange-600 px-3 py-2 rounded-lg text-xs font-bold w-full mt-3.5 transition-all shadow-sm active:scale-95">
                Generate Referral Link
              </button>
            </div>
          </div>
        )}

        {/* Premium User Information Footnote Card */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/60 shadow-sm">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="relative flex-shrink-0">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=ff6b00&color=fff`}
                alt={user?.name}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-800"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-xs text-white truncate">{user?.name}</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{user?.role}</p>
            </div>
          </div>
          <button 
            type="button" 
            title="Log Out"
            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <FiLogOut size={16} />
          </button>
        </div>

      </div>
    </aside>
  );
};

export default LeftSidebar;