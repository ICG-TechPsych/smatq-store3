import pg from 'pg';

const { Pool } = pg;

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Render PostgreSQL
  },
});

// Test connection
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
