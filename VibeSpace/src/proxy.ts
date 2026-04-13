// import { NextRequest, NextResponse } from "next/server";
// import crypto from "crypto";
// import { cookies } from "next/headers";
// import { authRoutes, protectedRoutes, publicRoutes } from "./shared/lib/middleware/route-config";
// import getAuthorizeToken form '../'

// export async function proxy(req: NextRequest) {

//   const pathname = req.nextUrl.pathname.replace(/\/+$/, "") || "/";
//   let response: NextResponse | null = null;

//   const authHeader = req.headers.get("authorization");

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       throw new Error("Unauthorized");
//   }

//   const accessToken = authHeader.split(" ")[1];
//   const refreshToken = (await cookies()).get("refreshToken")?.value;


//   if(accessToken && !refreshToken) {
//     response = NextResponse.json(
//       { message: "hacker tracked" },
//       { status: 307 }
//     )
//   }


//   const protectedUrl = protectedRoutes.has(pathname);
//   const publicUrl = publicRoutes.has(pathname);
//   const authUrl = authRoutes.has(pathname);

//   console.log("protec", protectedUrl);
//   console.log("public", publicUrl);
//   console.log("auth", authUrl);

//   if(!accessToken && !refreshToken){

//     if(protectedUrl){
//       const url = req.nextUrl.clone();
//       url.pathname = "/register";
//       response = NextResponse.redirect(url);
//     }

//     if(publicUrl){
//       response = NextResponse.next();
//     }

//     if(authUrl){
//       response = NextResponse.next();
//     }

//     if(!protectedUrl && !publicUrl && !authUrl){
//       const url = req.nextUrl.clone();
//       url.pathname = "/notFoundPage";
//       response = NextResponse.redirect(url);
//     }
//   }

//   if(accessToken && refreshToken) {

//     if(protectedUrl){
//       response = NextResponse.next();
//     }

//     if(publicUrl){
//       response = NextResponse.next();
//     }

//     if(authUrl){
//       const url = req.nextUrl.clone();
//       url.pathname = "/feed";
//       response = NextResponse.redirect(url);
//     }

//     if(!protectedUrl && !publicUrl && !authUrl){
//       const url = req.nextUrl.clone();
//       url.pathname = "/notFoundPage";
//       response = NextResponse.redirect(url);
//     }
//   }

//   if(!accessToken && refreshToken) {

//     if(protectedUrl){
//       response = NextResponse.json(
//         { message: "refresh token avaliable" }, 
//         { status: 301 }
//       )
//     }

//     if(publicUrl){
//       response = NextResponse.next();
//     }

//     if(authUrl){
//       response = NextResponse.json(
//         { message: "refresh token avaliable" }, 
//         { status: 301 }
//       )
//     }

//     if(!protectedUrl && !publicUrl && !authUrl){
//       const url = req.nextUrl.clone();
//       url.pathname = "/notFoundPage";
//       response = NextResponse.redirect(url);
//     }
//   }

//   response = NextResponse.next();

//   // if (response && !pathname.startsWith("/api")) {
//   //   const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

//   //   const cspHeader = `
//   //     default-src 'self';
//   //     script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com;
//   //     style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com;
//   //     img-src 'self' blob: data:
//   //       https://www.google-analytics.com
//   //       https://res.cloudinary.com
//   //       https://lh3.googleusercontent.com
//   //       https://avatars.githubusercontent.com;
//   //     font-src 'self' https://fonts.gstatic.com;
//   //     connect-src 'self' https://www.google-analytics.com;
//   //     object-src 'none';
//   //     base-uri 'self';
//   //     form-action 'self';
//   //     frame-ancestors 'none';
//   //     upgrade-insecure-requests;
//   //   `;

//   //   const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/g, ' ').trim()

//   //   response.headers.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);
//   //   response.headers.set("x-nonce", nonce);
//   // }

//   return response;
// }

// export const config = {
//   matcher: [
//     {
//       // source: "/((?!api|_next/static|_next/image|favicon.ico).*)", ekhane backend router er upor middleware colbe na,
//       source: "/((?!api|_next/static|_next/image|favicon.ico).*)", // ekhon backend e colbe
//       missing: [
//         { type: "header", key: "next-router-prefetch" },
//         { type: "header", key: "purpose", value: "prefetch" },
//       ],
//     },
//   ],
// };

// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { authRoutes, protectedRoutes, publicRoutes } from "./shared/lib/middleware/route-config";
import jwt from "jsonwebtoken";

export async function proxy(req: NextRequest) {

  const pathname = req.nextUrl.pathname.replace(/\/+$/, "") || "/";

  // ✅ middleware এ cookie এভাবে নাও — cookies() কাজ করে না এখানে
  const refreshToken = req.cookies.get("refreshToken")?.value;

  // ✅ accessToken middleware এ আসে না (memory তে থাকে)
  // শুধু refreshToken দিয়েই auth check করো
  let isAuthenticated = false;

  if (refreshToken) {
    try {
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
      isAuthenticated = true;
    } catch {
      // token invalid বা expired
      isAuthenticated = false;
    }
  }

  const isProtected = protectedRoutes.has(pathname);
  const isPublic = publicRoutes.has(pathname);
  const isAuth = authRoutes.has(pathname);

  // ✅ Unknown route
  if (!isProtected && !isPublic && !isAuth) {
    const url = req.nextUrl.clone();
    url.pathname = "/not-found";
    return NextResponse.redirect(url);
  }

  // ✅ Authenticated user
  if (isAuthenticated) {
    // auth page এ গেলে feed এ পাঠাও
    if (isAuth) {
      const url = req.nextUrl.clone();
      url.pathname = "/feed";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ✅ Unauthenticated user
  if (!isAuthenticated) {
    // protected route এ গেলে register এ পাঠাও
    if (isProtected) {
      const url = req.nextUrl.clone();
      url.pathname = "/register";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};