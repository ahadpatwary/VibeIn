import { NextResponse } from "next/server";

export async function GET() {
  const githubUrl =`https://github.com/login/oauth/select_account?client_id=Ov23lip2WBbOnw8jhSAb&prompt=select_account&redirect_uri=https%3A%2F%2Fvibe-in-teal.vercel.app%2Fapi%2Fauth%2Fcallback%2Fgithub&response_type=code&scope=openid+name+email+profile&state=-8v5rcTxxYf4suTWf2XuJJ2okQ8vCBEO_xA8BFBNjB0`;

  return NextResponse.redirect(githubUrl);
}
