import { createBrowserClient } from '@supabase/ssr'

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
