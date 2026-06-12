import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FiBookOpen, FiTrendingUp, FiAward, FiClock, FiBook } from 'react-icons/fi';

const UserDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await api.get('/payments/my-purchases');
        setEnrollments(res.data);
      } catch (error) {
        console.error('Failed to fetch enrollments', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  // Calculate stats from enrollments
  const completedCourses = enrollments.filter(e => e.progress === 100).length;
  const totalHoursLearned = enrollments.reduce((sum, e) => sum + (e.course?.duration || 0) * (e.progress / 100), 0);
  const hasCertificates = enrollments.filter(e => e.isCompleted).length;

  const stats = [
    { icon: FiBookOpen, label: 'Enrolled Courses', value: enrollments.length, color: 'text-blue-500 bg-blue-50' },
    { icon: FiTrendingUp, label: 'Completed', value: completedCourses, color: 'text-emerald-500 bg-emerald-50' },
    { icon: FiAward, label: 'Certificates Received', value: hasCertificates, color: 'text-purple-500 bg-purple-50' },
    { icon: FiClock, label: 'Hours Learned', value: Math.round(totalHoursLearned), color: 'text-orange-500 bg-orange-50' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-xl h-10 w-10 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1 font-sans selection:bg-orange-500/20">
      
      {/* Welcome Banner Section */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[20px] p-8 text-white shadow-lg shadow-slate-950/5 group">
        {/* Decorative structural vector background blur nodes */}
        <div className="absolute top-[-20%] right-[-10%] w-72 h-72 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute bottom-[-40%] left-[20%] w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 max-w-xl">
          <span className="text-[10px] bg-orange-500 text-white font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full border border-orange-400/20 inline-block mb-3.5 shadow-sm">
            Student Space
          </span>
          <h1 className="text-3xl font-black tracking-tight mb-2">
            Welcome back, {user?.name || 'Learner'}!
          </h1>
          <p className="text-slate-400 text-sm font-medium leading-relaxed">
            Your smart study assistant is active. Track your progress, continue where you left off, and finish your learning goals today.
          </p>
        </div>
      </div>

      {/* Analytics Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 mt-1.5 tracking-tight">{stat.value}</p>
            </div>
            <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center shadow-inner`}>
              <stat.icon className="text-xl stroke-[2.5]" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Container Section: Recent Enrolled Modules */}
      <div className="bg-white rounded-[20px] border border-slate-100 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.02)]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">My Courses</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Quick access to your active educational materials.</p>
          </div>
          <Link 
            to="/my-learning" 
            className="text-sm font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100/80 px-4 py-2 rounded-xl transition-all"
          >
            View All Courses
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/40">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3.5">
              <FiBook size={22} />
            </div>
            <p className="text-slate-500 font-medium text-sm mb-4">You haven't enrolled in any courses yet.</p>
            <Link 
              to="/courses" 
              className="inline-flex items-center bg-slate-900 hover:bg-orange-600 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-md active:scale-95"
            >
              Browse Courses Directory
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.slice(0, 3).map((enrollment) => (
              <div 
                key={enrollment._id} 
                className="group border border-slate-100 rounded-2xl overflow-hidden bg-white hover:border-slate-200/80 hover:shadow-[0_16px_35px_rgba(15,23,42,0.05)] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail Cover Layout */}
                  <div className="relative overflow-hidden bg-slate-100 aspect-video">
                    <img
                      src={enrollment.course?.thumbnail || 'https://via.placeholder.com/300x200'}
                      alt={enrollment.course?.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {enrollment.progress === 100 && (
                      <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white px-2.5 py-1 rounded-full shadow-sm">
                        Completed
                      </span>
                    )}
                  </div>

                  {/* Course Metadata Content Body */}
                  <div className="p-4 pb-1">
                    <h3 className="font-bold text-slate-800 text-base line-clamp-2 tracking-tight min-h-[3rem] group-hover:text-orange-600 transition-colors">
                      {enrollment.course?.title}
                    </h3>
                    
                    {/* Linear Bar Metrics UI */}
                    <div className="my-4">
                      <div className="flex justify-between text-xs font-bold text-slate-400 mb-1.5">
                        <span>Course Completion</span>
                        <span className="text-slate-700">{enrollment.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-full h-2 transition-all duration-500"
                          style={{ width: `${enrollment.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card CTA Actions Base Footer */}
                <div className="p-4 pt-2 border-t border-slate-50 bg-slate-50/40 group-hover:bg-white transition-colors">
                  <Link 
                    to={`/courses/${enrollment.course?._id}`} 
                    className="flex items-center justify-between w-full text-xs font-bold text-slate-700 group-hover:text-orange-600 transition-colors"
                  >
                    <span>{enrollment.progress === 100 ? 'Review Course Material' : 'Continue Learning Module'}</span>
                    <span className="text-base transform transition-transform group-hover:translate-x-1">→</span>
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

export default UserDashboard;