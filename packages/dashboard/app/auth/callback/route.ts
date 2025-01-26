import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import type { CookieOptions } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const cookieStore = cookies();

  // Log request details for debugging
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

  // Get the app URL from environment or headers
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

  if (!code) {
    console.error('❌ No code provided in callback');
    return NextResponse.redirect(`${appUrl}/auth/error`);
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
              domain: '.veylaai.com',
              path: '/',
              secure: true,
              sameSite: 'lax',
              ...options
            });
          } catch (error) {
            console.error('🔴 Error setting cookie:', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({
              name,
              value: '',
              domain: '.veylaai.com',
              path: '/',
              secure: true,
              sameSite: 'lax',
              maxAge: 0,
              ...options
            });
          } catch (error) {
            console.error('🔴 Error removing cookie:', error);
          }
        },
      },
    }
  );

  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('🔴 Error exchanging code for session:', error);
      return NextResponse.redirect(`${appUrl}/auth/error`);
    }

    console.log('✅ Successfully exchanged code for session');
    return NextResponse.redirect(`${appUrl}${next}`);
  } catch (error) {
    console.error('🔴 Error in callback:', error);
    return NextResponse.redirect(`${appUrl}/auth/error`);
  }
}
