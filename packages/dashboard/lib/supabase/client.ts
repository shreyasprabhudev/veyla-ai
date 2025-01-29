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
      cookieOptions: {
        name: 'sb-auth-token',
        domain: '.veylaai.com',
        path: '/',
        sameSite: 'lax',
        secure: true
      }
    },
    global: {
      headers: {
        'X-Forwarded-Proto': 'https'
      }
    }
  });
}
