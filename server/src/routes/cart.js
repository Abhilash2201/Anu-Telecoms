import express from 'express';
import {
  addToCartController,
  getCartController,
  removeCartItemController,
  updateCartItemController
} from '../controllers/cartController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.get('/', getCartController);
router.post('/items', addToCartController);
router.patch('/items/:itemId', updateCartItemController);
router.delete('/items/:itemId', removeCartItemController);

export default router;
