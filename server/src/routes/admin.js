import express from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import { getAdminDashboard, getAdminOrders, manageProducts } from '../controllers/adminController.js';

const router = express.Router();

router.use(authenticate);
router.use(authorizeAdmin);
router.get('/dashboard', getAdminDashboard);
router.get('/orders', getAdminOrders);
router.post('/products', manageProducts);

export default router;
