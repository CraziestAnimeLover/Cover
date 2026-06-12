import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FiAward, FiDownload, FiInbox } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Certificates = () => {
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState({});

  useEffect(() => {
    const fetchCompletedCourses = async () => {
      try {
        const res = await api.get('/payments/my-purchases');
        const completed = res.data.filter(enrollment => enrollment.isCompleted === true);
        setCompletedCourses(completed);
      } catch (error) {
        console.error('Failed to fetch certificates', error);
        toast.error('Could not load certificates');
      } finally {
        setLoading(false);
      }
    };
    fetchCompletedCourses();
  }, []);

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

  if (completedCourses.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 font-sans selection:bg-orange-500/20">
        <div className="bg-white border border-slate-100 rounded-[20px] p-12 shadow-[0_12px_40px_rgba(0,0,0,0.02)]">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
            <FiAward size={28} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">No Certificates Yet</h2>
          <p className="text-slate-400 text-sm font-medium max-w-sm mx-auto mb-8">
            Complete your enrolled courses up to 100% to successfully issue and unlock official completion credentials.
          </p>
          <Link 
            to="/courses" 
            className="inline-flex items-center bg-slate-900 hover:bg-orange-600 text-white text-xs font-bold px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-95"
          >
            Browse Courses Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1 font-sans selection:bg-orange-500/20">
      
      {/* View Header */}
      <div className="border-b border-slate-100 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Certificates</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Download or view your verified course completion documents.
          </p>
        </div>
        
        {/* Dynamic Badge */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-xl">
          <FiAward className="text-orange-500 text-sm" />
          <span className="text-xs font-bold text-slate-600">
            {completedCourses.length} Secured Certificates
          </span>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {completedCourses.map((enrollment) => (
          <div 
            key={enrollment._id} 
            className="group bg-white border border-slate-100 rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_35px_rgba(15,23,42,0.05)] hover:border-slate-200/80 transition-all duration-300 overflow-hidden flex flex-col justify-between"
          >
            {/* Minimalist Tech-Aligned Upper Branding Card Header */}
            <div className="bg-slate-900 p-5 relative overflow-hidden group-hover:bg-slate-950 transition-colors">
              <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-orange-500/20 transition-all" />
              <div className="w-10 h-10 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center text-orange-400 mb-3 shadow-inner">
                <FiAward size={20} className="stroke-[2.5]" />
              </div>
              <h3 className="font-extrabold text-sm text-white tracking-wider uppercase opacity-90">
                Certificate of Completion
              </h3>
            </div>

            {/* Document Content Details Metadata Body */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-base tracking-tight line-clamp-2 min-h-[3rem] group-hover:text-orange-600 transition-colors">
                  {enrollment.course?.title}
                </h4>
                
                <div className="space-y-1.5 border-t border-b border-slate-50 py-3.5 my-4 text-xs font-semibold text-slate-400">
                  <div className="flex justify-between items-center">
                    <span>Recipient</span>
                    <span className="text-slate-700 font-bold">{enrollment.user?.name || 'Verified Scholar'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Issue Date</span>
                    <span className="text-slate-500">{new Date(enrollment.completedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              {/* Action Operations Button */}
              <button
                type="button"
                onClick={() => downloadCertificate(enrollment._id, enrollment.course?.title)}
                disabled={downloading[enrollment._id]}
                className="w-full flex items-center justify-center space-x-2 h-11 bg-slate-50 border border-slate-200/80 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 text-slate-700 text-xs font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.98]"
              >
                {downloading[enrollment._id] ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent group-hover:border-white"></div>
                ) : (
                  <FiDownload className="text-sm stroke-[2.5]" />
                )}
                <span>{downloading[enrollment._id] ? 'Generating Archive...' : 'Download Verified PDF'}</span>
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Certificates;