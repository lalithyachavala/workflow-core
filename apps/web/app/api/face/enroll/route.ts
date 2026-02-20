import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectMongo } from "@/src/lib/mongodb";
import { requirePermission } from "@/src/lib/request-auth";
import { enrollFace } from "@/src/biometric/face";
import { writeAuditLog } from "@/src/audit/log";

const bodySchema = z.object({
  userId: z.string().min(12),
  imageBase64: z.string().min(20),
});

export async function POST(req: NextRequest) {
  await connectMongo();
  const auth = await requirePermission(req, "face", "enroll");
  if (!auth.allowed || !auth.user) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  await enrollFace(parsed.data.userId, parsed.data.imageBase64);
  await writeAuditLog(auth.user.sub, "face.enroll", { userId: parsed.data.userId });
  return NextResponse.json({ ok: true });
}
