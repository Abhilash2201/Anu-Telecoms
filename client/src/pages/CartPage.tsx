import { Box, Button, Card, CardContent, CardMedia, Grid, IconButton, TextField, Typography } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/format';

function CartPage() {
  const { state, removeFromCart, updateQuantity, getTotal } = useCart();
  const navigate = useNavigate();

  if (state.items.length === 0) {
    return (
      <Box>
        <Typography variant="h4" mb={3}>
          Your Cart
        </Typography>
        <Typography>Your cart is empty.</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/')}>
          Continue Shopping
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        Your Cart
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          {state.items.map((item) => (
            <Card key={item.product.id} sx={{ display: 'flex', mb: 2 }}>
              <CardMedia
                component="img"
                sx={{ width: 100, height: 100, objectFit: 'cover' }}
                image={item.product.image}
                alt={item.product.name}
              />
              <CardContent sx={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">{item.product.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.product.brand} • {item.product.category}
                  </Typography>
                  <Typography variant="subtitle1">{formatCurrency(item.product.price)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TextField
                    type="number"
                    value={item.quantity}
                    onChange={(event) => updateQuantity(item.product.id, parseInt(event.target.value, 10) || 0)}
                    inputProps={{ min: 1 }}
                    sx={{ width: 80, mr: 2 }}
                  />
                  <IconButton onClick={() => removeFromCart(item.product.id)}>
                    <Delete />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6">Order summary</Typography>
            <Typography sx={{ mt: 2 }}>Subtotal: {formatCurrency(getTotal())}</Typography>
            <Typography sx={{ mt: 1 }}>Shipping: Free</Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>
              Total: {formatCurrency(getTotal())}
            </Typography>
            <Button variant="contained" sx={{ mt: 3 }} fullWidth onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default CartPage;
