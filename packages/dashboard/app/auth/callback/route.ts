import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';

  console.log('🔄 Processing OAuth callback');
  console.log('📍 Next URL:', next);

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
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

      return NextResponse.redirect(new URL(next, request.url));
    } catch (error: any) {
      console.error('❌ Auth callback error:', error.message);
      return NextResponse.redirect(
        new URL(`/auth/auth-error?error=${encodeURIComponent(error.message)}`, request.url)
      );
    }
  }

  console.error('❌ No code provided');
  return NextResponse.redirect(
    new URL('/auth/auth-error?error=No+code+provided', request.url)
  );
}
