const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function resetDatabase() {
  console.log('🔄 Resetting database to correct schema...');
  console.log('⚠️  This will DROP existing tables and recreate them!');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to database');

    // Drop existing tables (in correct order due to foreign keys)
    console.log('🗑️  Dropping existing tables...');
    
    try {
      await client.query('DROP TABLE IF EXISTS sessions CASCADE');
      console.log('✅ Dropped sessions table');
    } catch (error) {
      console.log('ℹ️  Sessions table did not exist or could not be dropped');
    }
    
    try {
      await client.query('DROP TABLE IF EXISTS users CASCADE');
      console.log('✅ Dropped users table');
    } catch (error) {
      console.log('ℹ️  Users table did not exist or could not be dropped');
    }

    // Read and execute schema
    console.log('📋 Creating new tables...');
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const statement of statements) {
      try {
        await client.query(statement);
        console.log('✅ Created:', statement.substring(0, 50) + '...');
      } catch (error) {
        console.error('❌ Error executing statement:', statement);
        console.error('Error:', error.message);
        throw error;
      }
    }

    // Verify tables exist with correct structure
    console.log('\n📋 Verifying table structure...');
    
    // Check users table
    const usersColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('Users table columns:');
    usersColumns.rows.forEach(row => {
      console.log(`  ✅ ${row.column_name}: ${row.data_type}`);
    });
    
    // Check sessions table
    const sessionsColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'sessions' 
      ORDER BY ordinal_position
    `);
    
    console.log('Sessions table columns:');
    sessionsColumns.rows.forEach(row => {
      console.log(`  ✅ ${row.column_name}: ${row.data_type}`);
    });

    // Test basic operations
    console.log('\n🧪 Testing database operations...');
    
    // Test user creation
    const testEmail = 'test@example.com';
    const userResult = await client.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [testEmail, 'test_hash_123']
    );
    
    const userId = userResult.rows[0].id;
    console.log('✅ User creation test passed - ID:', userId);
    
    // Test session creation
    const sessionResult = await client.query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING id',
      [userId, 'test_token_123', new Date(Date.now() + 3600000)]
    );
    
    console.log('✅ Session creation test passed - ID:', sessionResult.rows[0].id);
    
    // Cleanup test data
    await client.query('DELETE FROM users WHERE email = $1', [testEmail]);
    console.log('✅ Test cleanup completed');

    client.release();
    console.log('\n🎉 Database reset completed successfully!');
    console.log('✅ Tables are now ready for the authentication system');
    
  } catch (error) {
    console.error('❌ Database reset failed:', error.message);
    process.exit(1);
  }
  
  // Use setTimeout to avoid the shutdown error
  setTimeout(() => {
    pool.end();
    process.exit(0);
  }, 100);
}

resetDatabase();
