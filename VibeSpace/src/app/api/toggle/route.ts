import { Types } from 'mongoose';
import { connectToDb } from "@/lib/db";
import User from '@/models/User'; 
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { cardId, userId, property } = body;

    await connectToDb();

    const cardObjectId = new Types.ObjectId(cardId);
    const userObjectId = new Types.ObjectId(userId);

    // Check if user already liked this card
    const alreadyLiked = !!(await User.exists({
      _id: userObjectId,
      [property]: cardObjectId
    }));

    let updatedUser;

    if (alreadyLiked) {
      // Remove cardId from likes
      updatedUser = await User.findByIdAndUpdate(
        userObjectId,
        { $pull: { [property]: cardObjectId } },
        { new: true }
      );
    } else {
      // Add cardId to likes array
      updatedUser = await User.findByIdAndUpdate(
        userObjectId,
        { $addToSet: { [property]: cardObjectId } },
        { new: true }
      );
    }

    return NextResponse.json(
        { 
            liked: !alreadyLiked,
            user: updatedUser
        },
        { status: 200 }
    );

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
};