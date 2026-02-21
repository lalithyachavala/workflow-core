import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectMongo } from "@/src/lib/mongodb";
import { requireAuth } from "@/src/lib/request-auth";
import { verifyFace } from "@/src/biometric/face";

const bodySchema = z.object({
  embedding: z.array(z.number()).length(512),
});

export async function POST(req: NextRequest) {
  await connectMongo();
  const user = await requireAuth(req);
  if (!user?.sub) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const faceResult = await verifyFace(user.sub, parsed.data.embedding);
  if (!faceResult.accepted) {
    const scoreStr = (faceResult.score * 100).toFixed(1);
    return NextResponse.json(
      {
        ok: false,
        message: `Face verification failed. Score: ${scoreStr}% (need ~32%). ${faceResult.reason === "no_template" ? "Enroll your face first (3 poses)." : ""}`,
        faceResult: { reason: faceResult.reason, score: faceResult.score },
      },
      { status: 403 },
    );
  }

  return NextResponse.json({ ok: true, faceScore: faceResult.score });
}
