import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'znhip',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Executes a query with RLS context support.
 * The context (user ID, role, facility ID, province) is set in the local session.
 */
export const query = async (
  text: string, 
  params?: any[], 
  context?: { userId: string; role: string; facilityId?: string; province?: string }
) => {
  const client = await pool.connect();
  try {
    if (context) {
      await client.query('SET LOCAL app.current_user_id = $1', [context.userId]);
      await client.query('SET LOCAL app.current_user_role = $2', [context.role]);
      if (context.facilityId) {
        await client.query('SET LOCAL app.current_user_facility_id = $1', [context.facilityId]);
      } else {
        await client.query('SET LOCAL app.current_user_facility_id = NULL');
      }
      if (context.province) {
        await client.query('SET LOCAL app.current_user_province = $1', [context.province]);
      } else {
        await client.query('SET LOCAL app.current_user_province = NULL');
      }
    }

    const start = Date.now();
    const res = await client.query(text, params);
    const duration = Date.now() - start;
    
    // Optional: Log query duration in dev
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }
    
    return res;
  } finally {
    client.release();
  }
};

export default {
  query,
  pool
};
