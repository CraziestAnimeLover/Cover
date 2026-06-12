import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchCourseById, updateCourse } from '../../features/course/courseSlice';
import { FiSave, FiX, FiVideo } from 'react-icons/fi';
import toast from 'react-hot-toast';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    price: 0,
    isPublished: false
  });

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      const result = await dispatch(fetchCourseById(id)).unwrap();
      const course = result.course || result;
      setCourseData({
        title: course.title || '',
        description: course.description || '',
        price: course.price || 0,
        isPublished: course.isPublished || false
      });
    } catch (error) {
      toast.error('Failed to load course');
      navigate('/agent/dashboard');
    }
  };

  const handleChange = (e) => {
    setCourseData({
      ...courseData,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(updateCourse({ id, courseData })).unwrap();
      toast.success('Course updated successfully!');
      navigate('/agent/dashboard');
    } catch (error) {
      toast.error(error.message || 'Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Course</h1>
        <button onClick={() => navigate('/agent/dashboard')} className="text-gray-500 hover:text-gray-700">
          <FiX size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Course Title</label>
          <input
            type="text"
            name="title"
            value={courseData.title}
            onChange={handleChange}
            className="input"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            rows="4"
            value={courseData.description}
            onChange={handleChange}
            className="input"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price (₹)</label>
            <input
              type="number"
              name="price"
              value={courseData.price}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isPublished"
                checked={courseData.isPublished}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span>Publish Course</span>
            </label>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <Link
            to={`/agent/courses/${id}/manage`}
            className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg hover:bg-primary/20 transition"
          >
            <FiVideo />
            <span>Manage Sections & Lectures</span>
          </Link>
          <div className="flex space-x-3">
            <button type="button" onClick={() => navigate('/agent/dashboard')} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex items-center">
              <FiSave className="mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditCourse;