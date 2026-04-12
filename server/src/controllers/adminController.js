import pool from '../db.js';
import { buildAdminSnapshot, orders, products } from '../data/storeData.js';

export async function getAdminDashboard(req, res) {
  return res.json(buildAdminSnapshot());
}

export async function getAdminOrders(req, res) {
  try {
    const result = await pool.query('SELECT data FROM orders ORDER BY created_at DESC');
    const allOrders = result.rows.map((row) => row.data);
    return res.json(allOrders);
  } catch (error) {
    return res.json(orders);
  }
}

export async function manageProducts(req, res) {
  const { action, product } = req.body;
  if (!action || !product) return res.status(400).json({ message: 'Action and product are required' });

  if (action === 'create') {
    products.push(product);
  }

  if (action === 'update') {
    const productIndex = products.findIndex((entry) => entry.id === product.id);
    if (productIndex >= 0) {
      products[productIndex] = { ...products[productIndex], ...product };
    }
  }

  if (action === 'delete') {
    const productIndex = products.findIndex((entry) => entry.id === product.id);
    if (productIndex >= 0) {
      products.splice(productIndex, 1);
    }
  }

  return res.json({
    message: `Single-vendor product ${action} handled in the scaffold`,
    product,
    metrics: buildAdminSnapshot().metrics
  });
}
