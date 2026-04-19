const { Client } = require('pg');

async function test() {
  const client = new Client({
    host: 'db.fxfypqyjngupocsxhhkf.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'T0g41IzHzSCquYyx',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query('SELECT current_database();');
    console.log('Success!', res.rows[0]);
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    await client.end();
  }
}
test();
