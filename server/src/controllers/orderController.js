import pool from '../db.js';
import { orders, products } from '../data/storeData.js';

export async function createOrder(req, res) {
  const { items, address, paymentMethod, total } = req.body;
  if (!items || !address || !paymentMethod) {
    return res.status(400).json({ message: 'Order details are required' });
  }

  const invalidItem = items.find((item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return !product || product.stock < item.quantity;
  });

  if (invalidItem) {
    return res.status(400).json({ message: 'One or more items are out of stock for the store inventory.' });
  }

  const order = {
    id: `${Date.now()}`,
    userId: req.user.id,
    items,
    address,
    paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
    total,
    status: 'Placed',
    trackingId: null,
    createdAt: new Date().toISOString()
  };

  orders.unshift(order);

  try {
    await pool.query(
      'INSERT INTO orders (id, user_id, data, status, created_at) VALUES ($1, $2, $3, $4, $5)',
      [order.id, order.userId, JSON.stringify(order), order.status, order.createdAt]
    );
  } catch (error) {
    // ignore if DB not configured
  }

  res.status(201).json({ order });
}

export async function getOrders(req, res) {
  try {
    const result = await pool.query('SELECT data FROM orders WHERE user_id = $1', [req.user.id]);
    const userOrders = result.rows.map((row) => row.data);
    return res.json(userOrders);
  } catch (error) {
    return res.json(orders.filter((order) => order.userId === req.user.id));
  }
}
