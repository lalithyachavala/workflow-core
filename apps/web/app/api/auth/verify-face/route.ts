import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectMongo } from "@/src/lib/mongodb";
import { requireAuth } from "@/src/lib/request-auth";
import { User } from "@/src/db/models";
import { checkFaceVerifyRateLimit } from "@/src/lib/rate-limit";
import { verifyFaceForUser } from "@/src/lib/face-verify";

const bodySchema = z.object({
  imageBase64: z.string().min(100),
});

const FACE_VERIFY_LOCK_MINUTES = 0;
const FACE_VERIFY_LOCK_AFTER_FAILS = 1000;

export async function POST(req: NextRequest) {
  await connectMongo();
  const authUser = await requireAuth(req);
  if (!authUser?.sub) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const rate = checkFaceVerifyRateLimit(authUser.sub);
  if (!rate.allowed) {
    return NextResponse.json({ message: "Too many verification attempts. Try again later." }, { status: 429 });
  }

  const user = await User.findById(authUser.sub).lean();
  /*
  if (user?.faceVerifyLockedUntil && new Date(user.faceVerifyLockedUntil) > new Date()) {
    return NextResponse.json(
      { message: `Account locked. Try again after ${new Date(user.faceVerifyLockedUntil).toLocaleTimeString()}.` },
      { status: 403 },
    );
  }
  */

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const employeeCode = (user?.profile as { employeeCode?: string } | undefined)?.employeeCode ?? "";

  const result = await verifyFaceForUser(parsed.data.imageBase64, employeeCode);

  if (!result.ok) {
    console.warn("[verify-face] Failed:", { message: result.message, employeeCode });
    const failCount = ((user?.faceVerifyFailedAttempts as number) ?? 0) + 1;
    const updates: Record<string, unknown> = { faceVerifyFailedAttempts: failCount };
    if (failCount >= FACE_VERIFY_LOCK_AFTER_FAILS) {
      const lockUntil = new Date(Date.now() + FACE_VERIFY_LOCK_MINUTES * 60 * 1000);
      updates.faceVerifyLockedUntil = lockUntil;
    }
    await User.findByIdAndUpdate(authUser.sub, { $set: updates });
    return NextResponse.json(
      {
        ok: false,
        message: result.message,
        faceResult: result.confidence != null ? { reason: "below_threshold", score: result.confidence } : undefined,
      },
      { status: result.message.includes("Face service") ? 502 : 403 },
    );
  }

  await User.findByIdAndUpdate(authUser.sub, {
    $set: { faceVerifyFailedAttempts: 0, faceVerifyLockedUntil: null },
  });

  return NextResponse.json({
    ok: true,
    faceScore: result.confidence != null ? result.confidence / 100 : 0,
  });
}
