import { NextResponse } from "next/server";
import { getRedisClient } from "@/lib/redis";
import { cookies } from 'next/headers'
import crypto from "crypto";

import jwt from 'jsonwebtoken'


export async function POST (req: Request) {
    try {

        const body = await req.json();

        const { userId } = body;
                
        const Redis = getRedisClient();

        if (!Redis) {
            return NextResponse.json(
                { message: "Redis not connected" },
                { status: 501 }
            );
        }

        const accessToken = jwt.sign(
            {
                sub: userId,
                role: "user",
            },
            process.env.NEXT_AUTH_SECRET as string,
            {
                algorithm: "HS256",
                expiresIn: "15m",
                notBefore: "0s",
                issuer: "smreaz.com",
                audience: "VibeIn_client",
                jwtid: Buffer.from(crypto.randomUUID()).toString("base64"),
            }
        );

        (await cookies()).set("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 15 * 60
        })

        const refreshToken = jwt.sign(
            {
                sub: userId,
                role: "user",
            },
            process.env.NEXT_AUTH_SECRET as string,
            {
                algorithm: "HS256",
                expiresIn: "1m",
                notBefore: "0s",
                issuer: "smreaz.com",
                audience: "VibeIn_client",
                jwtid: Buffer.from(crypto.randomUUID()).toString("base64"),
            }
        ); // ekhane semiclone dite i hobe,,


        (await cookies()).set("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60
        })


        await Redis.set(
            `refreshToken:${userId}`,
            refreshToken,
            "EX",
            30 * 24 * 60 * 60 // 30 days
        )

        const res = NextResponse.json(
            { message: "accessToken and Refresh token created successfully!" },
            { status: 200 }
        )


        res.cookies.set("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
            maxAge: 15 * 60 * 60
        })

        res.cookies.set("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
            maxAge: 30 * 24 * 60 * 60, 
        });

        return res;
        
    } catch (error) {
        if(error instanceof Error){
            throw new Error(error.message);
        }
    }
}