import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/src/lib/mongodb";
import { requireAuth } from "@/src/lib/request-auth";
import { getTodaySummary } from "@/src/attendance/service";

/** Today's attendance from DB (sessions + totalSeconds). Persisted so it shows on every login. */
export async function GET(req: NextRequest) {
  await connectMongo();
  const user = await requireAuth(req);
  if (!user?.sub) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const summary = await getTodaySummary(user.sub);
  return NextResponse.json(summary);
}
