import express from 'express';
import { getAllOrders, patchOrderStatus } from '../controllers/orderController.js';

const router = express.Router();

router.get('/', getAllOrders);
router.patch('/:id/status', express.json(), patchOrderStatus);

export default router;
