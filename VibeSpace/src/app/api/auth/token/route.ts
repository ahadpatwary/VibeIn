import { NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "@/lib/redis";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_EXP = "15m"; // 15 minutes
const REFRESH_TOKEN_EXP = "30d"; // 30 days

export async function POST(req: NextRequest) {
    try {

        console.log("comming request");
        
        const refreshTokenCookie = (await cookies()).get("refreshToken")?.value;

        if (!refreshTokenCookie) {
            return NextResponse.json(
                { message: "User unauthenticated!" },
                { status: 401 }
            );
        }

        
        const Redis = getRedisClient();
        if (!Redis) {
            return NextResponse.json(
                { message: "Redis not connected" },
                { status: 500 }
            );
        }

        let decoded;
        try {
            decoded = jwt.verify(
                refreshTokenCookie,
                process.env.NEXT_AUTH_SECRET as string, {
                    algorithms: ["HS256"],
                    issuer: "smreaz.com",
                    audience: "VibeIn_client",
                    maxAge: "15m",
                }
            );
        } catch (err) {
            return NextResponse.json(
                { message: "Invalid or expired refresh token" },
                { status: 401 }
            );
        }

        const { sub, deviceId, accountId } = decoded as  jwt.JwtPayload;

        if (!sub || !deviceId || !accountId) {
            return NextResponse.json(
                { message: "Malformed token payload" },
                { status: 400 }
            );
        }

        const payload = { sub, deviceId, accountId, role: "user" };


        const newAccessToken = jwt.sign(
            payload,
            process.env.NEXT_AUTH_SECRET as string,
            {
                algorithm: "HS256",
                expiresIn: ACCESS_TOKEN_EXP,
                notBefore: "0s",
                issuer: "smreaz.com",
                audience: "VibeIn_client",
            }
        );


        const newRefreshToken = jwt.sign(
            payload,
            process.env.NEXT_AUTH_SECRET as string,
            {
                algorithm: "HS256",
                expiresIn: REFRESH_TOKEN_EXP,
                notBefore: "0s",
                issuer: "smreaz.com",
                audience: "VibeIn_client",
            }
        );

      
        (await cookies()).set("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60, 
            path: "/"
        });

        (await cookies()).set("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 30 * 24 * 60 * 60,
            path: "/"
        });

        await Redis.set(
            `refreshToken:${deviceId}`,
            newRefreshToken,
            "EX",
            30 * 24 * 60 * 60 
        );

        return NextResponse.json({ sub, accountId, deviceId }, { status: 200 });

    } catch (error) {
        console.error("Token refresh error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}