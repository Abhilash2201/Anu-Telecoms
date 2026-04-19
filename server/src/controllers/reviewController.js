import { randomUUID } from 'crypto';
import prisma from '../db.js';

async function recalcProductRating(productId) {
  const agg = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true }
  });
  await prisma.product.update({
    where: { id: productId },
    data: { rating: agg._avg.rating ?? 0 }
  });
}

export async function getProductReviews(req, res) {
  const { productId } = req.params;
  const reviews = await prisma.review.findMany({
    where: { productId },
    include: { User: { select: { id: true, name: true } } },
    orderBy: { id: 'desc' }
  });
  return res.json(reviews);
}

export async function createReview(req, res) {
  const { productId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.id;

  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }
  if (!comment || !String(comment).trim()) {
    return res.status(400).json({ message: 'Comment is required' });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const existing = await prisma.review.findFirst({ where: { productId, userId } });
  if (existing) return res.status(409).json({ message: 'You have already reviewed this product' });

  const review = await prisma.review.create({
    data: { id: randomUUID(), userId, productId, rating: ratingNum, comment: String(comment).trim() },
    include: { User: { select: { id: true, name: true } } }
  });

  await recalcProductRating(productId);
  return res.status(201).json(review);
}

export async function deleteReview(req, res) {
  const { productId, reviewId } = req.params;
  const userId = req.user.id;

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review || review.productId !== productId) {
    return res.status(404).json({ message: 'Review not found' });
  }
  if (review.userId !== userId && req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  await prisma.review.delete({ where: { id: reviewId } });
  await recalcProductRating(productId);
  return res.json({ message: 'Review deleted' });
}
