import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';
  
  // If there's no code, this isn't a valid callback
  if (!code) {
    console.error('No code provided in callback');
    return NextResponse.redirect(new URL('/auth/signin', requestUrl.origin));
  }

  try {
    const cookieStore = cookies();
    const supabase = createServerSupabaseClient();

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Error exchanging code for session:', error);
      throw error;
    }

    // Get the app URL, ensuring HTTPS in production
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      throw new Error('NEXT_PUBLIC_APP_URL not set');
    }

    const baseUrl = new URL(appUrl);
    baseUrl.protocol = process.env.NODE_ENV === 'production' ? 'https:' : baseUrl.protocol;

    // Construct the redirect URL
    const redirectUrl = new URL(next, baseUrl.toString());
    
    console.log('🔄 Redirecting to:', redirectUrl.toString());
    
    const response = NextResponse.redirect(redirectUrl);

    // Ensure all cookies have the correct domain and security settings
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
    // Redirect to sign-in on error
    return NextResponse.redirect(new URL('/auth/signin', requestUrl.origin));
  }
}
