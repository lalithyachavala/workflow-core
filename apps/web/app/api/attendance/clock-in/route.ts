import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectMongo } from "@/src/lib/mongodb";
import { requireAuth } from "@/src/lib/request-auth";
import { getClientIp } from "@/src/lib/ip";
import { clockIn, registerDevice } from "@/src/attendance/service";
import { User } from "@/src/db/models";
import { verifyFaceForUser } from "@/src/lib/face-verify";

const bodySchema = z.object({
  imageBase64: z.string().min(100),
  deviceFingerprint: z.string().min(3),
  hostname: z.string().min(1),
  osVersion: z.string().min(1),
  appVersion: z.string().min(1),
});

export async function POST(req: NextRequest) {
  await connectMongo();
  const authUser = await requireAuth(req);
  if (!authUser?.sub) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const user = await User.findById(authUser.sub).lean();
  const employeeCode = (user?.profile as { employeeCode?: string } | undefined)?.employeeCode ?? "";

  const faceResult = await verifyFaceForUser(parsed.data.imageBase64, employeeCode);
  if (!faceResult.ok) {
    return NextResponse.json(
      { message: faceResult.message },
      { status: faceResult.message.includes("Face service") ? 502 : 403 },
    );
  }

  const device = await registerDevice({
    userId: authUser.sub,
    deviceFingerprint: parsed.data.deviceFingerprint,
    hostname: parsed.data.hostname,
    osVersion: parsed.data.osVersion,
    appVersion: parsed.data.appVersion,
  });

  try {
    await clockIn({
      userId: authUser.sub,
      ip: getClientIp(req),
      deviceId: device._id.toString(),
      faceScore: faceResult.confidence ?? 0,
      verificationStatus: "verified",
    });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    faceScore: faceResult.confidence ?? 0,
  });
}
