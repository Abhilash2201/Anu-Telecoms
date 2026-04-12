import { Button, Card, CardActions, CardContent, CardMedia, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { formatCurrency } from '../utils/format';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  brand: string;
  category?: string;
  stock?: number;
}

export default function ProductCard({ id, name, price, image, brand, category, stock }: ProductCardProps) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia component="img" height="180" image={image} alt={name} />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div">
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {brand}
        </Typography>
        {category ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {category}
          </Typography>
        ) : null}
        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          {formatCurrency(price)}
        </Typography>
        {typeof stock === 'number' ? (
          <Typography variant="body2" color={stock > 0 ? 'success.main' : 'error.main'} sx={{ mt: 1 }}>
            {stock > 0 ? `${stock} units available` : 'Out of stock'}
          </Typography>
        ) : null}
      </CardContent>
      <CardActions>
        <Button size="small" component={RouterLink} to={`/product/${id}`}>
          View details
        </Button>
      </CardActions>
    </Card>
  );
}
