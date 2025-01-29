import { createBrowserClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'

const enforceHttps = (url: string) => {
  if (!url) return url;
  return url.replace(/^http:/, 'https:');
};

export const createClient = () => {
  const supabaseUrl = enforceHttps(process.env.NEXT_PUBLIC_SUPABASE_URL!);
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createBrowserClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        const cookie = document.cookie
          .split('; ')
          .find((row) => row.startsWith(`${name}=`))
        return cookie ? cookie.split('=')[1] : undefined
      },
      set(name: string, value: string, options: CookieOptions) {
        let cookie = `${name}=${value}`
        if (options.domain) cookie += `; domain=${options.domain}`
        if (options.path) cookie += `; path=${options.path}`
        if (options.maxAge) cookie += `; max-age=${options.maxAge}`
        if (options.sameSite) cookie += `; samesite=${options.sameSite}`
        if (options.secure) cookie += '; secure'
        document.cookie = cookie
      },
      remove(name: string, options: CookieOptions) {
        const cookie = `${name}=; max-age=0`
        document.cookie = cookie
      },
    },
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
      storage: {
        getItem: (key) => {
          try {
            const storedValue = localStorage.getItem(key);
            return storedValue;
          } catch {
            return null;
          }
        },
        setItem: (key, value) => {
          try {
            localStorage.setItem(key, value);
          } catch (error) {
            console.error('Error setting storage item:', error);
          }
        },
        removeItem: (key) => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            console.error('Error removing storage item:', error);
          }
        },
      }
    },
    global: {
      headers: {
        'X-Forwarded-Proto': 'https'
      }
    }
  });
}
