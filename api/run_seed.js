const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres', // Connect to default first incase znhip doesn't exist
    password: 'postgres',
    port: 5432,
  });

  try {
    await client.connect();
    console.log('Connected to postgres server.');
    
    // Create database if it doesn't exist
    const res = await client.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = 'znhip'`);
    if (res.rowCount === 0) {
      console.log('Database znhip does not exist. Creating...');
      await client.query('CREATE DATABASE znhip');
      console.log('Created database znhip.');
    }
  } catch(e) {
    console.error('Initial DB connection error:', e);
    process.exit(1);
  } finally {
    await client.end();
  }

  const znhipClient = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'znhip',
    password: 'postgres',
    port: 5432,
  });

  try {
    await znhipClient.connect();
    console.log('\nConnected to znhip database.');
    await znhipClient.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    await znhipClient.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
    console.log('Reset public schema.');

    const dbPath = path.join(__dirname, '../db');
    const files = ['schema.sql', 'rls.sql', 'indexes.sql', 'seed.sql'];
    
    for (const file of files) {
      const sql = fs.readFileSync(path.join(dbPath, file), 'utf8');
      console.log(`Executing ${file}...`);
      await znhipClient.query(sql);
      console.log(`Successfully executed ${file}`);
    }
    console.log('\n✅ Database reset and seeded successfully!');
  } catch (err) {
    console.error('Error executing scripts:', err);
  } finally {
    await znhipClient.end();
  }
}
run();
