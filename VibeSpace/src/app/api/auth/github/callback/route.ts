import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code found" }, { status: 400 });
  }

  // 🔹 STEP 1: code → access_token
  const tokenRes = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: "Ov23lip2WBbOnw8jhSAb",
        client_secret: "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",
        code,
      }),
    }
  );

  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    return NextResponse.json(
      { error: "Token exchange failed" },
      { status: 401 }
    );
  }

  const accessToken = tokenData.access_token;

  // 🔹 STEP 2: access_token → user
  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const user = await userRes.json();

  // 🔹 STEP 3: email (GitHub sometimes hides it)
  const emailRes = await fetch("https://api.github.com/user/emails", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const emails = await emailRes.json();
  const primaryEmail = emails?.find((e: any) => e.primary)?.email;

  // 🔹 STEP 4: DB save (example)
  /*
    await User.upsert({
      githubId: user.id,
      name: user.name,
      email: primaryEmail,
      avatar: user.avatar_url
    })
  */

  // 🔹 STEP 5: Cookie set
  const res = NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
  );

  res.cookies.set("access_token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  res.cookies.set(
    "user",
    JSON.stringify({
      id: user.id,
      name: user.name,
      email: primaryEmail,
      avatar: user.avatar_url,
    }),
    {
      httpOnly: false,
      secure: true,
      sameSite: "lax",
      path: "/",
    }
  );

  return res;
}
