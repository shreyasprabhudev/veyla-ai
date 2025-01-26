import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import type { CookieOptions } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const cookieStore = cookies()

  // Debug logging
  console.log('🔍 Incoming request URL:', request.url)
  console.log('🔍 Headers:', Object.fromEntries(request.headers))

  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'
  
  if (!code) {
    // If no code, redirect to an error page or re-initiate sign-in
    console.error('❌ No authorization code provided')
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/error?error=${encodeURIComponent('No code provided')}`)
  }

  // Derive appUrl for final redirect
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.veylaai.com'

  // Initialize Supabase client with custom cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({
              name,
              value,
              domain: '.veylaai.com', // ensure subdomain usage
              path: '/',
              secure: true,
              httpOnly: true,
              sameSite: 'lax',
              ...options
            })
          } catch (error) {
            console.error('🔴 Error setting cookie:', error)
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
              httpOnly: true,
              sameSite: 'lax',
              maxAge: 0,
              ...options
            })
          } catch (error) {
            console.error('🔴 Error removing cookie:', error)
          }
        },
      },
    }
  )

  try {
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('🔴 Error exchanging code for session:', error)
      return NextResponse.redirect(`${appUrl}/auth/error?error=${encodeURIComponent(error.message)}`)
    }

    console.log('✅ Successfully exchanged code for session')
    // Redirect to final destination (usually /dashboard)
    return NextResponse.redirect(`${appUrl}${next}`)
  } catch (error: any) {
    console.error('🔴 Unexpected error in callback:', error)
    return NextResponse.redirect(`${appUrl}/auth/error?error=${encodeURIComponent(error.message || 'An unexpected error occurred')}`)
  }
}
