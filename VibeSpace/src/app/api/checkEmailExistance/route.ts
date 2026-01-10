import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/db";
import { getRedisClient } from "@/lib/redis";
import User from "@/models/User";


export const POST = async (req: Request) => {
  try {
    await connectToDb();

    const Redis = getRedisClient();
    if (!Redis) {
      return NextResponse.json(
        { message: "Please try again" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const key = `userInfo:${normalizedEmail}`;

    let user = await Redis.get(key);

    if (user) {
      return NextResponse.json(
        { user: JSON.parse(user), fromCache: true },
        { status: 200 }
      );
    }

    const userExist = await User.findOne({ email: normalizedEmail });

    if (!userExist) {
      return NextResponse.json(
        { user: false },
        { status: 200 }
      );
    }

    const safeUser = {
      id: userExist._id,
      name: userExist.name,
      picture: userExist.picture?.url,
    };

    await Redis.set(
      key,
      JSON.stringify(safeUser),
      "EX",
      10 * 60
    );

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
};