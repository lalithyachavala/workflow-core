import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/src/lib/mongodb";
import { requireAuth } from "@/src/lib/request-auth";
import { getHoursByDay } from "@/src/attendance/service";

export async function GET(req: NextRequest) {
  await connectMongo();
  const user = await requireAuth(req);
  if (!user?.sub) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(req.url);
  const days = Math.min(Math.max(parseInt(url.searchParams.get("days") ?? "30", 10), 7), 90);

  const hoursByDay = await getHoursByDay(user.sub, days);
  return NextResponse.json({ hoursByDay });
}
