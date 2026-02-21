import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/src/lib/mongodb";
import { requireAuth } from "@/src/lib/request-auth";
import { User } from "@/src/db/models";

export async function GET(req: NextRequest) {
  await connectMongo();
  const user = await requireAuth(req);
  if (!user?.sub) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const doc = await User.findById(user.sub)
    .select("email profile roleIds")
    .populate("roleIds", "name")
    .lean();

  if (!doc) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  const roles = (doc.roleIds as { name: string }[]).map((r) => r.name);

  return NextResponse.json({
    user: {
      id: doc._id.toString(),
      email: doc.email,
      roles,
      profile: {
        displayName: doc.profile?.displayName ?? "",
        profilePictureBase64: doc.profile?.profilePictureBase64 ?? "",
      },
    },
  });
}
