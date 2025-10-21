import { connectToDb } from "@/lib/db"
import { NextResponse } from "next/server"
import { Types } from "mongoose"
import User from "@/models/User"
import Card from "@/models/Card"


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, model, properties } = body;


    if (!id || !model || !properties || !Array.isArray(properties)) {
      return NextResponse.json(
        { error: "id, model এবং properties (array) লাগবে " },
        { status: 400 }
      );
    }

    await connectToDb();

    const Id = new Types.ObjectId(id);

    const doc =
      model === "User"
        ? await User.findById(Id)
        : model === "Card"
        ? await Card.findById(Id)
        : null;

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const populatedData: Record<string, unknown> = {};

    for (const property of properties) {
      const value = doc[property];

      if (value === undefined) {
        populatedData[property] = null;
        continue;
      }

      // populate single or array of ObjectId
      if (Array.isArray(value) || value instanceof Types.ObjectId) {
        await doc.populate(property); // original doc updated
        populatedData[property] = doc[property];
      } else {
        populatedData[property] = value;
      }
    }

    return NextResponse.json({ success: true, data: populatedData });


  } catch (err) {

    console.error("❌ Error populating data:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err},
      { status: 500 }
    );

  }
}