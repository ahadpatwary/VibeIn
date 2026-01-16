import { connectToDb } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getRedisClient } from "@/lib/redis";
import { getRabbitChannel } from "@/lib/rabbitMQ";


export async function POST(req: Request) {
    try {
        await connectToDb();

        const redis = getRedisClient();
        if (!redis) {
            return NextResponse.json(
                { message: "Internal server error" },
                { status: 500 }
            );
        }

        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: "Email and password are required" },
                { status: 400 }
            );
        }

        const attemptKey = `login_attempt:${email}`;
        const attempts = Number(await redis.get(attemptKey)) || 0;

        if (attempts >= 5) {
            return NextResponse.json(
                { message: "Too many login attempts. Try again later." },
                { status: 429 }
            );
        }

        let user = null;
        const emailNotExistKey = `emailNotExistOnDb:${email}`;
        const emailNotExist = await redis.get(emailNotExistKey);

        if (!emailNotExist) {
            user = await User.findOne({ email });

            if (!user) {
                await redis.set(emailNotExistKey, "1", "EX", 4 * 60);
            }
        }

        if (!user) {
            await redis.set(attemptKey, attempts + 1, "EX", 10 * 60);
            return NextResponse.json(
                { message: "Invalid email or password" },
                { status: 401 }
            );
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            await redis.set(attemptKey, attempts + 1, "EX", 10 * 60);
            return NextResponse.json(
                { message: "Invalid email or password" },
                { status: 401 }
            );
        }

        await redis.del(attemptKey);
        await redis.del(emailNotExistKey);


        const channel = await getRabbitChannel();
        await channel.assertQueue("emailNotificationQueue", { durable: true });

        await channel.sendToQueue(
            "emailNotificationQueue",
            Buffer.from(
                JSON.stringify({
                email: user.email,
                event: "LOGIN_ALERT",
                })
            ),
            { persistent: true }
        );

        return NextResponse.json(
            { message: user._id },
            { status: 200 }
        );

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}