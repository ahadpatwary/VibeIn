// import Account from "@/modules/account/models/Account";
// import { connectToDb } from "@/shared/lib/db";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(req: NextRequest) {

//   const code = req.nextUrl.searchParams.get("code");
//   const state = req.nextUrl.searchParams.get("state");

//   if (!code || !state) {
// 	return NextResponse.json({ error: "Invalid OAuth request" }, { status: 400 });
//   }

//   // 1️⃣ Exchange code for access token
//   const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
// 	method: "POST",
// 	headers: { "Content-Type": "application/x-www-form-urlencoded" },
// 	body: new URLSearchParams({
// 	  client_id: process.env.GOOGLE_CLIENT_ID!,
// 	  client_secret: process.env.GOOGLE_CLIENT_SECRET!,
// 	  code,
// 	  redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
// 	  grant_type: "authorization_code",
// 	}),
//   });

//   const tokenData = await tokenRes.json();

//   // 2️⃣ Get user info
//   const userRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
// 	headers: { Authorization: `Bearer ${tokenData.access_token}` },
//   });

//   const user = await userRes.json();


//   // 3️⃣ Return HTML that sends user info to parent window and closes popup

//   const normalizedUser = {
// 	type: "GOOGLE_AUTH_SUCCESS",
// 	id: user.sub,   // required
// 	name: user?.name ?? "<User>",
// 	email: user?.email,
// 	picture: user?.picture
//   };

//   console.log("norma", normalizedUser);

//   if (user.email) {

// 	// প্রথমে providerId দিয়ে খোঁজো
// 	const accountByProvider = await Account.findOne({
// 	  providerId: user.sub,
// 	  type: "google"
// 	});

// 	if (accountByProvider) {
// 	  // Account আছে — email update করো যদি বদলে গিয়ে থাকে
// 	  if (accountByProvider.email !== user.email) {
// 		await Account.findOneAndUpdate(
// 		  { providerId: user.sub },
// 		  { email: user.email }
// 		);
// 	  }
// 	  // ✅ login দাও
// 	  return;
// 	}

// 	// providerId নেই — email দিয়ে খোঁজো
// 	const accountByEmail = await Account.findOne({ email: user.email });

// 	if (accountByEmail) {
// 	  // Email আছে কিন্তু provider নেই — link করে দাও
// 	  await Account.findOneAndUpdate(
// 		{ email: user.email },
// 		{ providerId: user.sub, type: "google" }
// 	  );
// 	  // ✅ login দাও
// 	  return;
// 	}

// 	// কিছুই নেই — নতুন account বানাও
// 	await Account.create({
// 	  email: user.email,
// 	  providerId: user.sub,
// 	  type: "google",
// 	  name: user.name,
// 	  picture: user.picture
// 	});
// 	// ✅ login দাও

//   } else {
// 	// Google email দেয়নি (rare)
// 	const accountByProvider = await Account.findOne({
// 	  providerId: user.sub,
// 	  type: "google"
// 	});

// 	if (accountByProvider?.email) {
// 	  // আগে email save ছিল — সেটা দিয়ে OTP পাঠাও
// 	  // ✅ OTP flow
// 	} else {
// 	  // কোনো email নেই — user কে manually দিতে বলো
// 	}
//   }

//   const html = `
//   <html>
// 	<body>
// 	  <script>
// 		const user = ${JSON.stringify(normalizedUser)};
// 		if (window.opener) {
// 		  window.opener.postMessage(user, "https://vibe-in-teal.vercel.app");
// 		  window.close();
// 		} else {
// 		  console.log("Parent window not found!");
// 		}
// 	  </script>
// 	</body>
//   </html>
//   `;

//   return new Response(html, {
// 	headers: { "Content-Type": "text/html" },
//   });
// }

import { cookies } from "next/headers";
import Account from "@/modules/account/models/Account";
import { connectToDb } from "@/shared/lib/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"; // npm i jsonwebtoken
import { createAccount, createUser, tokenGeneration } from "@/shared/services/accountServices";

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

  await connectToDb();

  let account;

  if (user.email) {

    console.log("emailllll", user.email)

    const accountByProvider = await Account.findOne({
      providerId: user.sub,
      type: "google"
    });

    if (accountByProvider) {
      if (accountByProvider.email !== user.email) {
        await Account.findOneAndUpdate(
          { providerId: user.sub },
          { email: user.email }
        );
      }
      account = accountByProvider;

    } else {

      const accountByEmail = await Account.findOne({ email: user.email });

      if (accountByEmail) {
        await Account.findOneAndUpdate(
          { email: user.email },
          { providerId: user.sub, type: "google" }
        );
        account = accountByEmail;

      } else {

        const userId = await createUser(user?.name, user.email, user?.picture, "");

        account = await createAccount(user.email, userId, undefined, user.sub, "google");
      }
    }

  } else {
    const accountByProvider = await Account.findOne({
      providerId: user.sub,
      type: "google"
    });

    if (accountByProvider?.email) {
      account = accountByProvider;
    }
    // email নেই — OTP flow এ যাবে (পরে handle করো)
  }

  console.log("hello", account);



  const { accessToken, refreshToken, refreshTokenHash } = await tokenGeneration(account.authorId.toString(), account._id.toString());

  // 4️⃣ Cookie set করো + HTML পাঠাও
  const normalizedUser = {
    type: "GOOGLE_AUTH_SUCCESS",
    id: user.sub,
    name: user?.name ?? "<User>",
    email: user?.email,
    picture: user?.picture,
    accessToken: accessToken
  };

  console.log("norma", normalizedUser);

  const html = `
  <html>
    <body>
      <script>
        const user = ${JSON.stringify(normalizedUser)};
        if (window.opener) {
          window.opener.postMessage(user, "${process.env.NEXT_PUBLIC_APP_URL}");
          window.close();
        }
      </script>
    </body>
  </html>
  `;

  // ✅ Cookie set করো Response এ
  const response = new Response(html, {
    headers: { "Content-Type": "text/html" },
  });

  response.headers.append(
    "Set-Cookie",
    `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`
  );

  return response;
}