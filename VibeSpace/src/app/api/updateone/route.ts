import { connectToDb } from "@/lib/db";
import Card from "@/models/Card";
import { NextResponse } from "next/server";
import { Types } from "mongoose";

console.log("ahad patwary created");
interface typeObj {
  cardId: string,
  field: string,
  value: string,
}

export async function POST(req: Request) {
  try {
    // 🔹 Connect to DB
    await connectToDb();

    // 🔹 Parse request body
    const body = await req.json();
    const { cardId, field, value }: typeObj = body;

    if (!cardId || !field) {
      return NextResponse.json(
        { error: "cardId and field are required" },
        { status: 400 }
      );
    }

    // 🔹 Convert string to ObjectId
    const userObjectId = new Types.ObjectId(cardId);

    // 🔹 Dynamic update object
    const updateObj = { [field]: value };

    // 🔹 Update user
    const updatedUser = await Card.findByIdAndUpdate(
      userObjectId,
      updateObj,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 403 });
    }

    // ✅ Success response
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Error updating user:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}