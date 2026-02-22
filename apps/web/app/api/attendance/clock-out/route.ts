import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectMongo } from "@/src/lib/mongodb";
import { requireAuth } from "@/src/lib/request-auth";
import { getClientIp } from "@/src/lib/ip";
import { clockOut, registerDevice } from "@/src/attendance/service";
import { verifyFace } from "@/src/biometric/face";

const bodySchema = z.object({
  embedding: z.array(z.number()).length(512),
  deviceFingerprint: z.string().min(3),
  hostname: z.string().min(1),
  osVersion: z.string().min(1),
  appVersion: z.string().min(1),
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
    return NextResponse.json({ message: "Face verification failed.", faceResult }, { status: 403 });
  }

  const device = await registerDevice({
    userId: user.sub,
    deviceFingerprint: parsed.data.deviceFingerprint,
    hostname: parsed.data.hostname,
    osVersion: parsed.data.osVersion,
    appVersion: parsed.data.appVersion,
  });

  try {
    const session = await clockOut({
      userId: user.sub,
      ip: getClientIp(req),
      deviceId: device._id.toString(),
      faceScore: faceResult.score,
      verificationStatus: "verified",
    });
    return NextResponse.json({ ok: true, session });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 400 });
  }
}
