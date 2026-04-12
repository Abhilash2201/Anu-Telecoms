import { Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import api from '../api/apiClient';
import { Product, StorefrontResponse } from '../types/store';
import { useAuth } from '../context/AuthContext';

const featureTiles = [
  { title: 'Mobiles', subtitle: 'Starting at Rs 5,999', image: 'https://dummyimage.com/600x320/2b65ec/ffffff&text=Mobiles' },
  { title: 'Home Appliances', subtitle: 'Best prices', image: 'https://dummyimage.com/600x320/1f5ecf/ffffff&text=Appliances' },
  { title: 'Refrigerators', subtitle: 'Up to 40% off', image: 'https://dummyimage.com/600x320/6fa8ff/ffffff&text=Refrigerators' },
  { title: 'TVs & Audio', subtitle: 'Starting at Rs 12,999', image: 'https://dummyimage.com/600x320/2b65ec/ffffff&text=TVs+%26+Audio' }
];

const brands = ['SAMSUNG', 'LG', 'ONEPLUS', 'Apple', 'vivo', 'SONY', 'Whirlpool', 'CROMA'];

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [storefront, setStorefront] = useState<StorefrontResponse | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { isAdmin, user } = useAuth();
  const query = useQuery();
  const searchTerm = query.get('q')?.toLowerCase() ?? '';

  useEffect(() => {
    api.get('/storefront').then((res) => setStorefront(res.data)).catch(console.error);
    api.get('/products').then((res) => setProducts(res.data)).catch(console.error);
  }, []);

  const filtered = useMemo(
    () =>
      products.filter(
        (product) =>
          (product.name.toLowerCase().includes(searchTerm) || product.brand.toLowerCase().includes(searchTerm)) &&
          (selectedCategory === 'all' || product.categorySlug === selectedCategory)
      ),
    [products, searchTerm, selectedCategory]
  );

  const visibleProducts = filtered.slice(0, 4);

  return (
    <Box sx={{ display: 'grid', gap: { xs: 3, md: 4 } }}>
      <Card
        sx={{
          overflow: 'hidden',
          background:
            'radial-gradient(circle at 35% 30%, rgba(255,197,111,0.28), transparent 18%), linear-gradient(90deg, #1948c8 0%, #2f71ff 48%, #7ab5ff 100%)',
          color: '#fff',
          borderRadius: 4
        }}
      >
        <Grid container>
          <Grid item xs={12} md={6}>
            <CardContent sx={{ p: { xs: 3.5, md: 5 } }}>
              <Typography variant="h2" sx={{ fontWeight: 900, lineHeight: 1.05, fontSize: { xs: 40, md: 62 } }}>
                {isAdmin ? 'Run the Store Better' : 'Big Festive Sale!'}
              </Typography>
              <Typography
                variant="h3"
                sx={{ fontWeight: 900, color: '#ffb34d', mt: 1, fontSize: { xs: 34, md: 54 }, lineHeight: 1.05 }}
              >
                {isAdmin ? 'Single Dashboard View' : 'Upto 50% Off'}
              </Typography>
              <Typography sx={{ mt: 3, maxWidth: 460, fontSize: { xs: 18, md: 22 }, color: 'rgba(255,255,255,0.92)' }}>
                {isAdmin
                  ? `Welcome ${user?.name || 'Admin'}. Track inventory, monitor open orders, and manage the full single-vendor catalog from one place.`
                  : 'Get exciting offers on mobiles, appliances, audio gear, and more from Anu Telecom Nagamangala.'}
              </Typography>
              <Button
                variant="contained"
                href={isAdmin ? '/admin' : '#best-selling'}
                sx={{
                  mt: 4,
                  bgcolor: '#ff7a00',
                  px: 4,
                  py: 1.3,
                  borderRadius: 3,
                  fontWeight: 800,
                  '&:hover': { bgcolor: '#ef6c00' }
                }}
              >
                {isAdmin ? 'Open Admin Dashboard' : 'Shop Now'}
              </Button>
            </CardContent>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                minHeight: { xs: 260, md: '100%' },
                backgroundImage: `url(${isAdmin ? 'https://dummyimage.com/900x700/2d64ff/ffffff&text=Dashboard+Overview' : 'https://dummyimage.com/900x700/2d64ff/ffffff&text=Mobiles+%7C+Appliances+%7C+Offers'})`,
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover'
              }}
            />
          </Grid>
        </Grid>
      </Card>

      <Grid container spacing={2.5}>
        {featureTiles.map((tile) => (
          <Grid item xs={12} sm={6} md={3} key={tile.title}>
            <Card
              sx={{
                overflow: 'hidden',
                color: '#fff',
                borderRadius: 3,
                backgroundImage: `linear-gradient(90deg, rgba(15,71,184,0.98) 0%, rgba(60,120,255,0.8) 100%), url(${tile.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: 160
              }}
            >
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {tile.title}
                </Typography>
                <Typography sx={{ mt: 1 }}>{tile.subtitle}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box id="best-selling">
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={2}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#13255a' }}>
              {isAdmin ? 'Catalog spotlight' : 'Best Selling Products'}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {isAdmin
                ? 'These products represent the current single-vendor assortment and merchandising priorities.'
                : 'Desktop | Tablet | Mobile'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mt: { xs: 2, md: 0 } }}>
            <Chip
              label="All"
              color={selectedCategory === 'all' ? 'primary' : 'default'}
              onClick={() => setSelectedCategory('all')}
            />
            {storefront?.categories.map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                color={selectedCategory === category.slug ? 'primary' : 'default'}
                onClick={() => setSelectedCategory(category.slug)}
              />
            ))}
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          {visibleProducts.map((product) => (
            <Grid item xs={12} sm={6} lg={3} key={product.id}>
              <ProductCard {...product} />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={3}>
          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              p: 2,
              borderRadius: 3,
              bgcolor: '#fff',
              border: '1px solid #dce4ff'
            }}
          >
            {brands.map((brand) => (
              <Box key={brand} sx={{ textAlign: 'center', py: 1.2, borderRadius: 2, bgcolor: '#f5f8ff', fontWeight: 800 }}>
                {brand}
              </Box>
            ))}
          </Box>
        </Grid>
        <Grid item xs={12} md={9}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  color: '#fff',
                  minHeight: 220,
                  borderRadius: 4,
                  background:
                    'linear-gradient(90deg, rgba(25,72,200,1) 0%, rgba(60,120,255,0.86) 100%), url(https://dummyimage.com/900x500/2059d1/ffffff&text=Combo+Offer)',
                  backgroundSize: 'cover'
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h3" sx={{ fontWeight: 900 }}>
                    Combo Offer
                  </Typography>
                  <Typography sx={{ mt: 1, fontSize: 24 }}>Smartphones & special combo</Typography>
                  <Button
                    variant="contained"
                    sx={{ mt: 4, bgcolor: '#ff7a00', '&:hover': { bgcolor: '#ef6c00' }, textTransform: 'none', fontWeight: 800 }}
                  >
                    Shop Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  color: '#fff',
                  minHeight: 220,
                  borderRadius: 4,
                  background:
                    'linear-gradient(90deg, rgba(25,72,200,1) 0%, rgba(122,181,255,0.88) 100%), url(https://dummyimage.com/900x500/2059d1/ffffff&text=AC+Festive+Deals)',
                  backgroundSize: 'cover'
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h3" sx={{ fontWeight: 900 }}>
                    AC Festive Deals
                  </Typography>
                  <Typography sx={{ mt: 1, fontSize: 24 }}>Up to 40% off top brands</Typography>
                  <Button
                    variant="contained"
                    sx={{ mt: 4, bgcolor: '#ff7a00', '&:hover': { bgcolor: '#ef6c00' }, textTransform: 'none', fontWeight: 800 }}
                  >
                    Shop Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {filtered.length === 0 ? <Typography color="text.secondary">No products match the current category or search.</Typography> : null}
    </Box>
  );
}

export default HomePage;
