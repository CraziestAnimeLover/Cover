import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourses } from '../../features/course/courseSlice';
import CourseCard from '../../components/course/CourseCard';
import CourseFilters from '../../components/course/CourseFilters';
import { FiBookOpen, FiInbox, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const BrowseCourses = () => {
  const dispatch = useDispatch();
  const { courses, isLoading, pagination = { totalPages: 1, currentPage: 1, total: 0 } } = useSelector((state) => state.courses);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    sortBy: 'newest',
  });

  useEffect(() => {
    dispatch(fetchCourses(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96 font-sans">
        <div className="animate-spin rounded-xl h-10 w-10 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans selection:bg-orange-500/20">
      
      {/* View Header Section */}
      <div className="mb-8 border-b border-slate-100 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Browse Courses</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Discover optimized curriculums and courses from expert global instructors.
          </p>
        </div>
        
        <div className="flex items-center gap-2 self-start md:self-auto bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-xl">
          <FiBookOpen className="text-orange-500 text-sm" />
          <span className="text-xs font-bold text-slate-600">
            {pagination.total || courses.length} Courses Available
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/4">
          <div className="bg-white border border-slate-100 rounded-2xl p-1 shadow-[0_8px_30px_rgba(0,0,0,0.01)] lg:sticky lg:top-24">
            <CourseFilters onFilterChange={handleFilterChange} />
          </div>
        </div>

        <div className="w-full lg:w-3/4">
          {courses.length === 0 ? (
            <div className="text-center py-20 bg-white border-2 border-dashed border-slate-100 rounded-[20px]">
              <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                <FiInbox size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Courses Match Criteria</h3>
              <p className="text-slate-400 text-xs font-medium max-w-xs mx-auto mt-1">
                Try adjusting your filters, clearing checkboxes, or modifying search keywords.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>

              {/* Pagination Component */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center mt-12 pt-6 border-t border-slate-100 gap-1 select-none">
                  <button
                    type="button"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="p-2 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-600 disabled:opacity-40 flex items-center justify-center bg-white shadow-sm"
                  >
                    <FiChevronLeft size={18} />
                  </button>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 mx-2">
                    <span className="text-xs font-bold text-slate-600 tracking-wide">
                      Page <span className="text-slate-900 font-black">{pagination.currentPage}</span> of <span className="text-slate-900 font-black">{pagination.totalPages}</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="p-2 border border-slate-200 hover:border-slate-300 rounded-xl text-slate-600 disabled:opacity-40 flex items-center justify-center bg-white shadow-sm"
                  >
                    <FiChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseCourses;