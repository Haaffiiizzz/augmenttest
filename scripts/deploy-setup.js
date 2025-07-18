const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupProductionDatabase() {
  console.log('🚀 Setting up production database...');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('Please set your production database URL in Vercel environment variables');
    process.exit(1);
  }

  console.log('Database URL configured:', databaseUrl.replace(/:[^:@]*@/, ':****@'));

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to production database');

    // Create application tables
    console.log('📋 Creating application tables...');
    const schemaPath = path.join(__dirname, '..', 'database', 'app-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
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

    // Verify tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('app_users', 'app_sessions')
      ORDER BY table_name
    `);
    
    console.log('\n📋 Production database tables:');
    const expectedTables = ['app_sessions', 'app_users'];
    const existingTables = tablesResult.rows.map(row => row.table_name);
    
    for (const table of expectedTables) {
      if (existingTables.includes(table)) {
        console.log('✅', table);
      } else {
        console.log('❌', table, '(missing)');
      }
    }

    client.release();
    console.log('\n🎉 Production database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Production database setup failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Only run if called directly
if (require.main === module) {
  setupProductionDatabase();
}

module.exports = { setupProductionDatabase };
