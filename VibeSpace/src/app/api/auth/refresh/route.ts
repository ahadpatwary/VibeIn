import { UserPayload } from "@/shared/lib/middleware/tokenVerification";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "@/modules/account/models/session";

export async function POST(req: NextRequest) {
    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
        return NextResponse.json(
            { message: "No refresh token" }, 
            { status: 401 }
        );
    }

    let payload: UserPayload;
    try {

        payload = jwt.verify(refreshToken, process.env.NEXTAUTH_SECRET!, {
            algorithms: ["HS256"],
            issuer: "smreaz.com",
            audience: "VibeIn_client",
        }) as UserPayload;

    } catch {
        return NextResponse.json(
            { message: "Invalid refresh token" }, 
            { status: 401 }
        );
    }

    const { sub, accountId, deviceId } = payload;

    const newRefreshToken = jwt.sign(
        { sub, accountId, deviceId },
        process.env.NEXTAUTH_SECRET!,
        { 
            algorithm: "HS256", 
            expiresIn: "7d", 
            issuer: "smreaz.com", 
            audience: "VibeIn_client" 
        }
    );

    const oldHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const newHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

    try {
        // ek query-তেই old invalidate + new hash save ✅
        const session = await Session.findOneAndUpdate(
            { refreshTokenHash: oldHash, revoked: false },
            { refreshTokenHash: newHash, updatedAt: new Date() },
            { new: true }
        );

      
        if (!session) {
            return NextResponse.json(
                { message: "Invalid refresh token" }, 
                { status: 401 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { message: "Internal server error" }, 
            { status: 500 }
        );
    }

    const newAccessToken = jwt.sign(
        { sub, accountId, deviceId, role: "user" },
        process.env.NEXTAUTH_SECRET!,
        { 
            algorithm: "HS256", 
            expiresIn: "15m", 
            issuer: "smreaz.com", 
            audience: "VibeIn_client" 
        }
    );

    // New refreshToken cookie-তে set করো
    const response = NextResponse.json(
        { accessToken: newAccessToken },
        { status: 200 }
    );

    response.cookies.set("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, 
        path: "/",
    });

    return response;
}