import { NextResponse } from "next/server";
import { z } from "zod";
import { connectMongo } from "@/src/lib/mongodb";
import { RefreshToken, User, Role } from "@/src/db/models";
import { createAccessToken, rotateRefreshToken } from "@/src/lib/tokens";
import crypto from "crypto";

const bodySchema = z.object({
  refreshToken: z.string().min(10),
});

export async function POST(req: Request) {
  await connectMongo();

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const incomingToken = parsed.data.refreshToken;
  const tokenHash = crypto.createHash("sha256").update(incomingToken).digest("hex");
  const refreshDoc = await RefreshToken.findOne({ tokenHash, revokedAt: null }).lean();
  if (!refreshDoc || refreshDoc.expiresAt < new Date()) {
    return NextResponse.json({ message: "Refresh token invalid." }, { status: 401 });
  }

  const user = await User.findById(refreshDoc.userId).lean();
  if (!user || !user.isActive) {
    return NextResponse.json({ message: "User not active." }, { status: 401 });
  }

  const roles = await Role.find({ _id: { $in: user.roleIds } }).lean();
  const accessToken = await createAccessToken({
    sub: user._id.toString(),
    email: user.email,
    roles: roles.map((role) => role.name),
  });
  const newRefreshToken = await rotateRefreshToken(user._id.toString(), incomingToken);

  if (!newRefreshToken) {
    return NextResponse.json({ message: "Refresh rotation failed." }, { status: 401 });
  }

  return NextResponse.json({ accessToken, refreshToken: newRefreshToken });
}
