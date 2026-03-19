import { NextRequest, NextResponse } from 'next/server'

/**
 * Protects /dashboard/** routes by verifying the presence of the auth cookie.
 * Full token validation happens inside each API route handler.
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
