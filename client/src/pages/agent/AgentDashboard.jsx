import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiUsers, FiDollarSign, FiTrendingUp, FiBookOpen, FiStar, FiAward } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AgentDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalEarnings: 0,
    totalReferrals: 0,
    pendingCommissions: 0,
    averageRating: 0
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [coursesRes, earningsRes, referralsRes] = await Promise.all([
        api.get('/courses/my-courses'),
        api.get('/agent/earnings'),
        api.get('/referrals/my-referrals')
      ]);

      const courses = coursesRes.data || [];
      const earnings = earningsRes.data || {};
      const referrals = referralsRes.data || { stats: {} };

      setStats({
        totalCourses: courses.length,
        totalStudents: earnings.totalStudents || 0,
        totalEarnings: earnings.totalEarned || 0,
        pendingCommissions: earnings.pending || 0,
        totalReferrals: referrals.stats?.total || 0,
        averageRating: courses.length ? courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length : 0
      });

      setRecentCourses(courses.slice(0, 5));
    } catch (error) {
      console.error('API error:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const statCards = [
    { icon: FiBookOpen, label: 'Total Courses', value: stats.totalCourses, color: 'bg-blue-500' },
    { icon: FiUsers, label: 'Total Students', value: stats.totalStudents, color: 'bg-green-500' },
    { icon: FiDollarSign, label: 'Total Earnings', value: `₹${stats.totalEarnings.toLocaleString()}`, color: 'bg-purple-500' },
    { icon: FiTrendingUp, label: 'Pending Commission', value: `₹${stats.pendingCommissions.toLocaleString()}`, color: 'bg-yellow-500' },
    { icon: FiAward, label: 'Referrals', value: stats.totalReferrals, color: 'bg-pink-500' },
    { icon: FiStar, label: 'Avg Rating', value: stats.averageRating.toFixed(1), color: 'bg-orange-500' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="opacity-90">Here's what's happening with your courses and earnings today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} w-12 h-12 rounded-full flex items-center justify-center`}>
                <stat.icon className="text-white text-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/agent/courses/create" className="text-center p-4 border rounded-lg hover:border-primary hover:shadow-md transition">
            <div className="text-2xl mb-2">📚</div>
            <p className="font-medium">Create Course</p>
          </Link>
          <Link to="/agent/earnings" className="text-center p-4 border rounded-lg hover:border-primary hover:shadow-md transition">
            <div className="text-2xl mb-2">💰</div>
            <p className="font-medium">View Earnings</p>
          </Link>
          <Link to="/agent/referrals" className="text-center p-4 border rounded-lg hover:border-primary hover:shadow-md transition">
            <div className="text-2xl mb-2">🔗</div>
            <p className="font-medium">Referrals</p>
          </Link>
          <Link to="/profile" className="text-center p-4 border rounded-lg hover:border-primary hover:shadow-md transition">
            <div className="text-2xl mb-2">👤</div>
            <p className="font-medium">Profile</p>
          </Link>
        </div>
      </div>

      {/* Recent Courses - Guaranteed to show */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Recent Courses</h2>
          <Link to="/agent/courses" className="text-primary text-sm hover:underline">View All</Link>
        </div>

        {recentCourses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You haven't created any courses yet.</p>
            <Link to="/agent/courses/create" className="btn-primary">Create Your First Course</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentCourses.map((course, idx) => (
              <div key={course._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <img
                    src={course.thumbnail && course.thumbnail.startsWith('http') ? course.thumbnail : 'https://picsum.photos/100/100?random=' + idx}
                    alt={course.title}
                    className="w-16 h-16 object-cover rounded bg-gray-100"
                    onError={(e) => { e.target.src = `https://picsum.photos/100/100?random=${idx}`; }}
                  />
                  <div>
                    <h3 className="font-semibold">{course.title || 'Untitled Course'}</h3>
                    <p className="text-sm text-gray-500">
                      {course.totalStudents || 0} students • ₹{course.price}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${course.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                  <Link to={`/agent/courses/${course._id}/edit`} className="text-primary hover:underline text-sm">
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;