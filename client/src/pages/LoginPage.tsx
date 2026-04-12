import { Alert, Box, Button, Card, CardContent, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { SyntheticEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (_event: SyntheticEvent, value: 'login' | 'register') => {
    setTab(value);
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }

      if (email === 'admin@anutelecom.local') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (submissionError: any) {
      setError(submissionError?.response?.data?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '70vh',
        background: 'linear-gradient(135deg, #eaf1ff 0%, #f8fbff 100%)',
        borderRadius: 4,
        p: { xs: 2, md: 4 }
      }}
    >
      <Card sx={{ maxWidth: 460, width: '100%', borderRadius: 4, boxShadow: '0 30px 60px rgba(26, 77, 196, 0.12)' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#123f9c' }}>
            Welcome to Anu Telecom
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {tab === 'login'
              ? 'Login as a customer to shop, or as admin to manage the store.'
              : 'Create a customer account for the storefront.'}
          </Typography>

          <Tabs value={tab} onChange={handleTabChange} sx={{ mt: 3, mb: 3 }}>
            <Tab label="Login" value="login" />
            <Tab label="Register" value="register" />
          </Tabs>

          <Stack spacing={2.2}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            {tab === 'register' ? <TextField label="Full name" value={name} onChange={(event) => setName(event.target.value)} /> : null}
            <TextField label="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
            <TextField label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              sx={{ py: 1.4, bgcolor: '#ff7a00', '&:hover': { bgcolor: '#ef6c00' }, fontWeight: 800 }}
            >
              {loading ? 'Please wait...' : tab === 'login' ? 'Login' : 'Create Account'}
            </Button>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            Demo admin credentials: `admin@anutelecom.local` / `admin123`
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginPage;
