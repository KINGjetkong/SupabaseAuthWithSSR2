// Import Next.js middleware tools
import { NextResponse, type NextRequest } from 'next/server'

// This function runs for every matched request
export function middleware(request: NextRequest) {
  // You can inspect or modify the request here
  // For now, it simply lets the request continue
  return NextResponse.next()
}

// This config tells Next.js which routes should run through this middleware
export const config = {
  matcher: [
    // Match all paths except:
    // - _next (Next.js internal assets)
    // - favicon.ico
    // - robots.txt
    '/((?!_next|favicon.ico|robots.txt).*)'
  ]
}