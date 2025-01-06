'use client';

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    cookies: {
      get(name: string) {
        const cookies = document.cookie.split('; ');
        const cookie = cookies.find(c => c.startsWith(`${name}=`));
        return cookie ? cookie.split('=')[1] : undefined;
      },
      set(name: string, value: string, options: any) {
        document.cookie = `${name}=${value}; path=/; ${
          options.domain ? `domain=${options.domain};` : ''
        } ${options.maxAge ? `max-age=${options.maxAge};` : ''} ${
          options.secure ? 'secure;' : ''
        } ${options.sameSite ? `samesite=${options.sameSite};` : ''}`;
      },
      remove(name: string, options: any) {
        document.cookie = `${name}=; path=/; ${
          options.domain ? `domain=${options.domain};` : ''
        } expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
      },
    },
  }
);

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Error signing in with Google:', error.message);
    throw error;
  }

  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Error signing in with email:', error.message);
    throw error;
  }

  return data;
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    console.error('Error signing up:', error.message);
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error.message);
    throw error;
  }
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error.message);
    throw error;
  }
  
  return session;
}

export async function updateExtensionId(extensionId: string) {
  const session = await getSession();
  if (!session) throw new Error('No session found');

  const { error } = await supabase
    .from('accounts')
    .update({ 
      extension_id: extensionId,
      extension_last_login: new Date().toISOString()
    })
    .eq('id', session.user.id);

  if (error) {
    console.error('Error updating extension ID:', error.message);
    throw error;
  }
}
