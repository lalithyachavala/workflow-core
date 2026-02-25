import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/src/lib/mongodb";
import { requireAuth } from "@/src/lib/request-auth";
import { User } from "@/src/db/models";
import { lbphGetRegisteredIds } from "@/src/lib/lbph-client";

export async function GET(req: NextRequest) {
  await connectMongo();
  const user = await requireAuth(req);
  if (!user?.sub) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const dbUser = await User.findById(user.sub).lean();
  const employeeCode = (dbUser?.profile as { employeeCode?: string } | undefined)?.employeeCode ?? "";

  let hasTemplate = false;
  try {
    const { ids } = await lbphGetRegisteredIds();
    hasTemplate = ids.includes(employeeCode);
  } catch {
    // LBPH service down or not configured
  }

  return NextResponse.json({ hasTemplate: !!hasTemplate });
}
