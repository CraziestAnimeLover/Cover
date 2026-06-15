import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourseById } from '../../features/course/courseSlice'; // removed enrollInCourse
import { 
  FiStar, FiUsers, FiClock, FiBookOpen, FiPlay, FiCheck, 
  FiChevronDown, FiChevronUp, FiX 
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentCourse, isLoading } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);
  const [selectedSection, setSelectedSection] = useState(null);

  useEffect(() => {
    dispatch(fetchCourseById(id));
  }, [dispatch, id]);

  // ✅ Redirect to checkout (no direct enrollment)
  const handleEnroll = () => {
    if (!user) {
      navigate('/student-login');
      return;
    }
    const course = currentCourse?.course || currentCourse;
    navigate('/checkout', { 
      state: { 
        courseId: id, 
        coursePrice: course?.price, 
        courseTitle: course?.title 
      } 
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96 font-sans">
        <div className="animate-spin rounded-xl h-10 w-10 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!currentCourse) {
    return (
      <div className="text-center py-20 bg-white border border-slate-100 rounded-[20px] max-w-md mx-auto my-12 font-sans">
        <p className="text-slate-500 font-medium">Course not found</p>
      </div>
    );
  }

  const course = currentCourse.course || currentCourse;
  const sections = currentCourse.sections || [];

  return (
    <div className="pb-16 font-sans selection:bg-orange-500/20">
      {/* Hero Section with Pricing Card */}
      <div className="bg-slate-900 text-white relative overflow-hidden rounded-b-[32px] shadow-md">
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-30%] left-[-5%] w-80 h-80 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 space-y-4">
              <span className="text-[10px] bg-orange-500 text-white font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full border border-orange-400/20 inline-block shadow-sm">
                Syllabus Overview
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                {course.title}
              </h1>
              <p className="text-slate-400 text-base font-medium max-w-3xl leading-relaxed">
                {course.description}
              </p>
              
              {/* Course Metrics */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/40 px-3 py-1.5 rounded-xl">
                  <FiStar className="text-amber-400 stroke-[2.5]" />
                  <span>{course.rating || 0} Rating</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/40 px-3 py-1.5 rounded-xl">
                  <FiUsers className="text-orange-400 stroke-[2.5]" />
                  <span>{course.totalStudents || 0} Students</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/40 px-3 py-1.5 rounded-xl">
                  <FiClock className="text-slate-400 stroke-[2.5]" />
                  <span>{Math.floor(course.duration / 60)} Hours</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/40 px-3 py-1.5 rounded-xl">
                  <FiBookOpen className="text-slate-400 stroke-[2.5]" />
                  <span>{course.totalLectures || 0} Lectures</span>
                </div>
              </div>
            </div>

            {/* Pricing Card with Enroll Button */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center shadow-xl shadow-slate-950/10 self-center max-w-md w-full lg:ml-auto">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Tuition Fee</p>
              <div className="text-4xl font-black text-slate-900 my-3 tracking-tight">₹{course.price}</div>
              
              {course.isEnrolled ? (
                <Link
                  to={`/course-player/${course._id}`}
                  className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center rounded-xl font-bold transition-all shadow-md shadow-emerald-500/10 active:scale-[0.98] text-sm"
                >
                  Continue Learning
                </Link>
              ) : (
                <button
                  onClick={handleEnroll}
                  className="w-full h-12 bg-slate-900 hover:bg-orange-600 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-orange-500/20 text-sm tracking-wide active:scale-[0.98]"
                >
                  Enroll Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content (Left + Right) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            {course.whatYouWillLearn?.length > 0 && (
              <div className="bg-white border border-slate-100 rounded-[20px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mb-4">What You'll Learn</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {course.whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex items-start text-sm font-medium text-slate-600 leading-relaxed">
                      <div className="w-5 h-5 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 text-emerald-600">
                        <FiCheck className="stroke-[3]" size={12} />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Content Accordion */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Course Content</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Explore structural breakdown sections and lecture modules.</p>
              </div>
              <div className="space-y-3">
                {sections.map((section, idx) => (
                  <div key={section._id} className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-sm transition-all">
                    <button
                      type="button"
                      onClick={() => setSelectedSection(selectedSection === section._id ? null : section._id)}
                      className="w-full flex justify-between items-center p-4 bg-slate-50/60 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex flex-col pr-4">
                        <span className="font-bold text-sm text-slate-800 tracking-tight">
                          Section {idx + 1}: {section.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-400 whitespace-nowrap">
                        <span>{section.lectures?.length || 0} lectures</span>
                        {selectedSection === section._id ? (
                          <FiX size={14} className="text-orange-500" />
                        ) : (
                          <FiChevronDown size={16} />
                        )}
                      </div>
                    </button>
                    {selectedSection === section._id && (
                      <div className="divide-y divide-slate-100 bg-white border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
                        {section.lectures?.map((lecture) => (
                          <div key={lecture._id} className="flex items-center p-4 hover:bg-slate-50/40 transition-colors group">
                            <div className="w-7 h-7 bg-slate-50 group-hover:bg-orange-50 border border-slate-100 group-hover:border-orange-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-orange-500 mr-3.5 flex-shrink-0 transition-colors">
                              <FiPlay className="text-xs fill-current" />
                            </div>
                            <span className="flex-1 text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors line-clamp-1">
                              {lecture.title}
                            </span>
                            <span className="text-xs font-bold text-slate-400 ml-4 whitespace-nowrap bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                              {Math.floor(lecture.videoDuration / 60)} min
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-24">
            {course.requirements?.length > 0 && (
              <div className="bg-white border border-slate-100 rounded-[20px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
                <h3 className="font-extrabold text-slate-900 text-base tracking-tight border-b border-slate-100 pb-3 mb-4">Requirements</h3>
                <ul className="space-y-3">
                  {course.requirements.map((req, index) => (
                    <li key={index} className="text-sm font-medium text-slate-600 flex items-start">
                      <span className="text-orange-500 mr-2.5 font-bold leading-none text-base">•</span>
                      <span className="leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="bg-white border border-slate-100 rounded-[20px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
              <h3 className="font-extrabold text-slate-900 text-base tracking-tight border-b border-slate-100 pb-3 mb-4">Instructor</h3>
              <div className="flex items-center space-x-3.5">
                <img
                  src={course.instructor?.avatar || `https://ui-avatars.com/api/?name=${course.instructor?.name}&background=f1f5f9&color=0f172a`}
                  alt={course.instructor?.name}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 tracking-tight text-sm truncate">{course.instructor?.name}</p>
                  <p className="text-xs text-slate-400 font-medium line-clamp-2 mt-0.5 leading-normal">
                    {course.instructor?.bio || 'Expert Verified Academic Facilitator'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;