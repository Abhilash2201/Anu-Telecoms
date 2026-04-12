import { AppBar, Badge, Box, Button, Container, InputBase, Stack, Toolbar, Typography } from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import SearchIcon from '@mui/icons-material/Search';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import LogoutIcon from '@mui/icons-material/Logout';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Footer from './Footer';

interface Props {
  children: React.ReactNode;
}

const customerNav = [
  { label: 'Home', to: '/' },
  { label: 'Mobiles', to: '/' },
  { label: 'Appliances', to: '/' },
  { label: 'Accessories', to: '/' },
  { label: 'Brands', to: '/' },
  { label: 'Offers', to: '/' }
];

const adminNav = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Orders', to: '/orders' },
  { label: 'Catalog', to: '/' },
  { label: 'Customers', to: '/account' }
];

export default function Layout({ children }: Props) {
  const { getItemCount } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = isAdmin ? adminNav : customerNav;

  const handleSearch = () => {
    navigate(`/?q=${encodeURIComponent(search)}`);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7ff' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#1a4dc4' }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ minHeight: { xs: 76, md: 88 }, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Box component={RouterLink} to="/" sx={{ textDecoration: 'none', color: '#fff' }}>
              <Typography sx={{ fontSize: { xs: 26, md: 34 }, fontWeight: 900, lineHeight: 1 }}>
                ANU TELECOM
              </Typography>
              <Typography sx={{ letterSpacing: 4, fontSize: 15, fontWeight: 500, opacity: 0.95 }}>
                NAGAMANGALA
              </Typography>
            </Box>

            <Stack direction="row" spacing={{ xs: 1, md: 2 }} alignItems="center" sx={{ color: '#fff', flexWrap: 'wrap' }}>
              {!isAdmin ? (
                <Button
                  component={RouterLink}
                  to={isAuthenticated ? '/account' : '/login'}
                  color="inherit"
                  startIcon={<PersonIcon />}
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                  {isAuthenticated ? user?.name || 'Account' : 'Login'}
                </Button>
              ) : null}
              {!isAdmin ? (
                <Button color="inherit" startIcon={<FavoriteBorderIcon />} sx={{ textTransform: 'none', fontWeight: 700 }}>
                  Wishlist
                </Button>
              ) : null}
              {isAuthenticated ? (
                <Button
                  color="inherit"
                  startIcon={isAdmin ? <DashboardCustomizeIcon /> : <ReceiptLongIcon />}
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                  component={RouterLink}
                  to={isAdmin ? '/admin' : '/orders'}
                >
                  {isAdmin ? 'Admin' : 'Orders'}
                </Button>
              ) : null}
              <Button
                component={RouterLink}
                to="/cart"
                startIcon={<ShoppingCartOutlinedIcon />}
                sx={{
                  bgcolor: '#ff7a00',
                  color: '#fff',
                  px: 2.25,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 800,
                  '&:hover': { bgcolor: '#ef6c00' }
                }}
              >
                Cart ({getItemCount()})
              </Button>
              {isAuthenticated ? (
                <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout} sx={{ textTransform: 'none', fontWeight: 700 }}>
                  Logout
                </Button>
              ) : null}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #dbe5ff', boxShadow: '0 10px 20px rgba(9, 30, 66, 0.04)' }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ minHeight: 64, justifyContent: 'space-between', gap: 2, px: '0 !important', flexWrap: 'wrap' }}>
            <Stack direction="row" spacing={{ xs: 1, md: 3 }} sx={{ overflowX: 'auto', py: 1 }}>
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.to && item.label === 'Home';
                return (
                  <Button
                    key={item.label}
                    component={RouterLink}
                    to={item.to}
                    color="inherit"
                    sx={{
                      textTransform: 'none',
                      fontWeight: isActive ? 800 : 600,
                      color: '#1b2436',
                      borderBottom: isActive ? '3px solid #1a4dc4' : '3px solid transparent',
                      borderRadius: 0,
                      px: 1,
                      minWidth: 'auto'
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Stack>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #d4dcf2',
                borderRadius: 2,
                px: 2,
                py: 0.5,
                minWidth: { xs: '100%', md: 320 },
                bgcolor: '#fff'
              }}
            >
              <InputBase
                placeholder="Search for products..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                sx={{ flex: 1 }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <Button onClick={handleSearch} sx={{ minWidth: 'auto', color: '#123f9c' }}>
                <SearchIcon />
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </Box>

      <Box sx={{ pb: 2 }}>{children}</Box>
      <Footer />
    </Box>
  );
}
