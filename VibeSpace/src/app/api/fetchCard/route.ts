import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/db";
import Card from "@/models/Card";


export async function GET() {
  try {

    await connectToDb();

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