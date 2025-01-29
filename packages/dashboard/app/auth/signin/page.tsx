'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import Image from 'next/image';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div className="text-center">
          <Image
            src="/logo.png"
            alt="Veyla AI Logo"
            width={48}
            height={48}
            className="mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome to Veyla AI
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to continue to your dashboard
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg bg-gray-50 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100 px-4 py-2.5 placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500 focus:ring-1 transition-colors duration-200"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg bg-gray-50 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-gray-100 px-4 py-2.5 placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500 focus:ring-1 transition-colors duration-200"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-lg p-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-lg
                       transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Please wait...</span>
                </div>
              ) : (
                <span>Sign In</span>
              )}
            </Button>
          </form>

          <GoogleSignInButton />
        </div>
      </div>
    </div>
  );
}
