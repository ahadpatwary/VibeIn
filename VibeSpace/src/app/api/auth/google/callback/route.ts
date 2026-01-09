// import { NextRequest, NextResponse } from "next/server";

// export async function GET(req: NextRequest) {
//   const code = req.nextUrl.searchParams.get("code");
//   const state = req.nextUrl.searchParams.get("state");

//   const savedState = req.cookies.get("oauth_state")?.value;

//   if (!code || !state || state !== savedState) {
//     return NextResponse.json(
//       { error: "Invalid OAuth state" },
//       { status: 400 }
//     );
//   }

//   // Step 1: code -> token
//   const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
//     body: new URLSearchParams({
//       client_id: process.env.GOOGLE_CLIENT_ID!,
//       client_secret: process.env.GOOGLE_CLIENT_SECRET!,
//       code,
//       redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
//       grant_type: "authorization_code",
//     }),
//   });

//   const tokenData = await tokenRes.json();

//   const accessToken = tokenData.access_token;

//   // Step 2: fetch user info
//   const userRes = await fetch(
//     "https://openidconnect.googleapis.com/v1/userinfo",
//     {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     }
//   );

//   const user = await userRes.json();

//   console.log("user google", user);

//   /**
//    * user = {
//    *   sub,
//    *   email,
//    *   name,
//    *   picture
//    * }
//    */

//   // Step 3: create session (simple)
//   const response = NextResponse.redirect("http://localhost:3000/dashboard");

//   response.cookies.set(
//     "session",
//     JSON.stringify({
//       id: user.sub,
//       email: user.email,
//       name: user.name,
//     }),
//     {
//       httpOnly: true,
//       secure: true,
//       sameSite: "lax",
//     }
//   );

//   // cleanup
//   response.cookies.delete("oauth_state");

//   return response;
// }


import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.json({ error: "Invalid OAuth request" }, { status: 400 });
  }

  // 1️⃣ Exchange code for access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json();

  // 2️⃣ Get user info
  const userRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const user = await userRes.json();


  console.log("user", user);
  // 3️⃣ Set session cookie
  const res = NextResponse.redirect("/dashboard"); // final page
  res.cookies.set("session", JSON.stringify({
    id: user.sub,
    name: user.name,
    email: user.email,
    picture: user.picture
  }), { httpOnly: true, sameSite: "lax", path: "/" });

  return res;
}
