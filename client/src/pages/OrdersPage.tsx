import { Box, Card, CardContent, Grid, Typography } from '@mui/material';

const orderStates = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];

function OrdersPage() {
  return (
    <Box>
      <Typography variant="h4" mb={3}>
        Orders
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h6">Single-store order lifecycle</Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {orderStates.map((state, index) => (
              <Grid item xs={12} md={2} key={state}>
                <Typography variant="overline" color="primary.main">
                  Step {index + 1}
                </Typography>
                <Typography>{state}</Typography>
              </Grid>
            ))}
          </Grid>
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            This page is the customer-side placeholder for order history and shipment tracking in the single-vendor architecture.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default OrdersPage;
