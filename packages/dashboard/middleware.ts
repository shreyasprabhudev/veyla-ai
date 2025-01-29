import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  try {
    // Get app URL from environment
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      console.error('❌ NEXT_PUBLIC_APP_URL is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Debug logging with request details
    const forwardedHost = req.headers.get('x-forwarded-host');
    const currentHost = forwardedHost ?? req.headers.get('host') ?? '';
    const userAgent = req.headers.get('user-agent') ?? '';
    const forwardedProto = req.headers.get('x-forwarded-proto') ?? req.nextUrl.protocol;
    const origin = req.headers.get('origin') ?? '';

    console.log('🔍 Request Details:', {
      url: req.url,
      method: req.method,
      pathname: req.nextUrl.pathname,
      host: currentHost,
      forwardedHost,
      forwardedProto,
      origin,
      userAgent,
      env: {
        NEXT_PUBLIC_APP_URL: appUrl,
        NODE_ENV: process.env.NODE_ENV,
      }
    });

    const appUrlObj = new URL(appUrl);
    const requestUrl = req.nextUrl.clone();

    // Allow Supabase and Google OAuth callbacks to proceed
    const isOAuthCallback = (
      (origin === 'https://accounts.google.com' || origin.includes('supabase')) && 
      req.nextUrl.pathname === '/auth/callback'
    );
    if (isOAuthCallback) {
      console.log('✅ Allowing OAuth callback from:', origin);
      return NextResponse.next();
    }

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
    const isInternalIP = currentHost?.includes('0.0.0.0') || 
                        currentHost?.match(/^(\d{1,3}\.){3}\d{1,3}/);
    const isSupabaseHost = currentHost?.includes('supabase');
    
    if (!isCorrectHost && !isLocalhost && !isInternalIP && !isSupabaseHost) {
      console.log('🔄 Redirecting to correct host:', {
        from: currentHost,
        to: appUrlObj.host,
        path: requestUrl.pathname
      });

      // Ensure we're using the correct protocol and host
      requestUrl.protocol = appUrlObj.protocol;
      requestUrl.host = appUrlObj.host;
      requestUrl.port = '';  // Clear any port number
      
      const response = NextResponse.redirect(requestUrl);
      
      // Set secure headers
      response.headers.set('X-Forwarded-Host', appUrlObj.host);
      response.headers.set('X-Forwarded-Proto', appUrlObj.protocol.replace(':', ''));
      
      return response;
    }

    const res = NextResponse.next();

    // Configure Supabase client with secure cookie settings
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
              // Allow cookies to work across subdomains
              domain: '.veylaai.com',
              secure: true,
              sameSite: 'lax',
              path: '/',
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
              path: '/',
              maxAge: 0,
            });
          },
        },
      }
    );

    // Get session without throwing errors
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
    }

    // Handle authentication redirects
    const isAuthPath = req.nextUrl.pathname.startsWith('/auth');
    
    // Don't redirect during OAuth callback
    if (isAuthPath && req.nextUrl.pathname === '/auth/callback') {
      console.log('✅ Processing OAuth callback');
      return res;
    }
    
    if (!session && !isAuthPath) {
      console.log('🔒 No session, redirecting to signin');
      return NextResponse.redirect(new URL('/auth/signin', appUrl));
    }

    if (session && isAuthPath && req.nextUrl.pathname !== '/auth/callback') {
      console.log('✅ Session exists, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', appUrl));
    }

    // Set secure headers
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'origin-when-cross-origin');
    
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
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
