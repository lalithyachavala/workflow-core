import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectMongo } from "@/src/lib/mongodb";
import { Role, User } from "@/src/db/models";
import { hashPassword } from "@/src/lib/password";
import { requirePermission } from "@/src/lib/request-auth";
import { writeAuditLog } from "@/src/audit/log";
import { sendEmployeeInviteEmail } from "@/src/lib/mailer";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1),
  employeeCode: z.string().min(1),
  roleNames: z.array(z.string()).min(1),
});

export async function GET(req: NextRequest) {
  await connectMongo();
  const auth = await requirePermission(req, "users", "read");
  if (!auth.allowed) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const users = await User.find()
    .populate("roleIds", "name")
    .select("email isActive profile roleIds")
    .lean();
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  await connectMongo();
  const auth = await requirePermission(req, "users", "create");
  if (!auth.allowed || !auth.user) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload.", errors: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await User.findOne({ email: parsed.data.email.toLowerCase() }).lean();
  if (existing) {
    return NextResponse.json({ message: "Email already exists." }, { status: 409 });
  }

  const roles = await Role.find({ name: { $in: parsed.data.roleNames } }).lean();
  if (!roles.length) {
    return NextResponse.json({ message: "No valid roles selected." }, { status: 400 });
  }

  const created = await User.create({
    email: parsed.data.email.toLowerCase(),
    passwordHash: await hashPassword(parsed.data.password),
    roleIds: roles.map((role) => role._id),
    isActive: true,
    profile: {
      displayName: parsed.data.displayName,
      employeeCode: parsed.data.employeeCode,
    },
  });

  await writeAuditLog(auth.user.sub, "user.create", {
    userId: created._id.toString(),
    email: created.email,
  });

  // Try sending a template invitation email!
  await sendEmployeeInviteEmail(
    parsed.data.email.toLowerCase(),
    parsed.data.displayName,
    parsed.data.employeeCode,
    parsed.data.password // Unhashed temporary password intentionally passed for the email
  );

  return NextResponse.json({
    user: {
      id: created._id.toString(),
      email: created.email,
      roles: roles.map((role) => role.name),
    },
  });
}

