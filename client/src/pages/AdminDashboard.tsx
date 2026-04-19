import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '../api/apiClient';
import { formatCurrency } from '../utils/format';
import { useAuth } from '../context/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Metrics {
  activeProducts: number;
  lowStockProducts: number;
  openOrders: number;
  monthlyRevenue: number;
}

interface AdminProduct {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  stock: number;
  isActive: boolean;
  categoryId: string;
  image: string | null;
  description: string;
  discount: number;
}

interface AdminOrder {
  id: string;
  total: number;
  status: string;
  paymentMethod: string | null;
  trackingId: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
  items: { id: string; quantity: number; price: number; product: { name: string } }[];
}

const ORDER_STATUSES = ['PENDING', 'PAID', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const STATUS_COLOR: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  PENDING: 'warning',
  PAID: 'info',
  CONFIRMED: 'info',
  PACKED: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'error'
};

const EMPTY_PRODUCT = {
  id: '',
  name: '',
  description: '',
  price: '',
  discount: '0',
  stock: '',
  brand: '',
  categoryId: '',
  image: '',
  isActive: true
};

// ─── Metrics Tab ──────────────────────────────────────────────────────────────

function MetricsTab({ metrics }: { metrics: Metrics | null }) {
  const cards = [
    { label: 'Active Products', value: metrics?.activeProducts ?? '--' },
    { label: 'Low Stock', value: metrics?.lowStockProducts ?? '--' },
    { label: 'Open Orders', value: metrics?.openOrders ?? '--' },
    { label: 'Total Revenue', value: metrics ? formatCurrency(metrics.monthlyRevenue) : '--' }
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((c) => (
        <Grid item xs={12} md={3} key={c.label}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">{c.label}</Typography>
              <Typography variant="h4">{c.value}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

// ─── Products Tab ─────────────────────────────────────────────────────────────

function ProductsTab() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<typeof EMPTY_PRODUCT>(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEdit = Boolean(form.id);

  useEffect(() => {
    api
      .get('/products?limit=100')
      .then((res) => setProducts(res.data.items ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setForm(EMPTY_PRODUCT);
    setError('');
    setDialogOpen(true);
  };

  const openEdit = (p: AdminProduct) => {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description,
      price: String(p.price),
      discount: String(p.discount),
      stock: String(p.stock),
      brand: p.brand ?? '',
      categoryId: p.categoryId,
      image: p.image ?? '',
      isActive: p.isActive
    });
    setError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        action: isEdit ? 'update' : 'create',
        product: {
          ...(isEdit && { id: form.id }),
          name: form.name,
          description: form.description,
          price: Number(form.price),
          discount: Number(form.discount),
          stock: Number(form.stock),
          brand: form.brand || null,
          categoryId: form.categoryId || undefined,
          image: form.image || null,
          isActive: form.isActive
        }
      };
      const res = await api.post('/admin/products', payload);
      const saved: AdminProduct = res.data.product;
      setProducts((prev) =>
        isEdit ? prev.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...prev]
      );
      setDialogOpen(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.post('/admin/products', { action: 'delete', product: { id: productId } });
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? 'Delete failed');
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" onClick={openCreate}>
          New Product
        </Button>
      </Box>
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Brand</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Stock</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.brand ?? '—'}</TableCell>
                <TableCell>{p.categoryId}</TableCell>
                <TableCell align="right">{formatCurrency(p.price)}</TableCell>
                <TableCell align="right">
                  <Typography color={p.stock <= 5 ? 'error.main' : 'inherit'}>{p.stock}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={p.isActive ? 'Active' : 'Inactive'} color={p.isActive ? 'success' : 'default'} size="small" />
                </TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => openEdit(p)}>
                    Edit
                  </Button>
                  <Button size="small" color="error" onClick={() => handleDelete(p.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? 'Edit Product' : 'New Product'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          {error && <Typography color="error">{error}</Typography>}
          <TextField label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <TextField label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} multiline rows={3} />
          <TextField label="Category ID" value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))} required />
          <TextField label="Brand" value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Price (₹)" type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required fullWidth />
            <TextField label="Discount (%)" type="number" value={form.discount} onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))} fullWidth />
            <TextField label="Stock" type="number" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} required fullWidth />
          </Box>
          <TextField label="Image URL" value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} />
          <FormControl>
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={form.isActive ? 'active' : 'inactive'} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.value === 'active' }))}>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────

