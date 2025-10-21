import { NextRequest, NextResponse } from "next/server";
import { connectToDb } from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/auth";
import { uploadFile } from "@/lib/uploadPicture";
import { Types } from 'mongoose'


export async function POST(req: NextRequest) {
  try {
    await connectToDb();

    let userId: string | undefined;

    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      userId = decoded.id;
    }

    if (!userId) {
      const session = await getServerSession(authOptions);
      if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
      userId = session.user.id;
    }


    const formData = await req.formData();
    const name = formData.get("name")?.toString();
    const dob = formData.get("dob")?.toString();
    const phoneNumber = formData.get("phoneNumber")?.toString();
    const pictureFile = formData.get("picture") as File | null;

  
    let pictureUrl;
    let picturePublicId ;
    if (pictureFile) {
      const res = await uploadFile(pictureFile, "user_pictures");
      if (!res.success) {
        return NextResponse.json(
          { error: "Image upload failed" },
          { status: 500 }
        );
      }
      pictureUrl = res.url;
      picturePublicId = res.public_id;
    }

    // const newUser = await User.create({
    //   name,
    //   dob,
    //   phoneNumber,
    //   picture: {
    //     url: pictureUrl ,
    //     public_id: picturePublicId ,
    //   },
    // });
    const userObjectID = new Types.ObjectId(userId);

    const user = await User.findById(userObjectID); // existing user fetch

    if (user) {
      user.name = name;
      user.dob = dob;
      user.phoneNumber = phoneNumber;
      user.picture = {
        url: pictureUrl,
        public_id: picturePublicId,
      };

      await user.save(); // changes DB te save hobe
    }


    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: user });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ success: false, error: error}, { status: 500 });
  }
}

// ---------------------------
// Disable default body parser
// ---------------------------
export const config = {
  api: {
    bodyParser: false,
  },
};