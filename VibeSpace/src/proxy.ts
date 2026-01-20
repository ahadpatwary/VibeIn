// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import crypto from "crypto";

export async function proxy(req: NextRequest) {
  // 1️⃣ Auth Token Check
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // 2️⃣ Generate Nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // 3️⃣ Content Security Policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, " ").trim(); // Remove extra spaces & newlines

  // 4️⃣ Set Headers
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
    .trim()
 
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-nonce', nonce)
 
  requestHeaders.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue
  )
 
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  response.headers.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue
  )

  // 5️⃣ Auth / Route Logic
  const { pathname } = req.nextUrl;

  // ✅ Public routes
  const isPublic =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register";

  // Logged-in user visiting public page → redirect to feed
  if (token && isPublic) {
    return NextResponse.redirect(new URL("/feed", req.url));
  }

  // Logged-out user visiting protected page → redirect to login
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Otherwise, allow request
  return response;
}

// 6️⃣ Matcher Config
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
