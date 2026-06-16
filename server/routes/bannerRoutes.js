import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import {
  createBanner,
  getAllBanners,
  getActiveBanners,
  updateBanner,
  deleteBanner,
  reorderBanners,
} from '../controllers/bannerController.js';

const router = express.Router();

// Public
router.get('/active', getActiveBanners);

// Admin only
router.use(protect, roleMiddleware('admin'));
router.get('/', getAllBanners);
router.post('/', upload.single('image'), createBanner);
router.put('/:id', upload.single('image'), updateBanner);
router.delete('/:id', deleteBanner);
router.post('/reorder', reorderBanners);

export default router;