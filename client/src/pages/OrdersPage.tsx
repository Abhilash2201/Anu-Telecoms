import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import api from '../api/apiClient';
import { formatCurrency } from '../utils/format';
import { useAuth } from '../context/AuthContext';

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: { id: string; name: string; image: string | null };
}

interface Order {
  id: string;
  total: number;
  status: string;
  paymentMethod: string | null;
  paymentStatus: string | null;
  trackingId: string | null;
  address: Record<string, string> | null;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_COLOR: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  PENDING: 'warning',
  PAID: 'info',
  CONFIRMED: 'info',
  PACKED: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'error'
};

function OrderRow({ order, onCancel }: { order: Order; onCancel: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      await api.patch(`/orders/${order.id}/cancel`, {});
      onCancel(order.id);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? 'Failed to cancel order');
    } finally { setCancelling(false); }
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen((v) => !v)}>
            {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontFamily="monospace">
            #{order.id.slice(-8).toUpperCase()}
          </Typography>
        </TableCell>
        <TableCell>{new Date(order.createdAt).toLocaleDateString('en-IN')}</TableCell>
        <TableCell>{formatCurrency(order.total)}</TableCell>
        <TableCell>
          <Chip
            label={order.status}
            color={STATUS_COLOR[order.status] ?? 'default'}
            size="small"
          />
        </TableCell>
        <TableCell>{order.paymentMethod ?? '—'}</TableCell>
        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {order.trackingId ?? '—'}
          </Typography>
        </TableCell>
        <TableCell>
          {canCancel && (
            <Button size="small" color="error" variant="outlined" disabled={cancelling} onClick={handleCancel}>
              {cancelling ? '…' : 'Cancel'}
            </Button>
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={8} sx={{ py: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ py: 2, px: 4 }}>
              {order.address && (
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Deliver to: {[order.address.street, order.address.city, order.address.state, order.address.pincode].filter(Boolean).join(', ')}
                </Typography>
              )}
              <Divider sx={{ mb: 1 }} />
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.product?.name ?? item.productId}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.price * item.quantity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function OrdersPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const successOrderId: string | undefined = (location.state as { successOrderId?: string } | null)?.successOrderId;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!authLoading) {
      api
        .get('/orders')
        .then((res) => setOrders(res.data))
        .catch(() => setError('Failed to load orders.'))
        .finally(() => setLoading(false));
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        My Orders
      </Typography>

      {successOrderId && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Order placed successfully! Order ID: <strong>#{successOrderId.slice(-8).toUpperCase()}</strong>. We'll process it shortly.
        </Alert>
      )}

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      {orders.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">No orders yet. Start shopping!</Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Order ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Tracking</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onCancel={(id) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'CANCELLED' } : o))}
                />
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </Box>
  );
}

export default OrdersPage;
