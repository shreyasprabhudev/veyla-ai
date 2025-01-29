import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const getBaseUrl = () => {
  // Always use HTTPS in production
  const protocol = process.env.NODE_ENV === 'production' ? 'https://' : 'http://';
  // Always use app.veylaai.com in production
  const host = process.env.NODE_ENV === 'production' ? 'app.veylaai.com' : process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '') || 'localhost:3000';
  return `${protocol}${host}`;
};

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';
  
  if (!code) {
    console.error('No code provided in callback');
    return NextResponse.redirect(`${getBaseUrl()}/auth/signin`);
  }

  try {
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient();
    
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Error exchanging code for session:', error);
      throw error;
    }

    // Always use the base URL for redirects
    const redirectUrl = new URL(next, getBaseUrl());
    
    console.log('🔄 Redirecting to:', redirectUrl.toString());
    
    const response = NextResponse.redirect(redirectUrl);

    // Copy over the auth cookies
    const authCookies = cookieStore.getAll();
    for (const cookie of authCookies) {
      if (cookie.name.startsWith('sb-')) {
        response.cookies.set({
          name: cookie.name,
          value: cookie.value,
          domain: '.veylaai.com',
          path: '/',
          secure: true,
          sameSite: 'lax',
        });
      }
    }

    return response;
  } catch (error) {
    console.error('Error in callback route:', error);
    return NextResponse.redirect(`${getBaseUrl()}/auth/signin`);
  }
}
