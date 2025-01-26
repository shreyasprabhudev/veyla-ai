import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Do nothing, let all routes pass
  return NextResponse.next()
}

export const config = {
  // empty matchers
  matcher: [],
}
