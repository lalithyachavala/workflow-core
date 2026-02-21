import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectMongo } from "@/src/lib/mongodb";
import { requireAuth } from "@/src/lib/request-auth";
import { enrollFace } from "@/src/biometric/face";

const bodySchema = z.object({
  embedding: z.array(z.number()).length(512),
  pose: z.enum(["front", "left", "right"]),
  profileImageBase64: z.string().optional(),
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

  try {
    await enrollFace(
      user.sub,
      parsed.data.embedding,
      parsed.data.pose,
      parsed.data.profileImageBase64,
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Face enrollment failed.";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
