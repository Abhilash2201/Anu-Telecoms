import express from 'express';
import { createOrder, getOrders, cancelOrder } from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, createOrder);
router.get('/', authenticate, getOrders);
router.patch('/:id/cancel', authenticate, cancelOrder);

export default router;
