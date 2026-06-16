import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FiUpload, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ManageBanners = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch existing banners
  const fetchBanners = async () => {
    try {
      const res = await api.get('/banners');
      setBanners(res.data);
    } catch (error) {
      console.error('Failed to load banners:', error);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    document.getElementById('bannerImageInput').value = '';
  };

  // Submit new banner
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!imageFile) {
      toast.error('Please select an image');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', title);
    if (link) formData.append('link', link);
    formData.append('image', imageFile);

    try {
      await api.post('/banners', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Banner created successfully!');
      setTitle('');
      setLink('');
      removeImage();
      fetchBanners(); // refresh list
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to create banner');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete banner
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await api.delete(`/banners/${id}`);
      toast.success('Banner deleted');
      fetchBanners();
    } catch (error) {
      toast.error('Failed to delete banner');
    }
  };

  // Toggle active status
  const handleToggle = async (id, currentStatus) => {
    try {
      await api.patch(`/banners/${id}`, { isActive: !currentStatus });
      fetchBanners();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Banners</h1>

      {/* Create Form */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Create New Banner</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter banner title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Link (optional)</label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Banner Image</label>
            <div className="flex items-center gap-4">
              <input
                id="bannerImageInput"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
              {imagePreview && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="text-red-500 hover:text-red-700"
                >
                  <FiX size={20} />
                </button>
              )}
            </div>
            {imagePreview && (
              <div className="mt-3 w-32 h-20 rounded-lg overflow-hidden border border-gray-200">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50 transition"
          >
            {submitting ? 'Uploading...' : <><FiUpload /> Create Banner</>}
          </button>
        </form>
      </div>

      {/* List of existing banners */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Current Banners</h3>
        {banners.length === 0 ? (
          <p className="text-gray-400 text-sm">No banners found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {banners.map((banner) => (
                  <tr key={banner._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img src={banner.imageUrl} alt={banner.title} className="h-12 w-20 object-cover rounded" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{banner.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggle(banner._id, banner.isActive)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          banner.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDelete(banner._id)}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBanners;