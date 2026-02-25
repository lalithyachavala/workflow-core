import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/src/lib/mongodb";
import { requireAuth } from "@/src/lib/request-auth";
import { User } from "@/src/db/models";
import { lbphRegister } from "@/src/lib/lbph-client";

/**
 * Face enrollment: either return instructions (no body) or register with imageBase64List (in-app).
 */
export async function POST(req: NextRequest) {
  await connectMongo();
  const user = await requireAuth(req);
  if (!user?.sub) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const dbUser = await User.findById(user.sub).lean();
  const profile = dbUser?.profile as { employeeCode?: string; displayName?: string } | undefined;
  const employeeCode = profile?.employeeCode ?? "";
  const displayName = profile?.displayName ?? user.name ?? user.email ?? "User";

  let body: { imageBase64List?: string[] } = {};
  try {
    body = await req.json();
  } catch {
    // no body
  }

  const imageBase64List = body?.imageBase64List;
  if (Array.isArray(imageBase64List) && imageBase64List.length >= 5 && imageBase64List.length <= 15) {
    if (!employeeCode) {
      return NextResponse.json(
        { ok: false, message: "Profile employee code is required for face enrollment." },
        { status: 400 }
      );
    }
    try {
      const result = await lbphRegister(employeeCode, displayName, imageBase64List);
      return NextResponse.json(result);
    } catch (e) {
      const message = e instanceof Error ? e.message : "LBPH register failed.";
      return NextResponse.json({ ok: false, message }, { status: 502 });
    }
  }

  return NextResponse.json({
    ok: true,
    message: "Register your face using the face-attendance-system (register_face.py) with your employee code as the ID.",
    employeeCode: employeeCode || "(set in profile)",
  });
}
