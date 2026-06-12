import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses/my-courses');
      setCourses(res.data);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await api.delete(`/courses/${id}`);
        toast.success('Course deleted');
        fetchCourses();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">My Courses</h1>
          <p className="text-gray-600">Manage all your created courses</p>
        </div>
        <Link to="/agent/courses/create" className="btn-primary flex items-center gap-2">
          <FiPlus /> Create New Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500 mb-4">You haven't created any courses yet.</p>
          <Link to="/agent/courses/create" className="btn-primary">Create Your First Course</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition">
              <img
                src={course.thumbnail || 'https://picsum.photos/300/200'}
                alt={course.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-5">
                <h3 className="font-bold text-lg mb-2 line-clamp-1">{course.title}</h3>
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">{course.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-primary font-bold text-xl">₹{course.price}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${course.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link to={`/courses/${course._id}`} className="flex-1 text-center border border-primary text-primary py-1 rounded-lg hover:bg-primary hover:text-white transition">
                    <FiEye className="inline mr-1" /> View
                  </Link>
                  <Link to={`/agent/courses/${course._id}/edit`} className="flex-1 text-center bg-primary text-white py-1 rounded-lg hover:bg-primary/90 transition">
                    <FiEdit className="inline mr-1" /> Edit
                  </Link>
                  <button onClick={() => handleDelete(course._id)} className="text-red-500 border border-red-500 px-3 py-1 rounded-lg hover:bg-red-500 hover:text-white transition">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;