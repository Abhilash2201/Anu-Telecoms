import express from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import { getAdminDashboard, getAdminOrders, updateOrderStatus, manageProducts, getCustomers } from '../controllers/adminController.js';

const router = express.Router();

// Apply authenticate + authorizeAdmin to every route in this router at once,
// rather than adding the middleware to each route individually.
router.use(authenticate);
router.use(authorizeAdmin);

router.get('/dashboard', getAdminDashboard);
router.get('/customers', getCustomers);
router.get('/orders', getAdminOrders);
router.patch('/orders/:id', updateOrderStatus);
// Single endpoint for create / update / delete — action is passed in the request body
router.post('/products', manageProducts);

export default router;
