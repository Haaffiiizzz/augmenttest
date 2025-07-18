import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const timeResult = await query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful:', timeResult.rows[0]);
    
    // Test if tables exist
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('app_users', 'app_sessions')
      ORDER BY table_name
    `);
    
    const existingTables = tablesResult.rows.map((row: any) => row.table_name);
    console.log('📋 Existing tables:', existingTables);
    
    // Test user count
    let userCount = 0;
    try {
      const countResult = await query('SELECT COUNT(*) as count FROM app_users');
      userCount = parseInt(countResult.rows[0].count);
      console.log('👥 User count:', userCount);
    } catch (error) {
      console.log('⚠️ Could not count users (table might not exist):', error);
    }
    
    return NextResponse.json({
      success: true,
      database_time: timeResult.rows[0].current_time,
      tables: existingTables,
      user_count: userCount,
      message: 'Database connection successful'
    });
    
  } catch (error: any) {
    console.error('❌ Database test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Database connection failed'
    }, { status: 500 });
  }
}
