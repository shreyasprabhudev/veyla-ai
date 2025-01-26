'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { signInWithEmail, signInWithGoogle, signUp } from '@/app/lib/auth';
import Image from 'next/image';

export default function SignInPage() {
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-black to-black">
      {/* Decorative blurs */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>

      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo.png"
            alt="Veyla AI Logo"
            width={48}
            height={48}
            className="mb-4"
          />
          <h2 className="text-3xl font-bold tracking-tight text-white">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {isSignUp ? 'Start your journey with Veyla AI' : 'Sign in to continue to Veyla AI'}
          </p>
        </div>

        {/* Sign In Card */}
        <div className="relative bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-purple-500/20">
          <form onSubmit={handleSubmit} className="space-y-5">
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
                className="mt-1 block w-full rounded-lg bg-black/50 border border-purple-500/30 text-white px-4 py-2.5 
                         placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500 focus:ring-1
                         transition-colors duration-200"
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
                className="mt-1 block w-full rounded-lg bg-black/50 border border-purple-500/30 text-white px-4 py-2.5 
                         placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500 focus:ring-1
                         transition-colors duration-200"
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
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              )}
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-grow border-t border-gray-700" />
            <span className="text-sm text-gray-400">or</span>
            <div className="flex-grow border-t border-gray-700" />
          </div>

          <Button
            onClick={() => signInWithGoogle()}
            className="mt-6 w-full bg-white hover:bg-gray-50 text-gray-900 flex items-center justify-center gap-3 py-2.5 rounded-lg
                     transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Image
              src="/google.svg"
              alt="Google"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            <span className="text-sm font-medium">Continue with Google</span>
          </Button>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors duration-200"
            >
              {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom decorative blur */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
      </div>
    </div>
  );
}
