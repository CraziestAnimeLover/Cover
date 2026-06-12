import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import {
  getAdminDashboard,
  getAllUsers,
  updateUserRole,
  approveCourse,
  getPendingCourses,
  getAllPayouts,
  processPayout,
  getAllCoursesForAdmin,
  getPendingWithdrawals,   // ADD
  getWithdrawalStats,      // ADD
  getPlatformAnalytics,
  searchUsers,
  bulkProcessWithdrawals,
  exportWithdrawalsToCSV,
} from '../controllers/adminController.js';
import {
  getPendingKYC,
  approveKYC,
  rejectKYC,
} from '../controllers/kycAdminController.js';
import {
  getCommissionConfig,
  updateCommissionConfig,
} from '../controllers/commissionConfigController.js';   // ADD

const router = express.Router();

router.use(protect);
router.use(roleMiddleware('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/withdrawals/pending', getPendingWithdrawals);
router.get('/withdrawals/stats', getWithdrawalStats);
router.get('/analytics', getPlatformAnalytics);
router.get('/users', getAllUsers);

router.post('/withdrawals/bulk-process', bulkProcessWithdrawals);
router.get('/withdrawals/export', exportWithdrawalsToCSV);

// Inside the router (after authentication middleware)
router.get('/users/search', searchUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/courses', getAllCoursesForAdmin);
router.put('/courses/:id/approve', approveCourse);
router.get('/courses/pending', getPendingCourses);
router.get('/payouts', getAllPayouts);
router.put('/payouts/:id/process', processPayout);

// KYC routes
router.get('/kyc/pending', getPendingKYC);
router.put('/kyc/:id/approve', approveKYC);
router.put('/kyc/:id/reject', rejectKYC);

// Commission Config routes
router.get('/commission-config', getCommissionConfig);
router.put('/commission-config', updateCommissionConfig);

export default router;