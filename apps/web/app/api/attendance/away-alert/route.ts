import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/src/lib/mongodb";
import { requireAuth } from "@/src/lib/request-auth";
import { AwayAlert, User } from "@/src/db/models";

export async function POST(req: NextRequest) {
  await connectMongo();
  const user = await requireAuth(req);
  if (!user?.sub) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const u = await User.findById(user.sub).select("email profile.displayName profile.firstName profile.lastName").lean();
  const employeeEmail = u?.email ?? "unknown";
  const profile = (u as { profile?: { displayName?: string; firstName?: string; lastName?: string } })?.profile;
  const employeeName =
    profile?.displayName || (profile?.firstName || profile?.lastName ? [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") : null) || employeeEmail;

  await AwayAlert.create({
    userId: user.sub,
    employeeEmail,
    employeeName,
    awayAt: new Date(),
    minutesAway: 15,
  });

  return NextResponse.json({ ok: true });
}
