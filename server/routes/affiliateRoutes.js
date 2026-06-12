import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import multer from 'multer';
import {
  getAffiliateDashboard,
  getDownlineTree,
  submitKYC,
  getKYCStatus,
  requestWithdrawal,
  getWithdrawalHistory,
  getCommissionHistory,
  getEarningsChart,
  getFormattedDownlineTree
} from '../controllers/affiliateController.js';

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// All affiliate routes require authentication
router.use(protect);
router.use(roleMiddleware('affiliate', 'agent', 'instructor', 'admin'));

// Dashboard & Data
router.get('/dashboard', getAffiliateDashboard);
router.get('/downline', getDownlineTree);
router.get('/downline-activity', getFormattedDownlineTree);
router.get('/earnings-chart', getEarningsChart);
router.get('/downline-tree', getFormattedDownlineTree);
router.get('/commissions', getCommissionHistory);
router.get('/withdrawals', getWithdrawalHistory);
router.get('/kyc-status', getKYCStatus);

// Mutations
router.post('/kyc', upload.fields([
  { name: 'frontImage', maxCount: 1 },
  { name: 'backImage', maxCount: 1 }
]), submitKYC);
router.post('/withdraw', requestWithdrawal);

export default router;