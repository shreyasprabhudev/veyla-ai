import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const getBaseUrl = () => {
  // Always use HTTPS in production
  const protocol = process.env.NODE_ENV === 'production' ? 'https://' : 'http://';
  // Always use app.veylaai.com in production
  const host = process.env.NODE_ENV === 'production' ? 'app.veylaai.com' : process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '') || 'localhost:3000';
  return `${protocol}${host}`;
};

export async function middleware(req: NextRequest) {
  try {
    // Debug logging with request details
    const forwardedHost = req.headers.get('x-forwarded-host');
    const currentHost = forwardedHost ?? req.headers.get('host') ?? '';
    const userAgent = req.headers.get('user-agent') ?? '';
    const forwardedProto = req.headers.get('x-forwarded-proto');
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
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NODE_ENV: process.env.NODE_ENV,
      }
    });

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

    const baseUrl = getBaseUrl();
    const expectedHost = new URL(baseUrl).host;

    // If the request is not coming from the correct host, redirect
    const isLocalhost = currentHost?.includes('localhost');
    const isCorrectHost = currentHost === expectedHost;
    const isInternalIP = currentHost?.includes('0.0.0.0') || 
                        currentHost?.match(/^(\d{1,3}\.){3}\d{1,3}/);
    const isSupabaseHost = currentHost?.includes('supabase');
    
    if (!isCorrectHost && !isLocalhost && !isInternalIP && !isSupabaseHost) {
      console.log('🔄 Redirecting to correct host:', {
        from: currentHost,
        to: expectedHost,
        path: req.nextUrl.pathname
      });

      const redirectUrl = new URL(req.nextUrl.pathname + req.nextUrl.search, baseUrl);
      return NextResponse.redirect(redirectUrl);
    }

    const res = NextResponse.next();

    // Configure Supabase client
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
      return NextResponse.redirect(new URL('/auth/signin', baseUrl));
    }

    if (session && isAuthPath && req.nextUrl.pathname !== '/auth/callback') {
      console.log('✅ Session exists, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', baseUrl));
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
