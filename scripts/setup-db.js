const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
  console.log('Setting up database...');
  
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

    // Read and execute schema
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log('📋 Executing schema statements...');
    
    for (const statement of statements) {
      try {
        await client.query(statement);
        console.log('✅ Executed:', statement.substring(0, 50) + '...');
      } catch (error) {
        if (error.code === '42P07') {
          console.log('ℹ️  Table already exists:', statement.substring(0, 50) + '...');
        } else {
          console.error('❌ Error executing statement:', statement);
          console.error('Error:', error.message);
        }
      }
    }

    // Verify tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'sessions')
      ORDER BY table_name
    `);
    
    console.log('\n📋 Database tables:');
    const expectedTables = ['sessions', 'users'];
    const existingTables = tablesResult.rows.map(row => row.table_name);
    
    for (const table of expectedTables) {
      if (existingTables.includes(table)) {
        console.log('✅', table);
      } else {
        console.log('❌', table, '(missing)');
      }
    }

    // Test a simple insert and delete to verify everything works
    console.log('\n🧪 Testing database operations...');
    
    try {
      // Test user creation
      const testEmail = 'test@example.com';
      await client.query('DELETE FROM users WHERE email = $1', [testEmail]);
      
      const userResult = await client.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
        [testEmail, 'test_hash']
      );
      
      const userId = userResult.rows[0].id;
      console.log('✅ User creation test passed');
      
      // Test session creation
      await client.query(
        'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [userId, 'test_token', new Date(Date.now() + 3600000)]
      );
      console.log('✅ Session creation test passed');
      
      // Cleanup
      await client.query('DELETE FROM users WHERE email = $1', [testEmail]);
      console.log('✅ Cleanup completed');
      
    } catch (error) {
      console.error('❌ Database operation test failed:', error.message);
    }

    client.release();
    console.log('\n✅ Database setup completed successfully');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
