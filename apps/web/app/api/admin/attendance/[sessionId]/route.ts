import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectMongo } from "@/src/lib/mongodb";
import { requirePermission } from "@/src/lib/request-auth";
import { WorkSession } from "@/src/db/models";
import { writeAuditLog } from "@/src/audit/log";

const patchSchema = z.object({
  clockOutAt: z.string().datetime(),
});

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ sessionId: string }> },
) {
  await connectMongo();
  const auth = await requirePermission(req, "attendance", "correct");
  if (!auth.allowed || !auth.user) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const { sessionId } = await ctx.params;
  const session = await WorkSession.findById(sessionId);
  if (!session) {
    return NextResponse.json({ message: "Session not found." }, { status: 404 });
  }

  const clockOutAt = new Date(parsed.data.clockOutAt);
  const totalSeconds = Math.max(
    0,
    Math.floor((clockOutAt.getTime() - session.clockInAt.getTime()) / 1000),
  );
  session.clockOutAt = clockOutAt;
  session.totalSeconds = totalSeconds;
  await session.save();

  await writeAuditLog(auth.user.sub, "attendance.correct", { sessionId, clockOutAt });
  return NextResponse.json({ session });
}
