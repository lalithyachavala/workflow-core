import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectMongo } from "@/src/lib/mongodb";
import { requirePermission } from "@/src/lib/request-auth";
import { User } from "@/src/db/models";

const bodySchema = z.object({
  userId: z.string().min(12),
  imageBase64: z.string().optional(), // ignored; enrollment is via register_face.py
});

/**
 * Face enrollment is done via LBPH (register_face.py). This endpoint returns
 * the user's employee code so admin can register them there with the same ID.
 */
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

  const user = await User.findById(parsed.data.userId).lean();
  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  const employeeCode = (user.profile as { employeeCode?: string })?.employeeCode ?? "";

  return NextResponse.json({
    ok: true,
    message: "Register this user's face using face-attendance-system/register_face.py. Use the employee code below as the ID.",
    employeeCode,
    displayName: (user.profile as { displayName?: string })?.displayName ?? "",
  });
}
