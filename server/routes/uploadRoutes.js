import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadAvatar, upload } from '../controllers/uploadController.js';

const router = express.Router();

router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

export default router;