import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AddLectureForm = ({ sectionId, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoType, setVideoType] = useState('upload');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return toast.error('Title required');

    try {
      let videoPublicId = null;
      let videoDuration = 0;

      if (videoType === 'upload') {
        if (!videoFile) return toast.error('Select a video file');
        setUploading(true);
        const formData = new FormData();
        formData.append('video', videoFile);
        const res = await api.post('/videos/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        videoPublicId = res.data.videoPublicId;
        videoDuration = res.data.duration;
        setUploading(false);
      }

      await api.post(`/courses/sections/${sectionId}/lectures`, {
        title,
        description,
        videoType,
        youtubeUrl: videoType === 'youtube' ? youtubeUrl : undefined,
        videoPublicId,
        videoDuration,
      });

      toast.success('Lecture added');
      onSuccess();
      setTitle('');
      setDescription('');
      setYoutubeUrl('');
      setVideoFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 border rounded">
      <input
        type="text"
        placeholder="Lecture Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="input"
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        className="input"
        rows="2"
      />

      <div className="flex gap-4">
        <label className="flex items-center gap-1">
          <input type="radio" value="upload" checked={videoType === 'upload'} onChange={() => setVideoType('upload')} />
          Upload Video (MP4)
        </label>
        <label className="flex items-center gap-1">
          <input type="radio" value="youtube" checked={videoType === 'youtube'} onChange={() => setVideoType('youtube')} />
          YouTube Link
        </label>
      </div>

      {videoType === 'youtube' ? (
        <input
          type="url"
          placeholder="YouTube URL (e.g., https://www.youtube.com/watch?v=...)"
          value={youtubeUrl}
          onChange={e => setYoutubeUrl(e.target.value)}
          className="input"
        />
      ) : (
        <input
          type="file"
          accept="video/mp4,video/webm"
          onChange={e => setVideoFile(e.target.files[0])}
          className="input"
        />
      )}

      <button type="submit" disabled={uploading} className="btn-primary">
        {uploading ? 'Uploading...' : 'Add Lecture'}
      </button>
    </form>
  );
};

export default AddLectureForm;