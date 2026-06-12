import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Review from '../models/Review.js';

// @desc    Get instructor analytics
// @route   GET /api/analytics/instructor
// @access  Private (Instructor)
export const getInstructorAnalytics = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id });
    const courseIds = courses.map(c => c._id);
    
    const enrollments = await Enrollment.find({ course: { $in: courseIds } });
    const reviews = await Review.find({ course: { $in: courseIds } });
    
    const totalStudents = enrollments.length;
    const totalRevenue = enrollments.reduce((sum, e) => sum + (e.amount || 0), 0);
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;
    
    // Monthly enrollment data
    const monthlyEnrollments = await Enrollment.aggregate([
      { $match: { course: { $in: courseIds } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      stats: {
        totalCourses: courses.length,
        totalStudents,
        totalRevenue,
        averageRating: Number(averageRating.toFixed(1)),
        publishedCourses: courses.filter(c => c.isPublished).length,
      },
      courses: courses.map(c => ({
        id: c._id,
        title: c.title,
        students: c.totalStudents,
        revenue: enrollments.filter(e => e.course.toString() === c._id.toString()).reduce((sum, e) => sum + (e.amount || 0), 0),
        rating: c.rating,
      })),
      monthlyEnrollments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get platform analytics (admin)
// @route   GET /api/analytics/platform
// @access  Private (Admin)
export const getPlatformAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    if (period === 'week') {
      dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
    } else if (period === 'month') {
      dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
    } else if (period === 'year') {
      dateFilter = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
    }
    
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({ createdAt: dateFilter });
    const totalCourses = await Course.countDocuments();
    const newCourses = await Course.countDocuments({ createdAt: dateFilter });
    const totalEnrollments = await Enrollment.countDocuments();
    const newEnrollments = await Enrollment.countDocuments({ createdAt: dateFilter });
    const totalRevenue = await Enrollment.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Top courses
    const topCourses = await Course.find()
      .sort('-totalStudents')
      .limit(5)
      .select('title totalStudents rating price');
    
    // Top instructors
    const topInstructors = await User.aggregate([
      { $match: { role: 'instructor' } },
      { $lookup: { from: 'courses', localField: '_id', foreignField: 'instructor', as: 'courses' } },
      { $addFields: { totalStudents: { $sum: '$courses.totalStudents' } } },
      { $sort: { totalStudents: -1 } },
      { $limit: 5 },
      { $project: { name: 1, email: 1, totalStudents: 1 } }
    ]);
    
    res.json({
      overview: {
        totalUsers,
        newUsers,
        totalCourses,
        newCourses,
        totalEnrollments,
        newEnrollments,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      topCourses,
      topInstructors,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};