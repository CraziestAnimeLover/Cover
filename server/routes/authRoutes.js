import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { registerUser, loginUser, getProfile, updateProfile ,changePassword} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/change-password', protect, changePassword);

export default router;