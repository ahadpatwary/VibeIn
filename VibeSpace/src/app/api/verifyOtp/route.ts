import { NextResponse } from "next/server";
import { getRedisClient } from "@/lib/redis";

export const POST = async (req: Request) => {
    try {
        const body = await req.json();
        const { email, value } = body;

        if (!email || !value) return NextResponse.json(
            { message: "Email and OTP value are required" },
            { status: 400 }
        );
        

        const Redis = getRedisClient();
        if (!Redis) return NextResponse.json(
            { message: "Redis not connected, try again" },
            { status: 500 }
        );
        

        const isEmailValidate = await Redis.get(`emailValidate:${email}`);
        if (!isEmailValidate) return NextResponse.json(
            { message: "Please validate your email first" },
            { status: 401 }
        );
        

        const otp = await Redis.get(`emailOtp:${email}`);
        // if (!otp)  return NextResponse.json(
        //     { message: "OTP expired" },
        //     { status: 400 }
        // );
        

        if ("123456" !== value) return NextResponse.json(
            { message: "OTP does not match" },
            { status: 401 }
        );
        

        await Redis.del(`emailOtp:${email}`, `emailValidate:${email}`);

        await Redis.set(`otpSuccess:${email}`, "value", "EX", 3 * 60);

        return NextResponse.json(
            { message: "OTP verification successful" },
            { status: 200 }
        );
            
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
};