import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FiTrendingUp, FiCheckCircle, FiClock, FiActivity, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const MyProgress = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await api.get('/payments/my-purchases');
        setEnrollments(res.data);
      } catch (error) {
        console.error('Failed to fetch progress', error);
        toast.error('Could not load your progress metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 font-sans">
        <div className="animate-spin rounded-xl h-10 w-10 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 font-sans selection:bg-orange-500/20">
        <div className="bg-white border border-slate-100 rounded-[20px] p-12 shadow-[0_12px_40px_rgba(0,0,0,0.02)]">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
            <FiActivity size={28} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">No Learning Records</h2>
          <p className="text-slate-400 text-sm font-medium max-w-sm mx-auto mb-8">
            You don't have any active analytics. Enroll in a course layout to begin generating progress timelines.
          </p>
          <Link 
            to="/courses" 
            className="inline-flex items-center bg-slate-900 hover:bg-orange-600 text-white text-xs font-bold px-6 py-3.5 rounded-xl transition-all shadow-md"
          >
            Browse Courses Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1 font-sans selection:bg-orange-500/20 max-w-7xl mx-auto">
      
      {/* View Header */}
      <div className="border-b border-slate-100 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Progress</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Analyze your milestones, metrics, and academic course completions.
          </p>
        </div>
        
        {/* Metric Header Total Indicator Badge */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-xl">
          <FiTrendingUp className="text-orange-500 text-sm stroke-[2.5]" />
          <span className="text-xs font-bold text-slate-600">
            Tracking {enrollments.length} Active Timelines
          </span>
        </div>
      </div>

      {/* Progress Cards Matrix Deck Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {enrollments.map((enrollment) => (
          <div 
            key={enrollment._id} 
            className="group bg-white border border-slate-100 rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.02)] p-6 hover:shadow-[0_16px_35px_rgba(15,23,42,0.04)] hover:border-slate-200/80 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Card Meta Content Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 text-base tracking-tight line-clamp-1 group-hover:text-orange-600 transition-colors">
                    {enrollment.course?.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    By {enrollment.course?.instructor?.name || 'Verified Facilitator'}
                  </p>
                </div>
                
                {enrollment.isCompleted && (
                  <div className="w-6 h-6 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <FiCheckCircle size={14} className="stroke-[2.5]" />
                  </div>
                )}
              </div>

              {/* Segment Metric Bar Loader UI */}
              <div className="mt-6 border-t border-b border-slate-50 py-4">
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                  <span>Overall Progress Completion</span>
                  <span className="text-slate-800">{enrollment.progress || 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-full h-2 transition-all duration-500"
                    style={{ width: `${enrollment.progress || 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Base Footer Info Link Action Row */}
            <div className="mt-5 flex items-center justify-between text-xs font-bold text-slate-400">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl font-semibold">
                <FiClock className="text-slate-400 stroke-[2.5]" size={13} />
                <span>Last Access: {new Date(enrollment.lastAccessed).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
              
              <Link 
                to={`/course-player/${enrollment.course?._id}`} 
                className="inline-flex items-center gap-1 text-slate-700 group-hover:text-orange-600 transition-colors"
              >
                <span>Resume Lecture</span>
                <FiArrowRight size={14} className="transform transition-transform group-hover:translate-x-1 stroke-[2.5]" />
              </Link>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default MyProgress;