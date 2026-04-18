import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import { UserPayload } from "@/shared/lib/middleware/tokenVerification";

export async function POST(req: NextRequest) {

    console.log("..................................................refresh token route called");
    
    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
        return NextResponse.json(
            { message: "No refresh token" },
            { status: 401 }
        );
    }

    const payload = jwt.verify(refreshToken, process.env.NEXTAUTH_SECRET!, {
        algorithms: ["HS256"],
        issuer: "smreaz.com",
        audience: "VibeIn_client",
    });

    if(!payload) {
        return NextResponse.json(
            { message: 'Invalid refresh token' },
            { status: 401 }
        )
    }



    const newAccessToken = jwt.sign(
        { ...payload as UserPayload, role: "user" },
        process.env.NEXTAUTH_SECRET as string,
        {
            algorithm: "HS256",
            expiresIn: "15m",
            notBefore: "0s",
            issuer: "smreaz.com",
            audience: "VibeIn_client",
        }
    );
   

    return NextResponse.json({
        accessToken: newAccessToken,
    });
}