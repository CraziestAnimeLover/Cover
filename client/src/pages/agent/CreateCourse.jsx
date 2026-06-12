import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createCourse } from '../../features/course/courseSlice';
import { FiPlus, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CreateCourse = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    level: 'beginner',
    language: 'English',
    whatYouWillLearn: [],
    requirements: [],
    thumbnail: ''
  });
  const [newLearnItem, setNewLearnItem] = useState('');
  const [newRequirement, setNewRequirement] = useState('');

  const handleChange = (e) => {
    setCourseData({
      ...courseData,
      [e.target.name]: e.target.value
    });
  };

  const addLearnItem = () => {
    if (newLearnItem.trim()) {
      setCourseData({
        ...courseData,
        whatYouWillLearn: [...courseData.whatYouWillLearn, newLearnItem.trim()]
      });
      setNewLearnItem('');
    }
  };

  const removeLearnItem = (index) => {
    setCourseData({
      ...courseData,
      whatYouWillLearn: courseData.whatYouWillLearn.filter((_, i) => i !== index)
    });
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setCourseData({
        ...courseData,
        requirements: [...courseData.requirements, newRequirement.trim()]
      });
      setNewRequirement('');
    }
  };

  const removeRequirement = (index) => {
    setCourseData({
      ...courseData,
      requirements: courseData.requirements.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!courseData.title || !courseData.description || !courseData.price) {
      toast.error('Please fill in all required fields (Title, Description, Price)');
      return;
    }

    setLoading(true);
    try {
      // Prepare data for API (convert price to number, handle empty category)
      const submitData = {
        ...courseData,
        price: Number(courseData.price),
        category: courseData.category || null  // send null if empty
      };
      
      await dispatch(createCourse(submitData)).unwrap();
      toast.success('Course created successfully!');
      navigate('/agent/dashboard');
    } catch (error) {
      toast.error(error.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New Course</h1>
        <button onClick={() => navigate('/agent/dashboard')} className="text-gray-500 hover:text-gray-700">
          <FiX size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Course Title *</label>
              <input
                type="text"
                name="title"
                required
                value={courseData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Complete Web Development Bootcamp"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea
                name="description"
                required
                rows="4"
                value={courseData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe what students will learn..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  name="category"
                  value={courseData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Programming"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  required
                  value={courseData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Level</label>
                <select
                  name="level"
                  value={courseData.level}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Language</label>
                <input
                  type="text"
                  name="language"
                  value={courseData.language}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="English"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
              <input
                type="url"
                name="thumbnail"
                value={courseData.thumbnail}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
        </div>

        {/* What You'll Learn */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">What Students Will Learn</h2>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newLearnItem}
                onChange={(e) => setNewLearnItem(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Build full-stack applications"
                onKeyPress={(e) => e.key === 'Enter' && addLearnItem()}
              />
              <button type="button" onClick={addLearnItem} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90">
                <FiPlus />
              </button>
            </div>
            <div className="space-y-2">
              {courseData.whatYouWillLearn.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{item}</span>
                  <button type="button" onClick={() => removeLearnItem(index)} className="text-red-500">
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">Requirements / Prerequisites</h2>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Basic JavaScript knowledge"
                onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
              />
              <button type="button" onClick={addRequirement} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90">
                <FiPlus />
              </button>
            </div>
            <div className="space-y-2">
              {courseData.requirements.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{item}</span>
                  <button type="button" onClick={() => removeRequirement(index)} className="text-red-500">
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={() => navigate('/agent/dashboard')} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50 flex items-center">
            <FiSave className="mr-2" />
            {loading ? 'Creating...' : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCourse;