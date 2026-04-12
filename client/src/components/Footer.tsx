import { Box, Container, Grid, Link, Stack, Typography } from '@mui/material';
import CallIcon from '@mui/icons-material/Call';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function Footer() {
  return (
    <Box sx={{ mt: 6, background: 'linear-gradient(180deg, #f7f9ff 0%, #e9efff 100%)', borderTop: '1px solid #dbe4ff' }}>
      <Container maxWidth="xl" sx={{ py: 5 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#123f9c', mb: 2 }}>
              Anu Telecom
            </Typography>
            <Stack spacing={1.5} color="text.secondary">
              <Stack direction="row" spacing={1} alignItems="center">
                <LocationOnIcon fontSize="small" />
                <Typography variant="body2">+46, MG Road, Nagamangala, Karnataka, 571422</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <CallIcon fontSize="small" />
                <Typography variant="body2">+91 98451 23456</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <EmailIcon fontSize="small" />
                <Typography variant="body2">info@anutelecom.com</Typography>
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Quick Links
            </Typography>
            <Stack spacing={1}>
              <Link underline="hover" color="inherit" href="#">
                About Us
              </Link>
              <Link underline="hover" color="inherit" href="#">
                Contact Us
              </Link>
              <Link underline="hover" color="inherit" href="#">
                Privacy Policy
              </Link>
              <Link underline="hover" color="inherit" href="#">
                Refund Policy
              </Link>
            </Stack>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Customer Service
            </Typography>
            <Stack spacing={1}>
              <Link underline="hover" color="inherit" href="#">
                FAQ
              </Link>
              <Link underline="hover" color="inherit" href="#">
                Track Order
              </Link>
              <Link underline="hover" color="inherit" href="#">
                Shipping Info
              </Link>
              <Link underline="hover" color="inherit" href="#">
                Offers & Deals
              </Link>
            </Stack>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Contact Us
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Customer Support, Mon - Sat 8:00 AM to 9:00 PM
            </Typography>
            <Typography variant="h6" sx={{ mt: 2, color: '#123f9c', fontWeight: 800 }}>
              +91 98451 23456
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              info@anutelecom.com
            </Typography>
          </Grid>
        </Grid>
      </Container>
      <Box sx={{ bgcolor: '#13255a', color: '#fff', textAlign: 'center', py: 2 }}>
        <Typography variant="body2">© 2024 Anu Telecom Nagamangala. All Rights Reserved.</Typography>
      </Box>
    </Box>
  );
}
