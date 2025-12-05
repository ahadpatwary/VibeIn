import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/db";
import Card from "@/models/Card";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    await connectToDb();

    // Redis test values
    await redis.set("foo", "bar");
    await redis.set(
      "obj",
      JSON.stringify({
        id: "12345",
        name: "Abdul Ahad",
        role: "Admin"
      })
    );


    const allActiveCards = await Card.find({
      videoPrivacy: { $ne: "private" },  // NOT EQUAL properly
    })
      .sort({ createdAt: -1 })           // createAt → createdAt হওয়া উচিত
      .skip(1)
      .limit(25)
    ;

  
    return NextResponse.json(
      { activeCards: allActiveCards },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching filtered cards:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
