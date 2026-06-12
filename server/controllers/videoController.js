import cloudinary from '../config/cloudinary.js';
import Lecture from '../models/Lecture.js';
import Enrollment from '../models/Enrollment.js';

export const getVideoSignedUrl = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId).populate('section');
    if (!lecture) return res.status(404).json({ message: 'Lecture not found' });

    // Check enrollment (or preview)
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: lecture.section.course
    });
    if (!enrollment && !lecture.isPreview) {
      return res.status(403).json({ message: 'Not enrolled' });
    }

    // YouTube video – return direct URL (no signature needed)
    if (lecture.videoType === 'youtube') {
      let youtubeUrl = lecture.youtubeUrl;
      if (youtubeUrl && youtubeUrl.includes('watch?v=')) {
        const videoId = youtubeUrl.split('v=')[1]?.split('&')[0];
        if (videoId) youtubeUrl = `https://www.youtube.com/embed/${videoId}`;
      }
      return res.json({ type: 'youtube', url: youtubeUrl });
    }

    // Cloudinary uploaded video – generate signed URL with 1-hour expiry
    if (!lecture.videoPublicId) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const expiresAt = timestamp + 3600; // 1 hour from now

    // Generate signature using Cloudinary API utils
    const signature = cloudinary.utils.api_sign_request(
      {
        public_id: lecture.videoPublicId,
        expires_at: expiresAt,
        resource_type: 'video',
      },
      process.env.CLOUDINARY_API_SECRET
    );

    // Build signed URL
    const signedUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/s--${signature}--/fl_attachment/${lecture.videoPublicId}.mp4?expires_at=${expiresAt}`;

    return res.json({ type: 'cloudinary', url: signedUrl });
  } catch (error) {
    console.error('Signed URL error:', error);
    res.status(500).json({ message: 'Failed to get video' });
  }
};