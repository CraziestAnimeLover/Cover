import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiX, FiInfo, FiAward, FiUsers, FiDollarSign, FiBookOpen } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    avatar: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.put('/auth/profile', formData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      // Update local user data
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-1 font-sans selection:bg-orange-500/20">
      <div className="bg-white border border-slate-100 rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.02)] overflow-hidden">
        
        {/* Header Block with Dark Slate Layout */}
        <div className="bg-slate-900 px-6 py-8 relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
            <div>
              <span className="text-[10px] bg-orange-500 text-white font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-md border border-orange-400/20 inline-block mb-2">
                User Settings
              </span>
              <h1 className="text-2xl font-black text-white tracking-tight">My Profile</h1>
              <p className="text-slate-400 text-xs font-medium mt-0.5">Manage and update your global system identity parameters.</p>
            </div>
            
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 text-xs font-bold bg-white text-slate-900 border border-slate-200 px-4 py-2.5 rounded-xl transition-all hover:bg-slate-50 shadow-sm self-start sm:self-auto active:scale-[0.98]"
              >
                <FiEdit2 className="text-orange-500" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl transition-all"
                >
                  <FiX />
                  <span>Cancel</span>
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl transition-all shadow-md shadow-orange-500/10 disabled:opacity-40"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <FiSave />
                  )}
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Identity Summary Badge */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 border-b border-slate-50 pb-6 mb-8">
            <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 relative group shadow-sm overflow-hidden flex-shrink-0">
              {formData.avatar ? (
                <img src={formData.avatar} alt={formData.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              ) : (
                <FiUser size={28} className="stroke-[2]" />
              )}
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{formData.name || 'User Scholar'}</h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                <span className="inline-block bg-orange-500/[0.08] text-orange-600 font-bold border border-orange-500/10 text-[10px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  {user?.role || 'Member'}
                </span>
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                  • Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>
          </div>

          {/* Form Control Architecture */}
          <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-white px-1.5 absolute -top-2 left-3.5 z-10">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full h-12 border rounded-xl pl-11 pr-4 outline-none text-sm text-slate-900 font-medium transition-all ${
                    !isEditing 
                      ? 'bg-slate-50/50 border-slate-100 text-slate-500' 
                      : 'border-slate-200 focus:border-orange-500'
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-white px-1.5 absolute -top-2 left-3.5 z-10">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full h-12 border rounded-xl pl-11 pr-4 outline-none text-sm text-slate-900 font-medium transition-all ${
                    !isEditing 
                      ? 'bg-slate-50/50 border-slate-100 text-slate-500' 
                      : 'border-slate-200 focus:border-orange-500'
                  }`}
                  placeholder="name@domain.com"
                />
              </div>
            </div>

            <div className="relative md:col-span-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-white px-1.5 absolute -top-2 left-3.5 z-10">Phone Number</label>
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full h-12 border rounded-xl pl-11 pr-4 outline-none text-sm text-slate-900 font-medium transition-all ${
                    !isEditing 
                      ? 'bg-slate-50/50 border-slate-100 text-slate-500' 
                      : 'border-slate-200 focus:border-orange-500'
                  }`}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="relative md:col-span-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-white px-1.5 absolute -top-2 left-3.5 z-10">Bio Description</label>
              <textarea
                name="bio"
                rows="4"
                value={formData.bio}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full border rounded-xl p-4 text-sm text-slate-900 font-medium outline-none transition-all resize-none ${
                  !isEditing 
                    ? 'bg-slate-50/50 border-slate-100 text-slate-500' 
                    : 'border-slate-200 focus:border-orange-500'
                }`}
                placeholder="Tell us about yourself..."
              />
            </div>
          </form>

          {/* Account Metrics Grid Card Base */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <FiInfo className="stroke-[2.5]" /> Performance Ledger
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Courses */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wide">Total Courses</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">0</p>
                </div>
                <div className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                  <FiBookOpen size={14} />
                </div>
              </div>

              {/* Certificates */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wide">Certificates</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">0</p>
                </div>
                <div className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                  <FiAward size={14} />
                </div>
              </div>

              {/* Referrals */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wide">Referrals</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">0</p>
                </div>
                <div className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                  <FiUsers size={14} />
                </div>
              </div>

              {/* Earnings */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wide">Total Earned</p>
                  <p className="text-2xl font-black text-orange-600 mt-1">₹0</p>
                </div>
                <div className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                  <FiDollarSign size={14} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;