function OrdersTab() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, { status: string; trackingId: string }>>({});

  useEffect(() => {
    api
      .get('/admin/orders')
      .then((res) => {
        const data: AdminOrder[] = res.data;
        setOrders(data);
        const initial: typeof edits = {};
        data.forEach((o) => {
          initial[o.id] = { status: o.status, trackingId: o.trackingId ?? '' };
        });
        setEdits(initial);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (orderId: string) => {
    setSaving(orderId);
    try {
      const { status, trackingId } = edits[orderId];
      const res = await api.patch(`/admin/orders/${orderId}`, { status, trackingId: trackingId || null });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.data : o)));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? 'Update failed');
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Card>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Order ID</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Date</TableCell>
            <TableCell align="right">Total</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Tracking ID</TableCell>
            <TableCell align="right">Save</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => {
            const edit = edits[order.id] ?? { status: order.status, trackingId: order.trackingId ?? '' };
            const dirty = edit.status !== order.status || edit.trackingId !== (order.trackingId ?? '');
            return (
              <TableRow key={order.id}>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    #{order.id.slice(-8).toUpperCase()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{order.user.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{order.user.email}</Typography>
                </TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString('en-IN')}</TableCell>
                <TableCell align="right">{formatCurrency(order.total)}</TableCell>
                <TableCell sx={{ minWidth: 160 }}>
                  <Select
                    size="small"
                    value={edit.status}
                    onChange={(e) => setEdits((prev) => ({ ...prev, [order.id]: { ...edit, status: e.target.value } }))}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <MenuItem key={s} value={s}>
                        <Chip label={s} color={STATUS_COLOR[s] ?? 'default'} size="small" />
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell sx={{ minWidth: 160 }}>
                  <TextField
                    size="small"
                    placeholder="Tracking ID"
                    value={edit.trackingId}
                    onChange={(e) => setEdits((prev) => ({ ...prev, [order.id]: { ...edit, trackingId: e.target.value } }))}
                  />
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant={dirty ? 'contained' : 'outlined'}
                    disabled={!dirty || saving === order.id}
                    onClick={() => handleSave(order.id)}
                  >
                    {saving === order.id ? '…' : 'Save'}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}

// ─── Categories Tab ───────────────────────────────────────────────────────────

interface AdminCategory { id: string; name: string; productCount?: number; }

function CategoriesTab() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () =>
    api.get('/categories').then(res => setCategories(res.data.categories || [])).catch(console.error).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true); setError('');
    try {
      await api.post('/categories', { name: newName.trim() });
      setNewName('');
      await load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Failed to create category');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this category? Only possible if it has no products.')) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? 'Failed to delete category');
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'flex-start' }}>
        <TextField size="small" label="New category name" value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
          error={Boolean(error)} helperText={error} />
        <Button variant="contained" onClick={handleCreate} disabled={saving || !newName.trim()}>
          {saving ? '…' : 'Add'}
        </Button>
      </Box>
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell align="right">Products</TableCell>
              <TableCell align="right">Delete</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map(c => (
              <TableRow key={c.id}>
                <TableCell><Typography variant="body2" fontFamily="monospace">{c.id}</Typography></TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell align="right">{c.productCount ?? '—'}</TableCell>
                <TableCell align="right">
                  <Button size="small" color="error" disabled={(c.productCount ?? 0) > 0} onClick={() => handleDelete(c.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}

// ─── Customers Tab ────────────────────────────────────────────────────────────

interface Customer {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

function CustomersTab() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/customers')
      .then((res) => setCustomers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <Card>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Joined</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>
                <Typography color="text.secondary">No customers yet.</Typography>
              </TableCell>
            </TableRow>
          ) : (
            customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>
                  <Chip label={c.role} size="small" color={c.role === 'ADMIN' ? 'primary' : 'default'} />
                </TableCell>
                <TableCell>{new Date(c.createdAt).toLocaleDateString('en-IN')}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

const TAB_KEYS = ['dashboard', 'products', 'orders', 'customers', 'categories'];

function AdminDashboard() {
  const { isAdmin, loading } = useAuth();
  const location = useLocation();
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  const initialTab = useMemo(() => {
    const param = new URLSearchParams(location.search).get('tab');
    const idx = TAB_KEYS.indexOf(param ?? '');
    return idx >= 0 ? idx : 0;
  }, [location.search]);

  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then((res) => setMetrics(res.data.metrics))
      .catch(console.error);
  }, []);

  if (!loading && !isAdmin) return <Navigate to="/" replace />;

  const sectionTitle = ['Dashboard', 'Products', 'Orders', 'Customers', 'Categories'][tab] ?? 'Dashboard';

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        {sectionTitle}
      </Typography>
      {tab === 0 && <MetricsTab metrics={metrics} />}
      {tab === 1 && <ProductsTab />}
      {tab === 2 && <OrdersTab />}
      {tab === 3 && <CustomersTab />}
      {tab === 4 && <CategoriesTab />}
    </Box>
  );
}

export default AdminDashboard;
