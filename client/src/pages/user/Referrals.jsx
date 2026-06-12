import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { FiCopy, FiCheck, FiUsers, FiDollarSign, FiUserPlus, FiLink, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Referrals = () => {
  const { user } = useSelector((state) => state.auth);
  const [referralLink, setReferralLink] = useState('');
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, totalEarnings: 0 });
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [linkRes, referralsRes] = await Promise.all([
          api.get('/referrals/link'),
          api.get('/referrals/my-referrals')
        ]);
        setReferralLink(linkRes.data.referralLink);
        setStats(referralsRes.data.stats);
        setReferrals(referralsRes.data.referrals);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load referral data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Referral link copied');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 font-sans">
        <div className="animate-spin rounded-xl h-10 w-10 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1 font-sans selection:bg-orange-500/20 max-w-7xl mx-auto">
      
      {/* View Header */}
      <div className="border-b border-slate-100 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Referrals Portal</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Invite friends to join the LMS Platform and earn bonuses on their premium purchases.
          </p>
        </div>
      </div>

      {/* Analytics Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Referrals Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Referrals</p>
              <p className="text-3xl font-black text-slate-900 mt-2 tracking-tight">{stats.total}</p>
            </div>
            <div className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 border border-slate-100 shadow-inner">
              <FiUsers className="text-lg stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Completed Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Completed Actions</p>
              <p className="text-3xl font-black text-emerald-600 mt-2 tracking-tight">{stats.completed}</p>
            </div>
            <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100 shadow-inner">
              <FiCheck className="text-lg stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Pending Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending Approvals</p>
              <p className="text-3xl font-black text-amber-500 mt-2 tracking-tight">{stats.pending}</p>
            </div>
            <div className="w-11 h-11 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center border border-amber-100 shadow-inner">
              <FiTrendingUp className="text-lg stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Total Earnings Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Revenue</p>
              <p className="text-3xl font-black text-orange-600 mt-2 tracking-tight">₹{stats.totalEarnings.toLocaleString()}</p>
            </div>
            <div className="w-11 h-11 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center border border-orange-100 shadow-inner">
              <FiDollarSign className="text-lg stroke-[2.5]" />
            </div>
          </div>
        </div>

      </div>

      {/* Link Distribution Clipboard Panel */}
      <div className="bg-white border border-slate-100 rounded-[20px] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.02)]">
        <h2 className="text-base font-extrabold text-slate-900 tracking-tight mb-4 flex items-center gap-2">
          <FiLink className="text-orange-500" /> Personal Referral Link
        </h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm text-slate-700 font-medium outline-none shadow-inner"
            placeholder="Generating invite endpoint..."
          />
          <button
            type="button"
            onClick={copyLink}
            className={`h-12 px-6 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] select-none ${
              copied 
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10' 
                : 'bg-slate-900 hover:bg-orange-600 text-white shadow-md'
            }`}
          >
            {copied ? <FiCheck className="stroke-[2.5]" /> : <FiCopy />}
            <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
          </button>
        </div>
        <p className="text-xs text-slate-400 font-medium mt-3.5 leading-relaxed">
          Distribute this personal connection token across social network profiles. You immediately acquire platform commission points the exact moment a referred customer completes a checkout order.
        </p>
      </div>

      {/* History Ledger Table */}
      <div className="bg-white border border-slate-100 rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Your Referrals Ledger</h2>
        </div>
        
        {referrals.length === 0 ? (
          <div className="text-center py-16 border-t border-slate-50">
            <p className="text-slate-400 text-sm font-medium">No system tracking records discovered.</p>
            <p className="text-slate-400 text-xs font-medium mt-1">Circulate your connection link above to track dashboard analytics logs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-bold">User Name</th>
                  <th className="px-6 py-4 font-bold">Email Address</th>
                  <th className="px-6 py-4 font-bold">Joined Timestamp</th>
                  <th className="px-6 py-4 font-bold">Status Profile</th>
                  <th className="px-6 py-4 font-bold text-right">Commission Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 text-sm font-medium text-slate-700">
                {referrals.map((ref) => (
                  <tr key={ref._id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4 text-slate-900 font-bold tracking-tight">
                      {ref.referred?.name || 'Anonymous Scholar'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-normal">
                      {ref.referred?.email || '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-semibold text-xs">
                      {new Date(ref.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md border ${
                        ref.status === 'completed' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {ref.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-900 text-sm">
                      {ref.commissionEarned ? `₹${ref.commissionEarned.toLocaleString()}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Referrals;