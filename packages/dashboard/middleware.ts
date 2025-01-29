import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Debug logging
  console.log('🔍 Middleware request URL:', req.url);
  console.log('🔍 Middleware headers:', Object.fromEntries(req.headers));
  console.log('🔍 Environment:', {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    HOSTNAME: process.env.HOSTNAME,
  });

  // Get the app URL from environment variable
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    console.error('❌ NEXT_PUBLIC_APP_URL is not set');
    throw new Error('NEXT_PUBLIC_APP_URL is required');
  }

  // Parse the app URL to get the host
  const appUrlObj = new URL(appUrl);

  // Bypass /api or /_next
  if (req.nextUrl.pathname.startsWith('/api') || 
      req.nextUrl.pathname.startsWith('/_next') ||
      req.nextUrl.pathname.startsWith('/favicon.ico')) {
    const response = NextResponse.next();
    // Even for API routes, ensure correct host header
    response.headers.set('host', appUrlObj.host);
    return response;
  }

  const res = NextResponse.next();
  // Set the correct host header
  res.headers.set('host', appUrlObj.host);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // Set cookie domain to .veylaai.com for cross-subdomain access
          res.cookies.set({
            name,
            value,
            ...options,
            domain: '.veylaai.com',
            secure: true,
            sameSite: 'lax',
          });
        },
        remove(name: string, options: any) {
          res.cookies.set({
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

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Rewrite the URL to use the correct host
  const url = req.nextUrl.clone();
  url.protocol = appUrlObj.protocol;
  url.host = appUrlObj.host;

  // If user is not logged in and tries to access a protected route,
  // redirect to /auth/signin
  if (!session && !req.nextUrl.pathname.startsWith('/auth')) {
    console.log('🔒 No session, redirecting to signin');
    return NextResponse.redirect(new URL('/auth/signin', appUrl));
  }

  // If user is logged in and visits /auth/signin, redirect to dashboard
  if (session && req.nextUrl.pathname.startsWith('/auth')) {
    console.log('✅ Session exists, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', appUrl));
  }

  // For all other routes, ensure they use the correct host
  if (req.headers.get('host') !== appUrlObj.host) {
    console.log('🔄 Rewriting URL to use correct host');
    return NextResponse.rewrite(url);
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/health).*)',
  ],
};
