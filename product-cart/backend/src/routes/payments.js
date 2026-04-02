import express from 'express';
import { 
  initiatePayment, 
  checkPaymentStatus 
} from '../controllers/paymentController.js';
import { validatePaymentRequest } from '../middleware/validation.js';

const router = express.Router();

/**
 * POST /api/payments/initiate
 * Initiate a payment request with Snippe
 */
router.post('/initiate', validatePaymentRequest, initiatePayment);

/**
 * GET /api/payments/status/:paymentId
 * Check the status of a payment
 */
router.get('/status/:paymentId', checkPaymentStatus);

export default router;
