'use client';

import { useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookie = document.cookie
              .split('; ')
              .find((row) => row.startsWith(`${name}=`));
            return cookie ? cookie.split('=')[1] : undefined;
          },
          set(name: string, value: string, options: any) {
            document.cookie = `${name}=${value}; path=/; max-age=${options.maxAge}`;
          },
          remove(name: string, options: any) {
            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          },
        },
      }
    );

    async function handleCallback() {
      try {
        const code = new URL(window.location.href).searchParams.get('code');
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error:', error);
        router.push('/login?error=auth');
      }
    }

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-gray-600">Completing sign in...</div>
    </div>
  );
}
