import cloudinary from '../config/cloudinary.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

// Upload a resource file (PDF, ZIP, etc.)
export const uploadResource = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'course_resources',
          resource_type: 'auto', // auto-detect file type
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      originalName: req.file.originalname,
    });
  } catch (error) {
    console.error('Resource upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
};

export { upload };