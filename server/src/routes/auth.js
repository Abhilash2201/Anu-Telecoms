import express from 'express';
import { loginController, meController, registerController } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.get('/me', authenticate, meController);

export default router;
