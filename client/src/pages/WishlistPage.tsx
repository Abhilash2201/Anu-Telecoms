import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

function WishlistPage() {
  const { items } = useWishlist();
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" mb={3}>My Wishlist ({items.length})</Typography>
      {items.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography color="text.secondary" mb={2}>Your wishlist is empty.</Typography>
          <Button variant="contained" onClick={() => navigate('/shop')}>Browse Products</Button>
        </Box>
      ) : (
        <Grid>
          {items.map(p => <ProductCard key={p.id} {...p} />)}
        </Grid>
      )}
    </Box>
  );
}

export default WishlistPage;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  @media (max-width: 1100px) { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  @media (max-width: 720px)  { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 420px)  { grid-template-columns: 1fr; }
`;
