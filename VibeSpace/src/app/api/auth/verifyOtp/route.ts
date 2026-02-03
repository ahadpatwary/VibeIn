import { NextResponse } from "next/server";
import { getRedisClient } from "@/lib/redis";
import { z } from 'zod'
import { otpValidateSchema } from "@/schemas/signIn.schema";

export const POST = async (req: Request) => {
    try {
        const body = await req.json();

        const parsed = otpValidateSchema.safeParse(body);

        if(!parsed.success) {
            return NextResponse.json(
                { message: "email and otp mush be required"},
                { status: 402 }
            )
        }

        const { email , otp } = parsed.data;
        

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
        

        const redisStoreOtp = await Redis.get(`emailOtp:${email}`);
        if (!redisStoreOtp)  return NextResponse.json(
            { message: "OTP expired" },
            { status: 400 }
        );
        

        if (otp !== redisStoreOtp) return NextResponse.json(
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