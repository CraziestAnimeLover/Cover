import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import AddLectureForm from '../../components/instructor/AddLectureForm';
import { FiPlus, FiTrash2, FiVideo } from 'react-icons/fi';

const ManageCourse = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      // Fetch course details (same as used in EditCourse)
      const res = await api.get(`/courses/${courseId}`);
      const courseData = res.data.course || res.data;
      setCourse(courseData);
      // Curriculum is the sections + lectures
      setSections(res.data.curriculum || []);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course');
      navigate('/agent/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) {
      toast.error('Section title required');
      return;
    }
    try {
      const res = await api.post(`/courses/${courseId}/sections`, { title: newSectionTitle });
      setSections([...sections, res.data]);
      setNewSectionTitle('');
      setShowAddSection(false);
      toast.success('Section added');
    } catch (error) {
      toast.error('Failed to add section');
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Delete this section and all its lectures?')) return;
    try {
      await api.delete(`/courses/sections/${sectionId}`);
      setSections(sections.filter(s => s._id !== sectionId));
      toast.success('Section deleted');
    } catch (error) {
      toast.error('Failed to delete section');
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const onLectureAdded = () => {
    fetchCourseData(); // refresh sections and lectures
  };

  if (loading) {
    return <div className="text-center py-10">Loading course...</div>;
  }

  if (!course) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Course not found</p>
        <button onClick={() => navigate('/agent/dashboard')} className="btn-primary mt-4">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Manage Course: {course.title}</h1>
          <p className="text-gray-600">Add sections and lectures to build your course</p>
        </div>
        <button onClick={() => navigate('/agent/dashboard')} className="btn-secondary">
          Back to Dashboard
        </button>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Course Sections</h2>
          <button onClick={() => setShowAddSection(true)} className="btn-primary flex items-center gap-2">
            <FiPlus /> Add Section
          </button>
        </div>

        {showAddSection && (
          <div className="bg-gray-50 p-4 rounded-lg flex gap-2">
            <input
              type="text"
              placeholder="Section title"
              value={newSectionTitle}
              onChange={e => setNewSectionTitle(e.target.value)}
              className="flex-1 input"
              autoFocus
            />
            <button onClick={handleAddSection} className="btn-primary">Add</button>
            <button onClick={() => setShowAddSection(false)} className="btn-secondary">Cancel</button>
          </div>
        )}

        {sections.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No sections yet. Click "Add Section" to start building your course.</p>
        ) : (
          sections.map((section) => (
            <div key={section._id} className="border rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-4 bg-gray-50">
                <button
                  onClick={() => toggleSection(section._id)}
                  className="flex-1 text-left font-semibold text-lg"
                >
                  {section.title}
                </button>
                <button onClick={() => handleDeleteSection(section._id)} className="text-red-500 hover:text-red-600 p-1">
                  <FiTrash2 />
                </button>
              </div>
              {expandedSections[section._id] && (
                <div className="p-4">
                  <AddLectureForm sectionId={section._id} onSuccess={onLectureAdded} />
                  <div className="mt-4 space-y-2">
                    {section.lectures?.map((lecture) => (
                      <div key={lecture._id} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <FiVideo className="text-gray-400" />
                          <div>
                            <p className="font-medium">{lecture.title}</p>
                            <p className="text-xs text-gray-500">
                              {lecture.videoType === 'youtube' ? 'YouTube' : 'Uploaded Video'} • {Math.floor(lecture.videoDuration / 60)} min
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            if (window.confirm('Delete this lecture?')) {
                              await api.delete(`/courses/lectures/${lecture._id}`);
                              onLectureAdded();
                            }
                          }}
                          className="text-red-500"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageCourse;