import { Box, Button, Card, CardContent, Grid, MenuItem, TextField, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';

function CheckoutPage() {
  const { state, getTotal } = useCart();
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    line1: '',
    city: '',
    pinCode: ''
  });

  const totalItems = useMemo(() => state.items.reduce((count, item) => count + item.quantity, 0), [state.items]);

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        Checkout
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Delivery address
              </Typography>
              <TextField
                label="Full name"
                fullWidth
                sx={{ mb: 2 }}
                value={address.fullName}
                onChange={(event) => setAddress({ ...address, fullName: event.target.value })}
              />
              <TextField
                label="Phone"
                fullWidth
                sx={{ mb: 2 }}
                value={address.phone}
                onChange={(event) => setAddress({ ...address, phone: event.target.value })}
              />
              <TextField
                label="Address"
                fullWidth
                multiline
                rows={3}
                sx={{ mb: 2 }}
                value={address.line1}
                onChange={(event) => setAddress({ ...address, line1: event.target.value })}
              />
              <TextField
                label="City"
                fullWidth
                sx={{ mb: 2 }}
                value={address.city}
                onChange={(event) => setAddress({ ...address, city: event.target.value })}
              />
              <TextField
                label="Pin code"
                fullWidth
                sx={{ mb: 2 }}
                value={address.pinCode}
                onChange={(event) => setAddress({ ...address, pinCode: event.target.value })}
              />
              <TextField select label="Payment method" fullWidth defaultValue="online">
                <MenuItem value="online">Online payment placeholder</MenuItem>
                <MenuItem value="cod">Cash on delivery</MenuItem>
              </TextField>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3 }}>
            <CardContent>
              <Typography variant="h6">Single-vendor checkout summary</Typography>
              <Typography sx={{ mt: 2 }} color="text.secondary">
                Items: {totalItems}
              </Typography>
              <Typography color="text.secondary">Fulfillment source: Central store inventory</Typography>
              <Typography color="text.secondary">Payment flow: validate stock, initiate payment, then create the order</Typography>
              <Typography variant="h5" sx={{ mt: 3 }}>
                {formatCurrency(getTotal())}
              </Typography>
              <Button variant="contained" sx={{ mt: 3 }} fullWidth disabled={state.items.length === 0}>
                Proceed to payment integration
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default CheckoutPage;
