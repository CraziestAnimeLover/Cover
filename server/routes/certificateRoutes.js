import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getCertificate } from '../controllers/certificateController.js';

const router = express.Router();

router.get('/:enrollmentId', protect, getCertificate);

export default router;