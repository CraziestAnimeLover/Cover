import CourseCard from './CourseCard';
import { FiInbox, FiAlertCircle } from 'react-icons/fi';

const CourseList = ({ courses, loading, error }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 font-sans">
        <div className="animate-spin rounded-xl h-10 w-10 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-white border border-slate-100 rounded-[20px] max-w-xl mx-auto font-sans shadow-[0_12px_40px_rgba(0,0,0,0.02)]">
        <div className="w-12 h-12 bg-rose-50 text-rose-500 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <FiAlertCircle size={20} className="stroke-[2.5]" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">Execution Error</h3>
        <p className="text-rose-500/90 text-xs font-semibold max-w-xs mx-auto mt-1.5 leading-relaxed">
          {error || "An unexpected technical exception occurred while pulling course catalogs."}
        </p>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-20 bg-white border-2 border-dashed border-slate-100 rounded-[20px] max-w-xl mx-auto font-sans">
        <div className="w-12 h-12 bg-slate-50 text-slate-400 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <FiInbox size={20} />
        </div>
        <h3 className="text-sm font-bold text-slate-800">No Courses Found</h3>
        <p className="text-slate-400 text-xs font-medium max-w-xs mx-auto mt-1">
          No active course modules found matching your current dashboard directory criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-sans selection:bg-orange-500/20">
      {courses.map((course) => (
        <CourseCard key={course._id} course={course} />
      ))}
    </div>
  );
};

export default CourseList;