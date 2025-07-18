'use client';
import { useActionState } from 'react';
import { signIn } from '@/lib/auth-actions';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignInForm() {
  const [state, formAction, isPending] = useActionState(signIn, null);
  const { setUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      setUser(state.user);
      router.push('/dashboard');
    }
  }, [state, setUser, router]);

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white border border-gray-200 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
      
      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            required
            disabled={isPending}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            placeholder="Enter your email"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            required
            disabled={isPending}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-green-600 text-white p-3 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Signing In...' : 'Sign In'}
        </button>

        {state?.error && (
          <p className="text-red-600 text-sm mt-2">{state.error}</p>
        )}
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link href="/auth/signup" className="text-green-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}