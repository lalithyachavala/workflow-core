import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/src/lib/mongodb";
import { requirePermission } from "@/src/lib/request-auth";
import { AwayAlert } from "@/src/db/models";

export async function GET(req: NextRequest) {
  await connectMongo();
  const auth = await requirePermission(req, "attendance", "read");
  if (!auth.allowed) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const alerts = await AwayAlert.find()
    .sort({ awayAt: -1 })
    .limit(50)
    .lean();

  return NextResponse.json({ alerts });
}
