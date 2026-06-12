import { useState, useEffect } from 'react';
import { FiUsers, FiBookOpen, FiDollarSign, FiTrendingUp, FiCheckCircle, FiClock, FiUserCheck, FiAward } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import api from '../../services/api';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalInstructors: 0,
    totalAgents: 0,
    totalCourses: 0,
    publishedCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    pendingKYC: 0,
    pendingPayouts: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('month');
  const [chartData, setChartData] = useState({ labels: [], revenue: [], users: [] });

  useEffect(() => {
    fetchDashboardData();
    fetchAnalytics();
  }, [analyticsPeriod]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      const data = response.data || {};
      setStats({
        totalUsers: data.stats?.totalUsers || 0,
        totalStudents: data.stats?.totalStudents || 0,
        totalInstructors: data.stats?.totalInstructors || 0,
        totalAgents: data.stats?.totalAgents || 0,
        totalCourses: data.stats?.totalCourses || 0,
        publishedCourses: data.stats?.publishedCourses || 0,
        totalEnrollments: data.stats?.totalEnrollments || 0,
        totalRevenue: data.stats?.totalRevenue || 0,
        pendingKYC: data.stats?.pendingKYC || 0,
        pendingPayouts: data.stats?.pendingPayouts || 0
      });
      setRecentUsers(data.recentUsers || []);
      setRecentCourses(data.recentCourses || []);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get(`/admin/analytics?period=${analyticsPeriod}`);
      setChartData(res.data);
    } catch (error) {
      console.error('Failed to load analytics', error);
    }
  };

  // Dark theme chart colors
  const lineChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Revenue (₹)',
        data: chartData.revenue,
        borderColor: '#f97316', // orange-500
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'New Users',
        data: chartData.users,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { 
        position: 'top',
        labels: { color: '#cbd5e1' } // slate-300
      },
      title: { display: false },
      tooltip: { 
        callbacks: { 
          label: (ctx) => `${ctx.dataset.label}: ${ctx.dataset.label === 'Revenue (₹)' ? '₹' : ''}${ctx.raw.toLocaleString()}`
        },
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' }
      },
      y: { 
        title: { display: true, text: 'Revenue (₹)', color: '#94a3b8' },
        ticks: { color: '#94a3b8' },
        grid: { color: '#334155' },
        beginAtZero: true 
      },
      y1: { 
        title: { display: true, text: 'New Users', color: '#94a3b8' },
        position: 'right', 
        ticks: { color: '#94a3b8' },
        grid: { drawOnChartArea: false },
        beginAtZero: true 
      }
    }
  };

  const statCards = [
    { icon: FiUsers, label: 'Total Users', value: stats.totalUsers, color: 'from-blue-500 to-blue-600' },
    { icon: FiBookOpen, label: 'Courses', value: stats.totalCourses, color: 'from-green-500 to-green-600' },
    { icon: FiDollarSign, label: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, color: 'from-purple-500 to-purple-600' },
    { icon: FiTrendingUp, label: 'Enrollments', value: stats.totalEnrollments, color: 'from-orange-500 to-orange-600' },
    { icon: FiUserCheck, label: 'Pending KYC', value: stats.pendingKYC, color: 'from-yellow-500 to-yellow-600' },
    { icon: FiClock, label: 'Pending Payouts', value: stats.pendingPayouts, color: 'from-red-500 to-red-600' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400">Overview of platform performance</p>
      </div>

      {/* Period Selector */}
      <div className="flex justify-end space-x-2">
        {['week', 'month', 'year'].map((period) => (
          <button
            key={period}
            onClick={() => setAnalyticsPeriod(period)}
            className={`px-4 py-2 rounded-lg capitalize transition-all ${
              analyticsPeriod === period 
                ? 'bg-orange-500 text-white shadow-md' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Stats Grid - Dark Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-slate-800 rounded-xl shadow-lg p-4 border border-slate-700 hover:border-orange-500/30 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs">{stat.label}</p>
                <p className="text-xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`bg-gradient-to-br ${stat.color} w-10 h-10 rounded-full flex items-center justify-center shadow-lg`}>
                <stat.icon className="text-white text-sm" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4">Platform Growth</h3>
        <div className="h-96">
          <Line data={lineChartData} options={chartOptions} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Recent Users</h3>
          <div className="space-y-3">
            {recentUsers.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No users found</p>
            ) : (
              recentUsers.slice(0, 5).map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=f97316&color=fff`} 
                      alt={user.name} 
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-orange-500/50" 
                    />
                    <div>
                      <p className="font-medium text-white text-sm">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.role}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Courses */}
        <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Recent Courses</h3>
          <div className="space-y-3">
            {recentCourses.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No courses found</p>
            ) : (
              recentCourses.slice(0, 5).map((course) => (
                <div key={course._id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                  <div>
                    <p className="font-medium text-white text-sm">{course.title}</p>
                    <p className="text-xs text-slate-400">By {course.instructor?.name || 'Unknown'}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    course.isPublished 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;