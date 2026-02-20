import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/src/lib/mongodb";
import { requirePermission } from "@/src/lib/request-auth";
import { AttendanceEvent } from "@/src/db/models";

export async function GET(req: NextRequest) {
  await connectMongo();
  const auth = await requirePermission(req, "attendance", "read");
  if (!auth.allowed) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const events = await AttendanceEvent.find()
    .sort({ timestamp: -1 })
    .limit(100)
    .populate("userId", "email profile")
    .lean();

  return NextResponse.json({ events });
}
