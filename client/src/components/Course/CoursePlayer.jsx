import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import SecureVideoPlayer from '../../components/course/SecureVideoPlayer';
import { FiPlay, FiClock, FiCheckCircle, FiCircle, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    if (!courseId) {
      toast.error('Invalid course ID');
      return;
    }
    const fetchData = async () => {
      try {
        const res = await api.get(`/courses/${courseId}?_=${Date.now()}`);
        const data = res.data;
        setCourse(data.course);
        setSections(data.sections || []);
        // Auto-select first lecture if any
        for (const section of (data.sections || [])) {
          if (section.lectures && section.lectures.length > 0) {
            setCurrentLecture(section.lectures[0]);
            setExpandedSections({ [section._id]: true });
            break;
          }
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const handleLectureSelect = (lecture) => {
    setCurrentLecture(lecture);
  };

  if (loading) return <div className="text-center py-10">Loading course...</div>;
  if (!course) return <div className="text-center py-10 text-red-500">Course not found</div>;

  const hasLectures = sections.some(s => s.lectures?.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{course.title}</h1>
      {hasLectures ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentLecture ? (
              <>
                <div className="bg-black rounded-lg overflow-hidden">
                  <SecureVideoPlayer
                    lectureId={currentLecture._id}
                    onProgress={() => {}}
                    onComplete={() => {}}
                  />
                </div>
                <div className="mt-4">
                  <h2 className="text-xl font-bold">{currentLecture.title}</h2>
                  <p className="text-gray-600">{currentLecture.description}</p>
                  
                  {/* ========== RESOURCES SECTION ========== */}
                  {currentLecture.resources?.length > 0 && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h3 className="font-semibold text-sm mb-2 flex items-center gap-1">
                        <FiDownload className="text-primary" /> Resources
                      </h3>
                      <ul className="space-y-1">
                        {currentLecture.resources.map((res, idx) => (
                          <li key={idx}>
                            <a
                              href={res.url}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-2"
                            >
                              <FiDownload size={14} />
                              {res.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-gray-100 rounded-lg p-12 text-center">
                <FiPlay className="text-4xl text-gray-400 mx-auto mb-3" />
                <p>Select a lecture from the curriculum</p>
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24">
              <h3 className="font-bold text-lg mb-3">Course Content</h3>
              {sections.map((section) => (
                <div key={section._id} className="border rounded-lg mb-2">
                  <button
                    onClick={() => setExpandedSections(prev => ({ ...prev, [section._id]: !prev[section._id] }))}
                    className="w-full flex justify-between items-center p-3 bg-gray-50"
                  >
                    <span className="font-medium">{section.title}</span>
                    <span>{section.lectures?.length || 0} lectures</span>
                  </button>
                  {expandedSections[section._id] && (
                    <div className="divide-y">
                      {section.lectures?.map((lecture) => (
                        <button
                          key={lecture._id}
                          onClick={() => handleLectureSelect(lecture)}
                          className="w-full flex justify-between items-center p-3 text-left hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-2">
                            <FiCircle className="text-gray-400" />
                            <span>{lecture.title}</span>
                          </div>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <FiClock size={12} /> {Math.floor(lecture.videoDuration / 60)} min
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <p className="text-gray-500">No lectures yet. The instructor will add content soon.</p>
        </div>
      )}
    </div>
  );
};

export default CoursePlayer;