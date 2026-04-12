import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';

function AccountPage() {
  const { user, isAdmin } = useAuth();

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        {isAdmin ? 'Admin Profile' : 'Account'}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">{isAdmin ? 'Store operator profile' : 'Customer profile'}</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {user
                  ? `${user.name || user.email} is signed in as ${user.role}.`
                  : 'Store customer details, saved addresses, contact preferences, and account security settings appear here.'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Architecture note</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                In single-vendor mode there is no vendor identity, payout profile, or seller ownership model. The account area only needs customer and admin concerns.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AccountPage;
