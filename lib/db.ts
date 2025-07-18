import { Pool, PoolConfig } from 'pg';
import { initializeDatabase } from './db-init';

// Database configuration
const config: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Increased timeout for production
  maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
};

// Create the pool
const pool = new Pool(config);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize database tables on first connection
let initPromise: Promise<void> | null = null;

async function ensureInitialized(): Promise<void> {
  if (!initPromise) {
    initPromise = initializeDatabase();
  }
  await initPromise;
}

// Enhanced query function that ensures database is initialized
export async function query(text: string, params?: any[]): Promise<any> {
  await ensureInitialized();
  return pool.query(text, params);
}

// Get a client from the pool (with initialization)
export async function getClient() {
  await ensureInitialized();
  return pool.connect();
}

// Test connection function
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('Database connected successfully:', result.rows[0]);
    return true;
  } catch (err) {
    console.error('Database connection failed:', err);
    return false;
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT, closing database pool...');
  pool.end(() => {
    console.log('Database pool closed.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, closing database pool...');
  pool.end(() => {
    console.log('Database pool closed.');
    process.exit(0);
  });
});

export default pool;