import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  try {
    // Debug logging with request details
    console.log('🔍 Request Details:', {
      url: req.url,
      method: req.method,
      pathname: req.nextUrl.pathname,
      host: req.headers.get('host'),
      userAgent: req.headers.get('user-agent'),
      env: {
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NODE_ENV: process.env.NODE_ENV,
      }
    });

    // Get the app URL from environment variable
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      console.error('❌ NEXT_PUBLIC_APP_URL is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const appUrlObj = new URL(appUrl);
    const requestUrl = req.nextUrl.clone();
    const forwardedHost = req.headers.get("x-forwarded-host");
    const currentHost = forwardedHost ?? req.headers.get("host");
    const userAgent = req.headers.get('user-agent') || '';

    // Allow ELB health checks to bypass host checks
    const isHealthCheck = userAgent.includes('ELB-HealthChecker') && 
                         req.nextUrl.pathname === '/api/health';
    if (isHealthCheck) {
      console.log('✅ Allowing ELB health check');
      return NextResponse.next();
    }

    // Skip middleware for static assets and public files
    if (
      req.nextUrl.pathname.startsWith('/_next') ||
      req.nextUrl.pathname.startsWith('/public') ||
      req.nextUrl.pathname.startsWith('/favicon.ico')
    ) {
      return NextResponse.next();
    }

    // If the request is not coming from the correct host, redirect
    const isLocalhost = currentHost?.includes('localhost');
    const isCorrectHost = currentHost === appUrlObj.host;
    
    if (!isCorrectHost && !isLocalhost) {
      console.log('🔄 Redirecting to correct host:', {
        from: currentHost,
        to: appUrlObj.host,
        path: requestUrl.pathname
      });
      requestUrl.protocol = appUrlObj.protocol;
      requestUrl.host = appUrlObj.host;
      return NextResponse.redirect(requestUrl);
    }

    const res = NextResponse.next();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
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

    const { data: { session } } = await supabase.auth.getSession();

    // Handle authentication redirects
    const isAuthPath = req.nextUrl.pathname.startsWith('/auth');
    if (!session && !isAuthPath) {
      console.log('🔒 No session, redirecting to signin');
      return NextResponse.redirect(new URL('/auth/signin', appUrl));
    }

    if (session && isAuthPath) {
      console.log('✅ Session exists, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', appUrl));
    }

    return res;
  } catch (error) {
    console.error('❌ Middleware error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
