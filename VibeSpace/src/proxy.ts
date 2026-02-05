import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";
import { protectedRoutes, publicRoutes } from "./lib/middleware/route-config";
import { verifyToken } from "./lib/middleware/tokenVerification";
import { hasAccess } from "./lib/middleware/roleVerification";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  let response: NextResponse | null = null;

  const token = (await cookies()).get("accessToken")?.value;

  const route = protectedRoutes.find(r => pathname.startsWith(r.path));

  if (route) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      response = NextResponse.redirect(url);
    } else {
      try {
        const user = verifyToken(token);

        if (user && !hasAccess(user, route.roles)) {
          const url = req.nextUrl.clone();
          url.pathname = "/unauthorized";
          response = NextResponse.redirect(url);
        } else if( user ){
          response = NextResponse.next();
        }
      } catch {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        response = NextResponse.redirect(url);
      }
    }
  }

  if (!response && publicRoutes.some(r => pathname.startsWith(r))) {

    const user = token ? verifyToken(token) : undefined;
    console.log("user", user);

    if (user) {
      const url = req.nextUrl.clone();
      url.pathname = "/feed";
      response = NextResponse.redirect(url);
    } else {
      response = NextResponse.next();
    }
  }

  if (!response) {
    const url = req.nextUrl.clone();
    url.pathname = "/notFoundPage";
    response = NextResponse.redirect(url);
  }

  if (!pathname.startsWith("/api")) {
    const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

    const cspHeader = `
      default-src 'self';
      script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com;
      style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com;
      img-src 'self' blob: data:
        https://www.google-analytics.com
        https://res.cloudinary.com
        https://lh3.googleusercontent.com
        https://avatars.githubusercontent.com;
      font-src 'self' https://fonts.gstatic.com;
      connect-src 'self' https://www.google-analytics.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      upgrade-insecure-requests;
    `;

    const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/g, ' ').trim()

    response.headers.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);
    response.headers.set("x-nonce", nonce);
  }

  return response;
}

export const config = {
  matcher: [
    {
      // source: "/((?!api|_next/static|_next/image|favicon.ico).*)", ekhane backend router er upor middleware colbe na,
      source: "/((?!_next/static|_next/image|favicon.ico).*)", // ekhon backend e colbe
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};