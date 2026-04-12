import express from 'express';
import { getStorefrontSnapshot } from '../controllers/storefrontController.js';

const router = express.Router();

router.get('/', getStorefrontSnapshot);

export default router;
