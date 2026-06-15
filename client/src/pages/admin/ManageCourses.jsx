import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/admin/courses');
      const coursesData = response.data.courses || (Array.isArray(response.data) ? response.data : []);
      setCourses(coursesData);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (courseId) => {
    try {
      await api.put(`/admin/courses/${courseId}/approve`);
      toast.success('Course approved');
      fetchCourses();
    } catch (error) {
      toast.error('Failed to approve course');
    }
  };

  if (loading) return <div className="text-center py-10">Loading courses...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Courses</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Title</th>
              <th className="px-6 py-3 text-left">Instructor</th>
              <th className="px-6 py-3 text-left">Price</th>
              <th className="px-6 py-3 text-left">Published</th>
              <th className="px-6 py-3 text-left">Approved</th>
              <th className="px-6 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {courses.map(course => (
              <tr key={course._id}>
                <td className="px-6 py-4">{course.title}</td>
                <td className="px-6 py-4">{course.instructor?.name || 'Unknown'}</td>
                <td className="px-6 py-4">₹{course.price}</td>
                <td className="px-6 py-4">{course.isPublished ? 'Yes' : 'No'}</td>
                <td className="px-6 py-4">
                  {course.isApproved ? (
                    <FiCheckCircle className="text-green-500" />
                  ) : (
                    <FiXCircle className="text-yellow-500" />
                  )}
                </td>
                <td className="px-6 py-4">
                  {!course.isApproved && (
                    <button
                      onClick={() => handleApprove(course._id)}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageCourses;