import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/src/lib/mongodb";
import { requireAuth } from "@/src/lib/request-auth";
import { WorkSession } from "@/src/db/models";

export async function GET(req: NextRequest) {
  await connectMongo();
  const user = await requireAuth(req);
  if (!user?.sub) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const sessions = await WorkSession.find({ userId: user.sub })
    .sort({ clockInAt: -1 })
    .limit(30)
    .lean();
  return NextResponse.json({ sessions });
}
