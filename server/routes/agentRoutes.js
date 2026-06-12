import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import {
  getAgentDashboard,
  getAgentEarnings,
  requestPayout,
  getPayoutHistory
} from '../controllers/agentController.js';

const router = express.Router();

// All agent routes require authentication
router.use(protect);
router.use(roleMiddleware('instructor', 'agent', 'admin'));

router.get('/dashboard', getAgentDashboard);
router.get('/earnings', getAgentEarnings);
router.post('/request-payout', requestPayout);
router.get('/payouts', getPayoutHistory);

export default router;