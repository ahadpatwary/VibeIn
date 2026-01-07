import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/db";
import Card from "@/models/Card";

export async function GET() {
  try {
    await connectToDb();

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
