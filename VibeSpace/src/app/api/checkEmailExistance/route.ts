import { NextResponse, NextRequest } from "next/server";
import { connectToDb } from "@/lib/db";
import { getRedisClient } from "@/lib/redis";
import User from "@/models/User";
import { getRabbitChannel } from "@/lib/rabbitMQ";

export async function POST(req: NextRequest) {
  try {

    await connectToDb();
    const Redis = getRedisClient();

    if (!Redis)  return NextResponse.json(
      { message: "Please try again" },
      { status: 500 }
    );
    

    const body = await req.json();

    const { email } = body;

    if (!email) return NextResponse.json(
      { message: "Email is required" },
      { status: 400 }
    );
    

    const normalizedEmail = email.toLowerCase().trim();
    const userCacheKey = `userInfo:${normalizedEmail}`;
    const emailValidateKey = `emailValidate:${normalizedEmail}`;


    const cachedUser = await Redis.get(userCacheKey);
    if (cachedUser) return NextResponse.json(
      { user: JSON.parse(cachedUser), fromCache: true },
      { status: 200 }
    );

 
    const userExist = await User.findOne({ email: normalizedEmail });
    if (!userExist) {
      await Redis.set(emailValidateKey, "value", "EX", 5 * 60);

      try {
        const channel = await getRabbitChannel();

        await channel.assertQueue("emailNotificationQueue", {
          durable: true
        });
        await channel.sendToQueue(
          "emailNotificationQueue",
          Buffer.from(JSON.stringify({ email: normalizedEmail }))
        );
        console.log("ahad patwary send to rabbitMQ successfully");
      } catch (err) {
        console.error("RabbitMQ error:", err);
      }

      return NextResponse.json({ user: false }, { status: 200 });
    }

    const safeUser = {
      id: userExist._id,
      name: userExist.name,
      picture: userExist.picture?.url,
    };


    await Redis.set(userCacheKey, JSON.stringify(safeUser), "EX", 10 * 60);

    return NextResponse.json(
      { user: safeUser, fromCache: false },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}