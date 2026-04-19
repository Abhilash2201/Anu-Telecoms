import express from 'express';
import { getProductReviews, createReview, deleteReview } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.get('/', getProductReviews);
router.post('/', authenticate, createReview);
router.delete('/:reviewId', authenticate, deleteReview);

export default router;
