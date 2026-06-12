import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadResource, upload } from '../controllers/resourceController.js';

const router = express.Router();
router.post('/upload', protect, upload.single('file'), uploadResource);
export default router;