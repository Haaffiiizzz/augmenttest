'use server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { query } from './db';

export async function signUp(_prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  console.log('🔐 SignUp attempt for email:', email);

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log('🔐 Attempting to insert user into database...');
    const result = await query(
      'INSERT INTO app_users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );

    console.log('✅ User created successfully:', result.rows[0]);
    return { success: true, user: result.rows[0] };
  } catch (error: any) {
    console.error('❌ SignUp error:', error);
    if (error.code === '23505') {
      return { error: 'Email already exists' };
    }
    return { error: 'Failed to create account: ' + error.message };
  }
}

export async function signIn(_prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const result = await query(
      'SELECT id, email, password_hash FROM app_users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return { error: 'Invalid credentials' };
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return { error: 'Invalid credentials' };
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    await query(
      'INSERT INTO app_sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    );

    // Set the auth cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
    });

    return { success: true, token, user: { id: user.id, email: user.email } };
  } catch (error) {
    return { error: 'Sign in failed' };
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };

    // Check if session exists and is valid
    const sessionResult = await query(
      'SELECT user_id FROM app_sessions WHERE token = $1 AND expires_at > NOW()',
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return null;
    }

    // Get user details
    const userResult = await query(
      'SELECT id, email FROM app_users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return null;
    }

    return userResult.rows[0];
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
}

export async function signOut() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (token) {
      // Remove session from database
      await query('DELETE FROM app_sessions WHERE token = $1', [token]);
    }

    // Clear the auth cookie
    cookieStore.delete('auth-token');

    return { success: true };
  } catch (error) {
    console.error('signOut error:', error);
    return { error: 'Sign out failed' };
  }
}