import { getRedisClient } from "@/lib/redis";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {

    const body = await req.json(); 
    const { userId, email } = body;

    if (!userId) {
      return NextResponse.json(
        { message: "userId missing" },
        { status: 400 }
      );
    }

    const Redis = getRedisClient();
    if (!Redis) {
      return NextResponse.json(
        { message: "Redis not connected" },
        { status: 501 }
      );
    }

    // random refresh token
    const refreshToken = crypto.randomBytes(64).toString("hex");

    // hash combination (userId + refreshToken)
    const hash = crypto
      .createHash("sha256")
      .update(`${userId}:${refreshToken}`)
      .digest("hex")
    ;


    // Redis set
    await Redis.set(
      `refreshToken:${userId}`,
      hash,
      "EX",
      30 * 24 * 60 * 60
    );


    //rabbitMq ,, new User enter you account.............................

    // Cookie set
    const res = NextResponse.json(
      { message: "Refresh token issued" },
      { status: 200 }
    );

    res.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, 
    });

    return res;
  } catch (error) {
    console.error("Error issuing refresh token:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}