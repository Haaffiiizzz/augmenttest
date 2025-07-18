const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
  });

  try {
    console.log('Attempting to connect to database...');
    const client = await pool.connect();
    console.log('✅ Successfully connected to database');

    // Test basic query
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Database query successful');
    console.log('Current time:', result.rows[0].current_time);
    console.log('PostgreSQL version:', result.rows[0].pg_version);

    // Check if our tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'sessions')
    `);
    
    console.log('\n📋 Existing tables:');
    if (tablesResult.rows.length === 0) {
      console.log('❌ No tables found. You need to run the schema.sql file.');
    } else {
      tablesResult.rows.forEach(row => {
        console.log('✅', row.table_name);
      });
    }

    client.release();
    await pool.end();
    console.log('\n✅ Database test completed successfully');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    
    // Provide specific guidance based on error type
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Make sure PostgreSQL is running');
      console.log('2. Check if the port (5432) is correct');
      console.log('3. Verify the host (localhost) is correct');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Check the hostname in your DATABASE_URL');
      console.log('2. Make sure you have internet connection if using remote DB');
    } else if (error.code === '28P01') {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Check your username and password');
      console.log('2. Make sure the user has access to the database');
    } else if (error.code === '3D000') {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. The database does not exist');
      console.log('2. Create the database or check the database name');
    }
    
    await pool.end();
    process.exit(1);
  }
}

testDatabaseConnection();
