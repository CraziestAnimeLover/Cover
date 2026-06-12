import express from 'express';
import {
  getMyReferrals,
  getReferralLink,
  trackReferralConversion,
  getCommissions
} from '../controllers/referralController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my-referrals', protect, getMyReferrals);
router.get('/link', protect, getReferralLink);
router.get('/commissions', protect, getCommissions);
router.post('/track/:referralCode', protect, trackReferralConversion);

export default router;