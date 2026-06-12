import { useState, useEffect } from 'react';
import api from '../../services/api';

const SecureVideoPlayer = ({ lectureId, onProgress, onComplete }) => {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const res = await api.get(`/videos/signed-url/${lectureId}`);
        setUrl(res.data.url);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load video');
      }
    };
    if (lectureId) fetchUrl();
  }, [lectureId]);

  if (error) return <div className="text-red-500 p-4 text-center">Error: {error}</div>;
  if (!url) return <div className="text-white p-4 text-center">Loading video...</div>;

  return (
    <video
      src={url}
      controls
      className="w-full h-full"
      onTimeUpdate={onProgress}
      onEnded={onComplete}
    />
  );
};

export default SecureVideoPlayer;