import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  try {
    console.log('Middleware triggered:', request.nextUrl.pathname);
    return NextResponse.next();
  } catch (err) {
    console.error('Middleware error:', err);
    return new Response('Middleware failed', { status: 500 });
  }
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|robots.txt).*)'],
};