import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  FiUsers, FiDollarSign, FiTrendingUp, FiAward, 
  FiLink, FiCopy, FiCheck, FiDownload, FiEye 
} from 'react-icons/fi';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import api from '../../services/api';
import toast from 'react-hot-toast';
import KYCModal from '../affiliate/KYCModal';
import WithdrawModal from '../affiliate/WithdrawModal';
import MLMTreeGraph from '../../components/affiliate/MLMTreeGraph';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AffiliateDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState(null);
  const [downlineActivity, setDownlineActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [chartPeriod, setChartPeriod] = useState('month');
  const [chartData, setChartData] = useState({ labels: [], earnings: [] });

  useEffect(() => {
    fetchDashboardData();
    fetchChartData();
  }, [chartPeriod]);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, activityRes] = await Promise.all([
        api.get('/affiliate/dashboard'),
        api.get('/affiliate/downline-activity')
      ]);
      setDashboardData(dashboardRes.data);
      setDownlineActivity(activityRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const res = await api.get(`/affiliate/earnings-chart?period=${chartPeriod}`);
      setChartData(res.data);
    } catch (error) {
      console.error('Failed to load chart data', error);
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(dashboardData?.referralLink);
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

  const earningsChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Earnings (₹)',
        data: chartData.earnings,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const levelDistributionData = {
    labels: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'],
    datasets: [
      {
        data: [
          dashboardData?.earningsBreakdown?.level1 || 0,
          dashboardData?.earningsBreakdown?.level2 || 0,
          dashboardData?.earningsBreakdown?.level3 || 0,
          dashboardData?.earningsBreakdown?.level4 || 0,
          dashboardData?.earningsBreakdown?.level5 || 0
        ],
        backgroundColor: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Affiliate Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}!</p>
        </div>
        <div className="flex space-x-3">
          {dashboardData?.kycStatus?.status !== 'approved' && (
            <button
              onClick={() => setShowKYCModal(true)}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
            >
              Complete KYC
            </button>
          )}
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
            disabled={dashboardData?.kycStatus?.status !== 'approved'}
          >
            Request Withdrawal
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">₹{dashboardData?.balance?.totalEarnings?.toLocaleString() || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FiDollarSign className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Withdrawable Balance</p>
              <p className="text-2xl font-bold text-primary">₹{dashboardData?.balance?.withdrawableBalance?.toLocaleString() || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiTrendingUp className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Team Members</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData?.downlineSummary?.total || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <FiUsers className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Withdrawn</p>
              <p className="text-2xl font-bold text-gray-900">₹{dashboardData?.balance?.totalWithdrawn?.toLocaleString() || 0}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <FiAward className="text-orange-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* KYC Warning */}
      {dashboardData?.kycStatus?.status !== 'approved' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiEye className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {dashboardData?.kycStatus?.status === 'pending' 
                  ? 'Your KYC is pending approval. You cannot request withdrawals until KYC is approved.'
                  : 'Please complete KYC verification to enable withdrawals.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Referral Link */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Your Referral Link</h3>
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={dashboardData?.referralLink || ''}
            readOnly
            className="flex-1 input bg-gray-50"
          />
          <button
            onClick={copyReferralLink}
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Earnings Overview</h3>
            <div className="flex space-x-2">
              {['week', 'month', 'year'].map(period => (
                <button
                  key={period}
                  onClick={() => setChartPeriod(period)}
                  className={`px-3 py-1 text-sm rounded-md capitalize ${
                    chartPeriod === period ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <Line data={earningsChartData} options={{ responsive: true }} />
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Commission by Level</h3>
          <Pie data={levelDistributionData} options={{ responsive: true }} />
        </div>
      </div>

      {/* Downline Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Downline Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-primary">{dashboardData?.downlineSummary?.level1 || 0}</p>
            <p className="text-sm text-gray-600">Level 1</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-primary">{dashboardData?.downlineSummary?.level2 || 0}</p>
            <p className="text-sm text-gray-600">Level 2</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-primary">{dashboardData?.downlineSummary?.level3 || 0}</p>
            <p className="text-sm text-gray-600">Level 3</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-primary">{dashboardData?.downlineSummary?.level4 || 0}</p>
            <p className="text-sm text-gray-600">Level 4</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-primary">{dashboardData?.downlineSummary?.level5 || 0}</p>
            <p className="text-sm text-gray-600">Level 5</p>
          </div>
        </div>
      </div>

      {/* Downline Activity Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Downline Activity</h3>
          <span className="text-xs text-gray-500">Active in last 30 days</span>
        </div>
        {downlineActivity ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Level</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Active</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Inactive</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[1,2,3,4,5].map(level => {
                  const data = downlineActivity[`level${level}`] || { active: 0, inactive: 0 };
                  const total = data.active + data.inactive;
                  return (
                    <tr key={level} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">Level {level}</td>
                      <td className="px-4 py-2 text-sm text-green-600">{data.active}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{data.inactive}</td>
                      <td className="px-4 py-2 text-sm font-semibold">{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">Loading activity data...</div>
        )}
        <p className="text-xs text-gray-400 mt-3">
          * Active = made at least one course purchase in the last 30 days.
        </p>
      </div>

      {/* Graphical MLM Tree */}
      <MLMTreeGraph />

      {/* Recent Commissions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Commissions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Source</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Level</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dashboardData?.recentCommissions?.map(commission => (
                <tr key={commission._id}>
                  <td className="px-4 py-3 text-sm">{new Date(commission.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm">{commission.sourceUserId?.name || 'Unknown'}</td>
                  <td className="px-4 py-3 text-sm">Level {commission.level}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-green-600">₹{commission.amount}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      commission.status === 'paid' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {commission.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showKYCModal && <KYCModal onClose={() => setShowKYCModal(false)} onSuccess={fetchDashboardData} />}
      {showWithdrawModal && (
        <WithdrawModal 
          onClose={() => setShowWithdrawModal(false)} 
          balance={dashboardData?.balance?.withdrawableBalance || 0}
          onSuccess={fetchDashboardData}
        />
      )}
    </div>
  );
};

export default AffiliateDashboard;