import { NextResponse } from "next/server";
import { z } from "zod";
import { connectMongo } from "@/src/lib/mongodb";
import { ensureBootstrap } from "@/src/lib/bootstrap";
import { User, Role } from "@/src/db/models";
import { verifyPassword } from "@/src/lib/password";
import { createAccessToken, createRefreshToken } from "@/src/lib/tokens";
import { checkRateLimit } from "@/src/lib/rate-limit";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  await connectMongo();
  await ensureBootstrap();

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }
  const rate = checkRateLimit(parsed.data.email.toLowerCase());
  if (!rate.allowed) {
    return NextResponse.json({ message: "Too many attempts." }, { status: 429 });
  }

  const email = parsed.data.email.toLowerCase();
  const user = await User.findOne({ email }).lean();
  if (!user || !user.isActive) {
    return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
  }

  const isValid = await verifyPassword(user.passwordHash, parsed.data.password);
  if (!isValid) {
    return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
  }

  const roles = await Role.find({ _id: { $in: user.roleIds } }).lean();
  const roleNames = roles.map((role) => role.name);

  const accessToken = await createAccessToken({
    sub: user._id.toString(),
    email: user.email,
    roles: roleNames,
  });
  const refreshToken = await createRefreshToken(user._id.toString());

  return NextResponse.json({
    accessToken,
    refreshToken,
    user: {
      id: user._id.toString(),
      email: user.email,
      roles: roleNames,
    },
  });
}
