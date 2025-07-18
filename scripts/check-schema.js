const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function checkSchema() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
  });

  try {
    const client = await pool.connect();
    
    // Check users table structure
    console.log('📋 Users table structure:');
    const usersColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    usersColumns.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${row.column_default || ''}`);
    });
    
    // Check sessions table structure
    console.log('\n📋 Sessions table structure:');
    const sessionsColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'sessions' 
      ORDER BY ordinal_position
    `);
    
    sessionsColumns.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${row.column_default || ''}`);
    });

    client.release();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Use setTimeout to avoid the shutdown error
  setTimeout(() => {
    pool.end();
    process.exit(0);
  }, 100);
}

checkSchema();
