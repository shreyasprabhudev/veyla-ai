import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.redirect(new URL('/dashboard/', process.env.NEXT_PUBLIC_APP_URL || 'https://app.veylaai.com'));
}
