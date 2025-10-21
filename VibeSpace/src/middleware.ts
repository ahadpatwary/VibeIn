import { NextRequest ,NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  // ✅ Public routes 
  const isPublic =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" 


  // 🔒 যদি logged-in থাকে এবং login/register page e যায় → feed এ পাঠাও
  if (token && isPublic) {
    return NextResponse.redirect(new URL("/feed", req.url));
  }

  // 🔐 যদি logged-out থাকে এবং protected page e যায় → login এ পাঠাও
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ✅ Otherwise, normal request allow করো
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};