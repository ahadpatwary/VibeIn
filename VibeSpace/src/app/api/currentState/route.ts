import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/db";
import Card from "@/models/Card";
import { Types } from "mongoose";

interface reqType {
  id: string;
  property: string | undefined;
}

export async function POST(req: Request) {
  try {
    await connectToDb();

    const { id, property }: reqType = await req.json();

    if (!id || !property) {
      console.log("not present value"); 
      return NextResponse.json(
        { error: "id and property both are required" },
        { status: 400 }
      );
    }

    const userObjectId = new Types.ObjectId(id);
    const card = await Card.findById(userObjectId).select(property).lean();

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    if (!(property in card)) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // ✅ TypeScript-safe dynamic property access
    return NextResponse.json(
      { value: (card as Record<string , unknown>)[property] },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}