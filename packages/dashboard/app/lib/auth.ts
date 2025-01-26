'use client';

import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Get the app URL from environment, with a secure default
const getAppUrl = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'https://app.veylaai.com';
};

// Get the redirect URL from environment or construct it
const getRedirectUrl = () => {
  const appUrl = getAppUrl();
  return process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL || `${appUrl}/auth/callback`;
};

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }
}

export async function signInWithGoogle() {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getRedirectUrl(),
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    throw error;
  }
}

export async function signUp(email: string, password: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getRedirectUrl(),
      data: {
        app_url: getAppUrl(),
      },
    },
  });

  if (error) {
    throw error;
  }
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
}

export async function getSession() {
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }
  return session;
}
