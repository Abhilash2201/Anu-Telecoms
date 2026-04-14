import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import storefrontRoutes from './routes/storefront.js';
import docsRoutes from './routes/docs.js';
import cartRoutes from './routes/cart.js';
import { connectDb } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

await connectDb().catch((error) => {
  console.error('Failed to connect to PostgreSQL:', error.message);
  process.exit(1);
});

app.use('/api/auth', authRoutes);
app.use('/api/storefront', storefrontRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/docs', docsRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', architecture: 'single-vendor' }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
