import { useState, useEffect } from 'react';
import { FiCopy, FiCheck, FiUsers, FiDollarSign } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AgentReferrals = () => {
  const [referralLink, setReferralLink] = useState('');
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    totalEarnings: 0
  });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const [linkRes, referralsRes] = await Promise.all([
        api.get('/referrals/link'),
        api.get('/referrals/my-referrals')
      ]);
      
      setReferralLink(linkRes.data.referralLink);
      setReferrals(referralsRes.data.referrals);
      setStats(referralsRes.data.stats);
    } catch (error) {
      toast.error('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Referral link copied!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Referrals & Commissions</h1>
        <p className="text-gray-600">Track your referrals and earn commission</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Referrals</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <FiUsers className="text-3xl text-primary" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <FiCheck className="text-3xl text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <FiUsers className="text-3xl text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Earnings</p>
              <p className="text-2xl font-bold text-primary">₹{stats.totalEarnings}</p>
            </div>
            <FiDollarSign className="text-3xl text-primary" />
          </div>
        </div>
      </div>

      {/* Referral Link */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4">Your Referral Link</h2>
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 input bg-gray-50"
          />
          <button
            onClick={copyLink}
            className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            {copied ? <FiCheck /> : <FiCopy />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Share this link with friends. You earn commission when they purchase courses!
        </p>
      </div>

      {/* Referral List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4">Your Referrals</h2>
        <div className="space-y-3">
          {referrals.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No referrals yet. Share your link!</p>
          ) : (
            referrals.map((referral) => (
              <div key={referral._id} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{referral.referred?.name || 'User'}</p>
                  <p className="text-sm text-gray-500">{referral.referred?.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">Joined: {new Date(referral.createdAt).toLocaleDateString()}</p>
                  <p className={`text-xs ${referral.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}`}>
                    {referral.status}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentReferrals;