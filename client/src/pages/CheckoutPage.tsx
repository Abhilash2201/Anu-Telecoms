import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';

interface SavedAddress {
  id: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

type AddressMode = 'new' | 'saved';

function CheckoutPage() {
  const { state, getTotal, clearCart } = useCart();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [addressMode, setAddressMode] = useState<AddressMode>('new');
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [form, setForm] = useState({ fullName: '', phone: '', street: '', city: '', state: '', pincode: '' });
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { navigate('/login'); return; }
    if (isAuthenticated) {
      api.get('/auth/addresses').then(res => {
        const list: SavedAddress[] = res.data.addresses || [];
        setSavedAddresses(list);
        if (list.length > 0) { setAddressMode('saved'); setSelectedAddressId(list[0].id); }
      }).catch(console.error);
    }
  }, [isAuthenticated, authLoading]);

  if (state.items.length === 0 && !submitting) {
    return (
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Typography variant="h5" mb={2}>Your cart is empty</Typography>
        <Button variant="contained" onClick={() => navigate('/shop')}>Shop Now</Button>
      </Box>
    );
  }

  const buildAddress = () => {
    if (addressMode === 'saved') {
      const a = savedAddresses.find(a => a.id === selectedAddressId);
      if (!a) return null;
      return { street: a.street, city: a.city, state: a.state, pincode: a.pincode };
    }
    return { name: form.fullName, phone: form.phone, street: form.street, city: form.city, state: form.state, pincode: form.pincode };
  };

  const validate = (): string => {
    if (addressMode === 'new') {
      if (!form.fullName.trim()) return 'Full name is required';
      if (!form.phone.trim())    return 'Phone is required';
      if (!form.street.trim())   return 'Address is required';
      if (!form.city.trim())     return 'City is required';
      if (!form.pincode.trim())  return 'Pin code is required';
    } else if (!selectedAddressId) {
      return 'Please select a delivery address';
    }
    return '';
  };

  const handlePlaceOrder = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    const address = buildAddress();
    if (!address) { setError('Invalid address'); return; }

    setSubmitting(true);
    setError('');
    try {
      const items = state.items.map(item => ({ productId: item.productId, quantity: item.quantity }));
      const res = await api.post('/orders', { items, address, paymentMethod });
      await clearCart();
      navigate('/orders', { state: { successOrderId: res.data.order.id } });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const total = getTotal();
  const field = (label: string, key: keyof typeof form, opts?: { multiline?: boolean; rows?: number }) => (
    <TextField
      label={label} fullWidth size="small" sx={{ mb: 2 }}
      value={form[key]}
      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
      {...opts}
    />
  );

  return (
    <Box>
      <Typography variant="h4" mb={3}>Checkout</Typography>
      <Grid container spacing={3}>
        {/* ── Left: Address + Payment ── */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Delivery Address</Typography>

              {savedAddresses.length > 0 && (
                <RadioGroup row value={addressMode} onChange={e => setAddressMode(e.target.value as AddressMode)} sx={{ mb: 2 }}>
                  <FormControlLabel value="saved" control={<Radio size="small" />} label="Saved address" />
                  <FormControlLabel value="new"   control={<Radio size="small" />} label="New address" />
                </RadioGroup>
              )}

              {addressMode === 'saved' ? (
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Select address</InputLabel>
                  <Select label="Select address" value={selectedAddressId} onChange={e => setSelectedAddressId(e.target.value)}>
                    {savedAddresses.map(a => (
                      <MenuItem key={a.id} value={a.id}>
                        {a.street}, {a.city}, {a.state} – {a.pincode}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <>
                  {field('Full Name', 'fullName')}
                  {field('Phone', 'phone')}
                  {field('Street Address', 'street', { multiline: true, rows: 2 })}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField label="City"  size="small" fullWidth value={form.city}    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}    sx={{ mb: 2 }} />
                    <TextField label="State" size="small" fullWidth value={form.state}   onChange={e => setForm(f => ({ ...f, state: e.target.value }))}   sx={{ mb: 2 }} />
                    <TextField label="PIN"   size="small" fullWidth value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} sx={{ mb: 2 }} />
                  </Box>
                </>
              )}

              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" mb={1}>Payment Method</Typography>
              <RadioGroup value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as 'COD' | 'ONLINE')}>
                <FormControlLabel value="COD"    control={<Radio />} label="Cash on Delivery" />
                <FormControlLabel value="ONLINE" control={<Radio />} label="Online Payment (coming soon)" disabled />
              </RadioGroup>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Right: Order Summary ── */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Order Summary</Typography>
              {state.items.map(item => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ flex: 1, pr: 1 }}>
                    {item.product.name} × {item.quantity}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency((item.product.discountedPrice ?? item.product.price) * item.quantity)}
                  </Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Delivery</Typography>
                <Typography color="success.main" fontWeight={600}>FREE</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">{formatCurrency(total)}</Typography>
              </Box>

              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

              <Button
                variant="contained"
                size="large"
                fullWidth
                sx={{ mt: 3 }}
                disabled={submitting}
                onClick={handlePlaceOrder}
              >
                {submitting ? <CircularProgress size={22} color="inherit" /> : `Place Order · ${formatCurrency(total)}`}
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                By placing the order you agree to our terms &amp; conditions.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default CheckoutPage;
