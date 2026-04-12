import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, CardMedia, Chip, CircularProgress, Typography } from '@mui/material';
import api from '../api/apiClient';
import { useCart } from '../context/CartContext';
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
    <Card sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
      <CardMedia component="img" sx={{ width: { md: 420 } }} image={product.image} alt={product.name} />
      <CardContent sx={{ display: 'grid', gap: 2 }}>
        <Typography variant="h4">{product.name}</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {product.brand} • {product.category}
        </Typography>
        <Typography variant="h5">{formatCurrency(product.price)}</Typography>
        <Typography color={product.stock > 0 ? 'success.main' : 'error.main'}>
          {product.stock > 0 ? `${product.stock} units available for the store inventory` : 'Out of stock'}
        </Typography>
        <Typography>{product.description}</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {product.tags.map((tag) => (
            <Chip key={tag} label={tag} />
          ))}
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Why this product fits the single-vendor catalog
          </Typography>
          {product.highlights.map((highlight) => (
            <Typography key={highlight} variant="body2" color="text.secondary">
              • {highlight}
            </Typography>
          ))}
        </Box>
        <Button variant="contained" onClick={handleAddToCart} disabled={product.stock <= 0} sx={{ width: 'fit-content' }}>
          Add to cart
        </Button>
      </CardContent>
    </Card>
  );
}

export default ProductDetailPage;
