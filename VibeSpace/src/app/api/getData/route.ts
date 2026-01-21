import { connectToDb } from "@/lib/db"
import { NextResponse } from "next/server"
import { Types } from "mongoose"
import User from "@/models/User"
import Card from "@/models/Card"


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;


    // if (!id) {
    //   return NextResponse.json(
    //     { error: "id লাগবে " },
    //     { status: 400 }
    //   );
    // }

    await connectToDb();

    // const Id = new Types.ObjectId(id);


    const card = await Card.find().populate('user', '_id name picture');

    if (!card) {
      return NextResponse.json(
        { error: "Data পাওয়া যায়নি " },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: card }, { status: 200 });


  } catch (err) {

    console.error("❌ Error populating data:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err},
      { status: 500 }
    );

  }
}