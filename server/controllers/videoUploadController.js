import cloudinary from '../config/cloudinary.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'course_videos',
          eager: [{ streaming_profile: 'hd', format: 'm3u8' }, { format: 'mp4' }],
          eager_async: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    res.json({
      videoPublicId: result.public_id,   // ✅ this is critical
      videoUrl: result.secure_url,
      duration: Math.round(result.duration || 0),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Upload failed' });
  }
};

export { upload };