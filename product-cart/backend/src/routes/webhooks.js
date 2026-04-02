import express from 'express';
import { 
  handlePaymentWebhook,
  getWebhookStatus 
} from '../controllers/webhookController.js';

const router = express.Router();

/**
 * GET /api/webhooks/status
 * Check webhook endpoint status
 */
router.get('/status', getWebhookStatus);

/**
 * POST /api/webhooks/payment-webhook
 * Legacy endpoint for payment webhooks
 */
router.post('/payment-webhook', handlePaymentWebhook);

/**
 * POST /api/webhooks/snippe
 * Receive payment status updates from Snippe
 */
router.post('/snippe', handlePaymentWebhook);

export default router;
