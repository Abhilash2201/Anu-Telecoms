import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Divider,
  Rating,
  TextField,
  Typography
} from '@mui/material';
import api from '../api/apiClient';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';

interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  rating: number;
  tags: string[];
  highlights: string[];
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  User: { id: string; name: string };
}

function ReviewSection({ productId }: { productId: string }) {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const alreadyReviewed = reviews.some((r) => r.userId === user?.id);

  useEffect(() => {
    api
      .get(`/products/${productId}/reviews`)
      .then((res) => setReviews(res.data))
      .catch(console.error)
      .finally(() => setLoadingReviews(false));
  }, [productId]);

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await api.post(`/products/${productId}/reviews`, { rating, comment });
      setReviews((prev) => [res.data, ...prev]);
      setRating(null);
      setComment('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setSubmitError(msg ?? 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await api.delete(`/products/${productId}/reviews/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? 'Failed to delete review');
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" mb={2}>
        Customer Reviews
      </Typography>

      {isAuthenticated && !alreadyReviewed && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1">Write a Review</Typography>
            <Box>
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                Your rating
              </Typography>
              <Rating value={rating} onChange={(_, v) => setRating(v)} />
            </Box>
            <TextField
              label="Comment"
              multiline
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            {submitError && <Typography color="error">{submitError}</Typography>}
            <Button
              variant="contained"
              sx={{ width: 'fit-content' }}
              disabled={!rating || !comment.trim() || submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Submitting…' : 'Submit Review'}
            </Button>
          </CardContent>
        </Card>
      )}

      {loadingReviews ? (
        <CircularProgress size={24} />
      ) : reviews.length === 0 ? (
        <Typography color="text.secondary">No reviews yet. Be the first!</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {reviews.map((review) => (
            <Card key={review.id} variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle2">{review.User?.name ?? 'User'}</Typography>
                    <Rating value={review.rating} readOnly size="small" />
                  </Box>
                  {user && (user.id === review.userId || user.role === 'ADMIN') && (
                    <Button size="small" color="error" onClick={() => handleDelete(review.id)}>
                      Delete
                    </Button>
                  )}
                </Box>
                <Typography variant="body2" mt={1}>
                  {review.comment}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}

function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    if (!id) return;
    api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <CircularProgress />;
  if (!product) return <Typography>No product found.</Typography>;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      image: product.image,
      description: product.description,
      stock: product.stock
    });
    navigate('/cart');
  };

  return (
    <Box>
      <Card sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
        <CardMedia component="img" sx={{ width: { md: 420 } }} image={product.image} alt={product.name} />
        <CardContent sx={{ display: 'grid', gap: 2 }}>
          <Typography variant="h4">{product.name}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {product.brand} • {product.category}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating value={product.rating} readOnly precision={0.1} />
            <Typography variant="body2" color="text.secondary">
              ({product.rating.toFixed(1)})
            </Typography>
          </Box>
          <Typography variant="h5">{formatCurrency(product.price)}</Typography>
          <Typography color={product.stock > 0 ? 'success.main' : 'error.main'}>
            {product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}
          </Typography>
          <Typography>{product.description}</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {product.tags.map((tag) => (
              <Chip key={tag} label={tag} />
            ))}
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Highlights
            </Typography>
            {product.highlights.map((h) => (
              <Typography key={h} variant="body2" color="text.secondary">
                • {h}
              </Typography>
            ))}
          </Box>
          <Button variant="contained" onClick={handleAddToCart} disabled={product.stock <= 0} sx={{ width: 'fit-content' }}>
            Add to cart
          </Button>
        </CardContent>
      </Card>

      <Divider sx={{ my: 4 }} />
      <ReviewSection productId={product.id} />
    </Box>
  );
}

export default ProductDetailPage;
