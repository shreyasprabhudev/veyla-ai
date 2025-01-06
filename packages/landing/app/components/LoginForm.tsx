'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { signInWithEmail, signUp } from '@/app/lib/auth';

export function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        // Show success message for email verification
        setError('Please check your email to verify your account.');
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md bg-gray-900 border border-gray-700 text-white px-3 py-2 focus:border-purple-500 focus:ring-purple-500"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md bg-gray-900 border border-gray-700 text-white px-3 py-2 focus:border-purple-500 focus:ring-purple-500"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-purple-400 hover:text-purple-300"
        >
          {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
        </button>
      </div>
    </form>
  );
}
