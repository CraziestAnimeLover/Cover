import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { getInstructorAnalytics, getPlatformAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/instructor', protect, roleMiddleware('instructor', 'admin'), getInstructorAnalytics);
router.get('/platform', protect, roleMiddleware('admin'), getPlatformAnalytics);

export default router;