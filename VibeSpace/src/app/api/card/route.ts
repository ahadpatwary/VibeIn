import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/db";
import Card from "@/models/Card";
import User from "@/models/User";
import { uploadFile } from "@/lib/uploadPicture";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { Types } from "mongoose";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!Types.ObjectId.isValid(session.user.id)) {
      throw new Error("Invalid user id");
    }

    await connectToDb();

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("content") as string;
    const picture = formData.get("picture") as File | null;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    let imageUrl = "";
    let imagePublicId = "";

    if (picture) {
      const res = await uploadFile(picture, "cards");
      if (!res.success) {
        return NextResponse.json(
          { error: "Image upload failed" },
          { status: 500 }
        );
      }
      imageUrl = res.url;
      imagePublicId = res.public_id;
    }

    const userObjectId = new Types.ObjectId(session.user.id);

    const newCard = await Card.create({
      title,
      description,
      image: {
        url: imageUrl,
        public_id: imagePublicId,
      },
      user: userObjectId,
    });

    await User.findByIdAndUpdate(
      userObjectId,
      { $push: { cards: newCard._id } },
      { new: true }
    );

    return NextResponse.json(newCard, { status: 201 });
  } catch (error) {
    console.error("Error creating card:", error);
    return NextResponse.json(
      { error: "Failed to create card" },
      { status: 500 }
    );
  }
}