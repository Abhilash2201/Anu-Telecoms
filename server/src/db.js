import './config/env.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// Stores the Prisma instance on globalThis so nodemon hot-reloads don't create
// a new PrismaClient on every file change and exhaust the connection pool.
const globalForPrisma = globalThis;

// PrismaPg uses the pg driver directly — required for Neon's serverless PostgreSQL.
// The standard PrismaClient binary engine doesn't work with Neon's HTTP-based protocol.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    // In production only surface errors — query/warn logs are noisy and slow cold starts.
    // In development, warn logs catch schema mismatches and N+1 query patterns early.
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn', 'error']
  });

// Only cache the instance in dev — production containers are stateless and don't reload
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function connectDb() {
  await prisma.$connect();
  console.log('Connected to PostgreSQL via Prisma');
}

export default prisma;
