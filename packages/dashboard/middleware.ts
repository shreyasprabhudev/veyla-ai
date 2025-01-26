import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Bypass /api or /_next
  if (req.nextUrl.pathname.startsWith('/api') || 
      req.nextUrl.pathname.startsWith('/_next') ||
      req.nextUrl.pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
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
          // Set cookie domain to .veylaai.com for cross-subdomain access
          res.cookies.set({
            name,
            value,
            ...options,
            domain: '.veylaai.com',
          });
        },
        remove(name: string, options: any) {
          res.cookies.set({
            name,
            value: '',
            ...options,
            domain: '.veylaai.com',
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If user is not logged in and tries to access a protected route,
  // redirect to /auth/signin
  if (!session && !req.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }

  // If user is logged in and visits /auth/signin, redirect to dashboard
  if (session && req.nextUrl.pathname.startsWith('/auth/signin')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/health).*)',
  ],
};
