import { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import api from '../../services/api';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    stats: {
      totalCourses: 0,
      totalStudents: 0,
      totalRevenue: 0,
      averageRating: 0,
      publishedCourses: 0,
    },
    courses: [],
    monthlyEnrollments: [],
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/instructor');
        setAnalytics(res.data);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
        toast.error('Could not load analytics data');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Prepare chart data for monthly enrollments
  const monthlyLabels = analytics.monthlyEnrollments.map(item => item._id);
  const enrollmentCounts = analytics.monthlyEnrollments.map(item => item.count);
  const monthlyRevenue = analytics.monthlyEnrollments.map(item => item.revenue);

  const enrollmentChartData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Enrollments',
        data: enrollmentCounts,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const revenueChartData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Revenue (₹)',
        data: monthlyRevenue,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Course performance data
  const courseLabels = analytics.courses.map(c => c.title);
  const courseStudents = analytics.courses.map(c => c.students);
  const courseRevenue = analytics.courses.map(c => c.revenue);

  const coursePerformanceData = {
    labels: courseLabels,
    datasets: [
      {
        label: 'Students Enrolled',
        data: courseStudents,
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
      },
    ],
  };

  const revenuePerCourseData = {
    labels: courseLabels,
    datasets: [
      {
        label: 'Revenue (₹)',
        data: courseRevenue,
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Track your course performance and earnings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-500 text-sm">Total Courses</p>
          <p className="text-2xl font-bold text-gray-900">{analytics.stats.totalCourses}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-500 text-sm">Total Students</p>
          <p className="text-2xl font-bold text-gray-900">{analytics.stats.totalStudents}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold text-primary">₹{analytics.stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-500 text-sm">Average Rating</p>
          <p className="text-2xl font-bold text-yellow-600">{analytics.stats.averageRating.toFixed(1)} ★</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-500 text-sm">Published Courses</p>
          <p className="text-2xl font-bold text-gray-900">{analytics.stats.publishedCourses}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4">Monthly Enrollments</h3>
          <Line data={enrollmentChartData} options={{ responsive: true }} />
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4">Monthly Revenue</h3>
          <Line data={revenueChartData} options={{ responsive: true }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4">Students per Course</h3>
          <Bar data={coursePerformanceData} options={{ responsive: true }} />
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4">Revenue per Course</h3>
          <Bar data={revenuePerCourseData} options={{ responsive: true }} />
        </div>
      </div>

      {/* Course Performance Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-bold">Course Performance Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analytics.courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{course.title}</td>
                  <td className="px-6 py-4 text-sm">{course.students}</td>
                  <td className="px-6 py-4 text-sm text-primary font-semibold">₹{course.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm">{course.rating.toFixed(1)} ★</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;