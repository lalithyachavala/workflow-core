import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/src/lib/mongodb";
import { requirePermission } from "@/src/lib/request-auth";
import { getUserAttendance } from "@/src/attendance/service";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  await connectMongo();
  const auth = await requirePermission(req, "attendance", "read");
  if (!auth.allowed) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const { id } = await ctx.params;
  const url = new URL(req.url);
  const days = Math.min(Math.max(parseInt(url.searchParams.get("days") ?? "30", 10), 7), 90);

  const { sessions, hoursByDay } = await getUserAttendance(id, days);
  return NextResponse.json({ sessions, hoursByDay });
}
