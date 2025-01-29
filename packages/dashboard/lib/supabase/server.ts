import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { CookieOptions } from '@supabase/ssr';

const enforceHttps = (url: string) => {
  if (!url) return url;
  return url.replace(/^http:/, 'https:');
};

const getCookieOptions = (): Partial<CookieOptions> => ({
  domain: '.veylaai.com',
  path: '/',
  secure: true,
  sameSite: 'lax',
  httpOnly: true // Server-side cookies should be httpOnly
});

export const createServerSupabaseClient = () => {
  const cookieStore = cookies();
  const supabaseUrl = enforceHttps(process.env.NEXT_PUBLIC_SUPABASE_URL!);
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({
              name,
              value,
              ...getCookieOptions(),
              ...options
            });
          } catch (error) {
            console.error('Failed to set cookie:', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({
              name,
              value: '',
              ...getCookieOptions(),
              ...options,
              maxAge: 0
            });
          } catch (error) {
            console.error('Failed to remove cookie:', error);
          }
        },
      },
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true
      }
    }
  );
};
