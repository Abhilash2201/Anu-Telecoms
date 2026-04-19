import {
  Alert,
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
  Divider,
  IconButton,
  TextField,
  Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import api from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

const EMPTY_FORM = { street: '', city: '', state: '', pincode: '' };

function AccountPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    api.get('/auth/addresses')
      .then(res => setAddresses(res.data.addresses || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!form.street.trim() || !form.city.trim() || !form.state.trim() || !form.pincode.trim()) {
      setFormError('All fields are required'); return;
    }
    setSaving(true); setFormError('');
    try {
      const res = await api.post('/auth/addresses', form);
      setAddresses(prev => [...prev, res.data.address]);
      setDialogOpen(false);
      setForm(EMPTY_FORM);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(msg ?? 'Failed to save address');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/auth/addresses/${id}`);
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch { alert('Failed to delete address'); }
  };

  if (!user) return null;

  return (
    <Box sx={{ maxWidth: 640 }}>
      <Typography variant="h4" mb={3}>My Account</Typography>

      {/* Profile */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">{user.name ?? 'Customer'}</Typography>
              <Typography color="text.secondary" variant="body2">{user.email}</Typography>
            </Box>
            <Chip label={user.role} size="small" color={user.role === 'ADMIN' ? 'primary' : 'default'} />
          </Box>
        </CardContent>
      </Card>

      {/* Addresses */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="h6">Saved Addresses</Typography>
        <Button size="small" startIcon={<AddIcon />} variant="outlined" onClick={() => { setForm(EMPTY_FORM); setFormError(''); setDialogOpen(true); }}>
          Add Address
        </Button>
      </Box>

      {loading ? (
        <CircularProgress size={24} />
      ) : addresses.length === 0 ? (
        <Card variant="outlined">
          <CardContent>
            <Typography color="text.secondary">No saved addresses. Add one to speed up checkout.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {addresses.map((a, i) => (
            <Card key={a.id} variant="outlined">
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', py: '12px !important' }}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>Address {i + 1}</Typography>
                  <Typography variant="body2" color="text.secondary">{a.street}</Typography>
                  <Typography variant="body2" color="text.secondary">{a.city}, {a.state} – {a.pincode}</Typography>
                </Box>
                <IconButton size="small" color="error" onClick={() => handleDelete(a.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Add Address Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>New Address</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {formError && <Alert severity="error">{formError}</Alert>}
          <TextField label="Street / Area" size="small" fullWidth multiline rows={2}
            value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} />
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <TextField label="City"  size="small" fullWidth value={form.city}    onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
            <TextField label="State" size="small" fullWidth value={form.state}   onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
          </Box>
          <TextField label="PIN Code" size="small" fullWidth value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AccountPage;
