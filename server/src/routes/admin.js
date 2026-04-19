import express from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import { getAdminDashboard, getAdminOrders, updateOrderStatus, manageProducts, getCustomers } from '../controllers/adminController.js';

const router = express.Router();

router.use(authenticate);
router.use(authorizeAdmin);
router.get('/dashboard', getAdminDashboard);
router.get('/customers', getCustomers);
router.get('/orders', getAdminOrders);
router.patch('/orders/:id', updateOrderStatus);
router.post('/products', manageProducts);

export default router;
