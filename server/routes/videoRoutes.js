import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadVideo, upload } from '../controllers/videoUploadController.js';
import { getVideoSignedUrl } from '../controllers/videoController.js';

const router = express.Router();

router.post('/upload', protect, upload.single('video'), uploadVideo);
router.get('/signed-url/:lectureId', protect, getVideoSignedUrl);

export default router;