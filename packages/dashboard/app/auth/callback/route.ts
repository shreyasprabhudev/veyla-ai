import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  
  // Debug logging
  console.log('🔍 Full request URL:', request.url);
  console.log('🔍 Request headers:', Object.fromEntries(request.headers));
  console.log('🔍 Environment:', {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_REDIRECT_URL: process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL,
    NODE_ENV: process.env.NODE_ENV
  });
  
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';

  console.log('🔄 Processing OAuth callback');
  console.log('📍 Next URL:', next);
  console.log('🎫 Auth code present:', !!code);

  // Get the app URL from environment variable or headers
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (() => {
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('x-forwarded-host') || 
                 request.headers.get('host') || 
                 'app.veylaai.com';
    const url = `${protocol}://${host}`;
    console.log('🌐 Constructed app URL:', url, {
      protocol,
      host,
      'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
      'x-forwarded-host': request.headers.get('x-forwarded-host')
    });
    return url;
  })();
  console.log('🌐 Using app URL:', appUrl);

  // Get the redirect URL from environment or construct it
  const redirectUrl = process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL || `${appUrl}/auth/callback`;
  console.log('🔀 Using redirect URL:', redirectUrl);

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          flowType: 'pkce',
          detectSessionInUrl: true,
          persistSession: true,
        },
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            // Set cross-subdomain cookies
            cookieStore.set({
              name,
              value,
              ...options,
              domain: '.veylaai.com',
              secure: true,
              sameSite: 'lax',
            });
          },
          remove(name: string, options: any) {
            cookieStore.set({
              name,
              value: '',
              ...options,
              domain: '.veylaai.com',
              secure: true,
              sameSite: 'lax',
            });
          },
        },
      }
    );

    try {
      console.log('🔑 Exchanging code for session');
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('❌ Session exchange error:', error.message);
        throw error;
      }

      console.log('✅ Session exchange successful');
      
      // Set an additional session cookie for the landing page
      cookieStore.set({
        name: 'session',
        value: 'true',
        domain: '.veylaai.com',
        path: '/',
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      // Use the app URL for redirects
      return NextResponse.redirect(new URL(next, appUrl));
    } catch (error: any) {
      console.error('❌ Auth callback error:', error.message);
      return NextResponse.redirect(
        new URL(`/auth/auth-error?error=${encodeURIComponent(error.message)}`, appUrl)
      );
    }
  }

  console.error('❌ No code provided');
  return NextResponse.redirect(
    new URL('/auth/auth-error?error=No+code+provided', appUrl)
  );
}
