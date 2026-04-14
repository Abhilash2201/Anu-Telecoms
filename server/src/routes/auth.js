import express from 'express';
import {
  createAddressController,
  deleteAddressController,
  getAddressesController,
  getProfileController,
  loginController,
  meController,
  registerController,
  updateAddressController,
  updateProfileController
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.get('/me', authenticate, meController);
router.get('/profile', authenticate, getProfileController);
router.patch('/profile', authenticate, updateProfileController);
router.get('/addresses', authenticate, getAddressesController);
router.post('/addresses', authenticate, createAddressController);
router.patch('/addresses/:id', authenticate, updateAddressController);
router.delete('/addresses/:id', authenticate, deleteAddressController);

export default router;
