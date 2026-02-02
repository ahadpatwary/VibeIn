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

  
  // 3️⃣ Return HTML that sends user info to parent window and closes popup

  const normalizedUser = {
    type: "GOOGLE_AUTH_SUCCESS",
    id: user.sub,   // required
    name: user?.name ?? "<User>",
    email: user?.email,
    picture: user?.picture
  };

  const html = `
  <html>
    <body>
      <script>
        const user = ${JSON.stringify(normalizedUser)};
        if (window.opener) {
          window.opener.postMessage(user, "https://vibe-in-teal.vercel.app");
          window.close();
        } else {
          console.log("Parent window not found!");
        }
      </script>
    </body>
  </html>
  `;

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}