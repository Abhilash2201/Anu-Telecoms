import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function connectDb() {
  try {
    await pool.query('SELECT 1');
    console.log('Connected to database');
  } catch (error) {
    console.error('Database connection failed, using demo data:', error.message);
    // Do not exit, allow fallback to demo data
  }
}

export default pool;
