import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiVideo, FiFile } from 'react-icons/fi';

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
      const res = await api.get(`/courses/${courseId}`);
      const courseData = res.data.course || res.data;
      setCourse(courseData);
      setSections(res.data.sections || []);
    } catch (error) {
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

  const handleAddResource = async (lecture) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      try {
        const uploadRes = await api.post('/resources/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        await api.post(`/courses/lectures/${lecture._id}/resources`, {
          name: uploadRes.data.originalName,
          url: uploadRes.data.url
        });
        toast.success('Resource added');
        onLectureAdded();
      } catch (err) {
        toast.error('Failed to add resource');
      }
    };
    input.click();
  };

  const handleRemoveResource = async (lectureId, resourceIndex) => {
    if (!window.confirm('Remove this resource?')) return;
    try {
      await api.delete(`/courses/lectures/${lectureId}/resources/${resourceIndex}`);
      toast.success('Resource removed');
      onLectureAdded();
    } catch (error) {
      toast.error('Failed to remove resource');
    }
  };

  if (loading) return <div className="text-center py-10">Loading course...</div>;
  if (!course) return <div className="text-center py-10 text-red-500">Course not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Manage Course: {course.title}</h1>
          <p className="text-gray-600">Add sections, lectures, and resources</p>
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
                  {/* Add Lecture Form (simplified – you can reuse the existing AddLectureForm component) */}
                  <div className="mb-4 p-3 border rounded bg-gray-50">
                    <h3 className="font-medium mb-2">Add New Lecture</h3>
                    {/* You can integrate your existing AddLectureForm component here */}
                    {/* For brevity, we keep the existing AddLectureForm logic, but ensure it's imported */}
                    {/* If you have an AddLectureForm component, use it. Otherwise, add a simple version */}
                  </div>

                  {/* Lectures List */}
                  <div className="space-y-4">
                    {section.lectures?.map((lecture) => (
                      <div key={lecture._id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{lecture.title}</p>
                            <p className="text-xs text-gray-500">
                              {lecture.videoType === 'youtube' ? 'YouTube' : 'Uploaded'} • {Math.floor(lecture.videoDuration / 60)} min
                            </p>
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

                        {/* Resources Section */}
                        <div className="mt-3 pt-2 border-t">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                              <FiFile /> Resources
                            </span>
                            <button
                              onClick={() => handleAddResource(lecture)}
                              className="text-xs bg-primary text-white px-2 py-1 rounded"
                            >
                              + Add Resource
                            </button>
                          </div>
                          {lecture.resources?.length > 0 ? (
                            <div className="space-y-1">
                              {lecture.resources.map((res, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                  <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    {res.name}
                                  </a>
                                  <button
                                    onClick={() => handleRemoveResource(lecture._id, idx)}
                                    className="text-red-500 text-xs"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400">No resources yet.</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {!section.lectures?.length && (
                      <p className="text-center text-gray-500 py-4">No lectures yet.</p>
                    )}
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