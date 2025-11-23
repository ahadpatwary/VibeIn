import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/db";
import Card from "@/models/Card";
import { redis } from "@/lib/redis";

export async function GET() {
  try {

    await connectToDb();

    await redis.set("foo", "bar");
    await redis.set("obj", {
      id: "12345",
      name: "Abdul Ahad",
      role: "Admin"
    });

    const allCards = await Card.find();

    const activeAllCards = allCards.filter(card => card.videoPrivacy === "public");

    return NextResponse.json(
      { activeCards: activeAllCards },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching filtered cards:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}