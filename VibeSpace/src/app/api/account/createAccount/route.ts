import Account from '@/models/Account';
import { NextResponse } from 'next/server';
import { Types } from 'mongoose'
import User from '@/models/User';
import { z } from "zod";
import { getRedisClient } from '@/modules/lib/redis';
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { connectToDb } from '@/modules/lib/db';

const baseAuthSchema = z.object({
    type: z.enum(["credentials", "google", "github"]),
    providerId: z.string().optional(),
    name: z.string().trim().optional(),
    profilePicture: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
});


export const authSchema = baseAuthSchema.superRefine((data, ctx) => {

    console.log("data.type", data.type)

    // credentials login
    if (data.type === "credentials") {
        console.log("yes im coming on credina")
        if (!data.password) {
            ctx.addIssue({
                path: ["password"],
                message: "Password is required for credentials login",
                code: z.ZodIssueCode.custom,
            });
        }
    }

    // OAuth login
    if (data.type !== "credentials") {
        console.log("yes outh provider")
        if (!data.providerId) {
            ctx.addIssue({
                path: ["providerId"],
                message: "Provider ID is required for OAuth login",
                code: z.ZodIssueCode.custom,
            });
        }
    }
}
);

export type AuthSchemaType = z.infer<typeof authSchema>;



export async function POST(req: Request) {
    try {

        const body: AuthSchemaType = await req.json();

        const result = authSchema.safeParse(body);

        await connectToDb();

        if (!result.success) {
            return NextResponse.json(
                { message: result.error.format() },
                { status: 400 }
            );
        }

        const { type } = body;

        const user = await User.create({
            name: type === 'credentials' ? body.name || "<User>" : "<User>",
            profilePicture: {
                url: type === 'credentials' ? body.profilePicture : "",
                public_id: type !== 'credentials' ? null : "",
            }
        });

        const userId = user._id;

        const account = (type === 'credentials') ? await Account.create({
            type: 'credentials',
            email: body.email,
            password: body.password,
            authorId: new Types.ObjectId(userId)
        }) : await Account.create({
            type: type,
            email: body.email,
            authorId: new Types.ObjectId(userId)
        })

        const accountId = account._id;


        const Redis = getRedisClient();

        if (!Redis) {
            return NextResponse.json(
                { message: "Redis not connected" },
                { status: 501 }
            );
        }

        const deviceId = Buffer.from(crypto.randomUUID()).toString("base64");

        const payload = {
            sub: userId,
            deviceId: deviceId,
            accountId: accountId,
        }

        const accessToken = jwt.sign(
            {
                ...payload,
                role: "user",
            },
            process.env.NEXTAUTH_SECRET as string,
            {
                algorithm: "HS256",
                expiresIn: "15m",
                notBefore: "0s",
                issuer: "smreaz.com",
                audience: "VibeIn_client",
            }
        );

        (await cookies()).set("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60,
            path: "/"
        })

        const refreshToken = jwt.sign(
            {
                ...payload,
                role: "user",
            },
            process.env.NEXTAUTH_SECRET as string,
            {
                algorithm: "HS256",
                expiresIn: "1m",
                notBefore: "0s",
                issuer: "smreaz.com",
                audience: "VibeIn_client",
            }
        ); // ekhane semiclone dite i hobe,,


        (await cookies()).set("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 30 * 24 * 60 * 60,
            path: "/"
        })


        await Redis.set(
            `refreshToken:${deviceId}`,
            refreshToken,
            "EX",
            30 * 24 * 60 * 60 // 30 days
        )

        return NextResponse.json(
            payload,
            { status: 200 }
        )


    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        }
    }
}