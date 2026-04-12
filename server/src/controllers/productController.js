import pool from '../db.js';
import { products as demoProducts } from '../data/storeData.js';

export async function getProducts(req, res) {
  const { search = '', category = 'all' } = req.query;

  try {
    const result = await pool.query('SELECT * FROM products LIMIT 100');
    if (result.rows.length > 0) {
      return res.json(result.rows);
    }
  } catch (error) {
    // fallback to demo data if DB is not configured
  }

  const filteredProducts = demoProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(String(search).toLowerCase()) ||
      product.brand.toLowerCase().includes(String(search).toLowerCase());
    const matchesCategory = category === 'all' || product.categorySlug === category;
    return matchesSearch && matchesCategory;
  });

  res.json(filteredProducts);
}

export async function getProductById(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    }
  } catch (error) {
    // fallback to demo data
  }
  const product = demoProducts.find((item) => item.id === id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
}
