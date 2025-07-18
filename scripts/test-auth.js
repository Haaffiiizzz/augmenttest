const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function testAuthFlow() {
  console.log('🧪 Testing authentication flow...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
  });

  try {
    const client = await pool.connect();
    
    // Test data
    const testEmail = 'testuser@example.com';
    const testPassword = 'testpassword123';
    
    // Clean up any existing test data
    await client.query('DELETE FROM app_users WHERE email = $1', [testEmail]);
    console.log('✅ Cleaned up existing test data');
    
    // Test 1: User registration
    console.log('\n1️⃣ Testing user registration...');
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    const userResult = await client.query(
      'INSERT INTO app_users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [testEmail, hashedPassword]
    );
    
    const userId = userResult.rows[0].id;
    console.log('✅ User created successfully - ID:', userId, 'Email:', userResult.rows[0].email);
    
    // Test 2: Password verification
    console.log('\n2️⃣ Testing password verification...');
    const userCheck = await client.query(
      'SELECT id, email, password_hash FROM app_users WHERE email = $1',
      [testEmail]
    );
    
    if (userCheck.rows.length === 0) {
      throw new Error('User not found');
    }
    
    const user = userCheck.rows[0];
    const isValid = await bcrypt.compare(testPassword, user.password_hash);
    
    if (isValid) {
      console.log('✅ Password verification successful');
    } else {
      throw new Error('Password verification failed');
    }
    
    // Test 3: Session creation
    console.log('\n3️⃣ Testing session creation...');
    const testToken = 'test_jwt_token_' + Date.now();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    const sessionResult = await client.query(
      'INSERT INTO app_sessions (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING id',
      [userId, testToken, expiresAt]
    );
    
    console.log('✅ Session created successfully - ID:', sessionResult.rows[0].id);
    
    // Test 4: Session validation
    console.log('\n4️⃣ Testing session validation...');
    const sessionCheck = await client.query(
      'SELECT user_id FROM app_sessions WHERE token = $1 AND expires_at > NOW()',
      [testToken]
    );
    
    if (sessionCheck.rows.length > 0) {
      console.log('✅ Session validation successful');
    } else {
      throw new Error('Session validation failed');
    }
    
    // Test 5: User data retrieval
    console.log('\n5️⃣ Testing user data retrieval...');
    const userData = await client.query(
      'SELECT id, email FROM app_users WHERE id = $1',
      [userId]
    );
    
    if (userData.rows.length > 0) {
      console.log('✅ User data retrieval successful:', userData.rows[0]);
    } else {
      throw new Error('User data retrieval failed');
    }
    
    // Test 6: Session cleanup
    console.log('\n6️⃣ Testing session cleanup...');
    await client.query('DELETE FROM app_sessions WHERE token = $1', [testToken]);
    console.log('✅ Session cleanup successful');
    
    // Final cleanup
    await client.query('DELETE FROM app_users WHERE email = $1', [testEmail]);
    console.log('✅ Final cleanup completed');
    
    client.release();
    console.log('\n🎉 All authentication tests passed!');
    console.log('✅ The database is ready for the authentication system');
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    process.exit(1);
  }
  
  // Use setTimeout to avoid the shutdown error
  setTimeout(() => {
    pool.end();
    process.exit(0);
  }, 100);
}

testAuthFlow();
