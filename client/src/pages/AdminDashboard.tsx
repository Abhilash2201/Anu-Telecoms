import { Box, Card, CardContent, Chip, Grid, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api/apiClient';
import { formatCurrency } from '../utils/format';
import { useAuth } from '../context/AuthContext';

interface DashboardResponse {
  metrics: {
    activeProducts: number;
    lowStockProducts: number;
    openOrders: number;
    monthlyRevenue: number;
  };
  modules: Array<{ title: string; description: string }>;
  operationalFlow: string[];
}

const fallbackDashboard: DashboardResponse = {
  metrics: {
    activeProducts: 4,
    lowStockProducts: 1,
    openOrders: 2,
    monthlyRevenue: 209998
  },
  modules: [
    {
      title: 'Catalog control',
      description: 'Admins maintain the single product catalog, pricing, merchandising, and category assignments.'
    },
    {
      title: 'Inventory control',
      description: 'The store owns one stock pool, so low-stock alerts and adjustments stay centralized.'
    },
    {
      title: 'Order operations',
      description: 'Orders move through one fulfillment queue without any vendor routing or seller splits.'
    },
    {
      title: 'Customer support',
      description: 'Returns, order issues, and delivery updates are handled by the same store operations team.'
    }
  ],
  operationalFlow: ['Catalog', 'Inventory', 'Checkout', 'Packing', 'Shipping', 'Delivery']
};

function AdminDashboard() {
  const { isAdmin, loading } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(fallbackDashboard);

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then((res) => setDashboard(res.data))
      .catch(() => setDashboard(fallbackDashboard));
  }, []);

  if (!loading && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        Admin Panel
      </Typography>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Active Products</Typography>
              <Typography variant="h4">{dashboard?.metrics.activeProducts ?? '--'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Low Stock</Typography>
              <Typography variant="h4">{dashboard?.metrics.lowStockProducts ?? '--'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Open Orders</Typography>
              <Typography variant="h4">{dashboard?.metrics.openOrders ?? '--'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Monthly Revenue</Typography>
              <Typography variant="h4">
                {dashboard ? formatCurrency(dashboard.metrics.monthlyRevenue) : '--'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        {dashboard?.modules.map((module) => (
          <Grid item xs={12} md={6} key={module.title}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6">{module.title}</Typography>
                <Typography sx={{ mt: 1 }} color="text.secondary">
                  {module.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6">Operational flow</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
            {dashboard?.operationalFlow.map((step) => (
              <Chip key={step} label={step} color="primary" variant="outlined" />
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default AdminDashboard;
