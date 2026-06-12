import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getMyPurchases } from '../../features/payment/paymentSlice';
import { FiPlay, FiAward, FiBookOpen, FiDownload } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MyLearning = () => {
  const dispatch = useDispatch();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState({});

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const result = await dispatch(getMyPurchases()).unwrap();
        console.log('📚 Enrollments from API:', result); // Debug
        setEnrollments(result);
      } catch (error) {
        console.error('Failed to fetch enrollments', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, [dispatch]);

  const downloadCertificate = async (enrollmentId, courseTitle) => {
    setDownloading(prev => ({ ...prev, [enrollmentId]: true }));
    try {
      const response = await api.get(`/certificates/${enrollmentId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${courseTitle.replace(/\s/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to download certificate');
    } finally {
      setDownloading(prev => ({ ...prev, [enrollmentId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 font-sans">
        <div className="animate-spin rounded-xl h-10 w-10 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1 font-sans selection:bg-orange-500/20">
      
      {/* View Header Banner */}
      <div className="border-b border-slate-100 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Learning</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Pick up right where you left off and manage your personal education syllabus.
          </p>
        </div>
        
        {/* Statistics Total Indicator Badge */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-xl">
          <FiBookOpen className="text-orange-500 text-sm" />
          <span className="text-xs font-bold text-slate-600">
            {enrollments.length} Active Enrollments
          </span>
        </div>
      </div>

      {enrollments.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20 bg-white border-2 border-dashed border-slate-100 rounded-[20px] max-w-xl mx-auto">
          <div className="w-14 h-14 bg-slate-50 text-slate-400 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
            <FiBookOpen size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-2">No Active Courses</h2>
          <p className="text-slate-400 text-xs font-medium max-w-xs mx-auto mb-6">
            You haven't enrolled in any educational tracks yet. Explore the marketplace catalog to get started.
          </p>
          <Link 
            to="/courses" 
            className="inline-flex items-center bg-slate-900 hover:bg-orange-600 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-md active:scale-95"
          >
            Browse Courses Directory
          </Link>
        </div>
      ) : (
        /* Dynamic Cards Grid Deck */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment) => (
            <div 
              key={enrollment._id} 
              className="group bg-white border border-slate-100 rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_35px_rgba(15,23,42,0.05)] hover:border-slate-200/80 transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Image Cover Layout */}
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  <img
                    src={enrollment.course?.thumbnail || 'https://via.placeholder.com/300x200'}
                    alt={enrollment.course?.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {enrollment.isCompleted && (
                    <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white px-2.5 py-1 rounded-full shadow-sm">
                      Completed
                    </span>
                  )}
                </div>

                {/* Card Context Body */}
                <div className="p-5 pb-1">
                  <h3 className="font-bold text-slate-800 text-base tracking-tight line-clamp-1 group-hover:text-orange-600 transition-colors">
                    {enrollment.course?.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold tracking-wide uppercase mt-1">
                    Instructor: {enrollment.course?.instructor?.name || 'Verified Expert'}
                  </p>

                  {/* Operational Metrics Line Metrics */}
                  <div className="my-5">
                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-1.5">
                      <span>Module Progress</span>
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

              {/* Functional CTA Links Base Footer Row */}
              <div className="p-5 pt-2 border-t border-slate-50 bg-slate-50/40 group-hover:bg-white transition-colors flex items-center gap-2.5">
                <Link
                  to={`/course-player/${enrollment.course?._id}`}
                  className="flex-1 h-10 bg-slate-900 hover:bg-orange-600 text-white flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
                >
                  <FiPlay className="fill-current text-xs" />
                  <span>Resume Module</span>
                </Link>

                {enrollment.isCompleted && (
                  <button
                    type="button"
                    onClick={() => downloadCertificate(enrollment._id, enrollment.course?.title)}
                    disabled={downloading[enrollment._id]}
                    className="h-10 px-3.5 bg-emerald-50 text-emerald-600 hover:bg-slate-900 hover:text-white border border-emerald-100 hover:border-slate-900 rounded-xl transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
                    title="Download Verified Certificate"
                  >
                    {downloading[enrollment._id] ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-600 border-t-transparent"></div>
                    ) : (
                      <FiAward size={16} className="stroke-[2.5]" />
                    )}
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLearning;