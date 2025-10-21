import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const id = session?.user?.id ?? null;

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("❌ Error getting session:", err);
    return NextResponse.json({ success: false, id: null });
  }
}