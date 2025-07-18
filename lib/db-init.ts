import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

let isInitialized = false;

export async function initializeDatabase(): Promise<void> {
  // Only run once
  if (isInitialized) {
    return;
  }

  console.log('🚀 Initializing database tables...');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    throw new Error('DATABASE_URL is required');
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 1,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to database for initialization');

    // Read schema file
    const schemaPath = path.join(process.cwd(), 'database', 'app-schema.sql');
    
    // Check if schema file exists
    if (!fs.existsSync(schemaPath)) {
      console.log('ℹ️  Schema file not found, skipping table creation');
      client.release();
      await pool.end();
      isInitialized = true;
      return;
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const statement of statements) {
      try {
        await client.query(statement);
        console.log('✅ Created table:', statement.substring(0, 50) + '...');
      } catch (error: any) {
        if (error.code === '42P07') {
          console.log('ℹ️  Table already exists:', statement.substring(0, 50) + '...');
        } else {
          console.error('❌ Error executing statement:', statement);
          console.error('Error:', error.message);
          // Don't throw here, just log the error
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
    
    console.log('📋 Database tables status:');
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
    console.log('🎉 Database initialization completed');
    isInitialized = true;
    
  } catch (error: any) {
    console.error('❌ Database initialization failed:', error.message);
    // Don't throw error in production, just log it
    if (process.env.NODE_ENV !== 'production') {
      throw error;
    }
  } finally {
    await pool.end();
  }
}

// Auto-initialize in production
if (process.env.NODE_ENV === 'production') {
  initializeDatabase().catch(console.error);
}
