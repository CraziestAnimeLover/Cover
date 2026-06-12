import express from 'express';
import { registerWithPurchase, getRegistrationData } from '../controllers/registerController.js';

const router = express.Router();

router.post('/with-purchase', registerWithPurchase);
router.get('/data', getRegistrationData);

export default router;