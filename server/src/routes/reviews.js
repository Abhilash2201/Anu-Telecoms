import express from 'express';
import { getProductReviews, createReview, deleteReview } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';

// mergeParams: true is required so that :productId from the parent route
// (/api/products/:productId/reviews) is accessible as req.params.productId
// inside these nested route handlers.
const router = express.Router({ mergeParams: true });

router.get('/', getProductReviews);
router.post('/', authenticate, createReview);
router.delete('/:reviewId', authenticate, deleteReview);

export default router;
