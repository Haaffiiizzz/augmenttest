const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function setupAppDatabase() {
  console.log('🔧 Setting up application-specific database tables...');
  
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

    // Read and execute app schema
    console.log('📋 Creating application tables...');
    const schemaPath = path.join(__dirname, '..', 'database', 'app-schema.sql');
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
        if (error.code === '42P07') {
          console.log('ℹ️  Table already exists:', statement.substring(0, 50) + '...');
        } else {
          console.error('❌ Error executing statement:', statement);
          console.error('Error:', error.message);
          throw error;
        }
      }
    }

    // Verify tables exist with correct structure
    console.log('\n📋 Verifying application table structure...');
    
    // Check app_users table
    const usersColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'app_users' 
      ORDER BY ordinal_position
    `);
    
    console.log('App_users table columns:');
    usersColumns.rows.forEach(row => {
      console.log(`  ✅ ${row.column_name}: ${row.data_type}`);
    });
    
    // Check app_sessions table
    const sessionsColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'app_sessions' 
      ORDER BY ordinal_position
    `);
    
    console.log('App_sessions table columns:');
    sessionsColumns.rows.forEach(row => {
      console.log(`  ✅ ${row.column_name}: ${row.data_type}`);
    });

    // Test basic operations
    console.log('\n🧪 Testing application database operations...');
    
    // Test user creation
    const testEmail = 'test@example.com';
    
    // Clean up any existing test data
    await client.query('DELETE FROM app_users WHERE email = $1', [testEmail]);
    
    const userResult = await client.query(
      'INSERT INTO app_users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [testEmail, 'test_hash_123']
    );
    
    const userId = userResult.rows[0].id;
    console.log('✅ User creation test passed - ID:', userId);
    
    // Test session creation
    const sessionResult = await client.query(
      'INSERT INTO app_sessions (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING id',
      [userId, 'test_token_123', new Date(Date.now() + 3600000)]
    );
    
    console.log('✅ Session creation test passed - ID:', sessionResult.rows[0].id);
    
    // Cleanup test data
    await client.query('DELETE FROM app_users WHERE email = $1', [testEmail]);
    console.log('✅ Test cleanup completed');

    client.release();
    console.log('\n🎉 Application database setup completed successfully!');
    console.log('✅ Tables app_users and app_sessions are ready');
    
  } catch (error) {
    console.error('❌ Application database setup failed:', error.message);
    process.exit(1);
  }
  
  // Use setTimeout to avoid the shutdown error
  setTimeout(() => {
    pool.end();
    process.exit(0);
  }, 100);
}

setupAppDatabase();
