import express from 'express';
import { 
  createPaymentIntent, 
  handleWebhook, 
  getPaymentStatus, 
  getMyPurchases,
  createRazorpayOrder,
  verifyPayment
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Stripe routes
router.post('/create-payment-intent', createPaymentIntent);
router.get('/status/:paymentIntentId', protect, getPaymentStatus);
router.get('/my-purchases', protect, getMyPurchases);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Razorpay routes (public – used during registration)
router.post('/create-razorpay-order', createRazorpayOrder);
router.post('/verify-payment', verifyPayment);

export default router;