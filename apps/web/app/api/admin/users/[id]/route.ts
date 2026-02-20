import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectMongo } from "@/src/lib/mongodb";
import { Role, User } from "@/src/db/models";
import { requirePermission } from "@/src/lib/request-auth";
import { writeAuditLog } from "@/src/audit/log";

const bodySchema = z.object({
  roleNames: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  profile: z
    .object({
      displayName: z.string().optional(),
      employeeCode: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      nationality: z.string().optional(),
      dateOfBirth: z.string().optional(),
      gender: z.string().optional(),
      maritalStatus: z.string().optional(),
      jobTitle: z.string().optional(),
      department: z.string().optional(),
      manager: z.string().optional(),
      phone: z.string().optional(),
      timezone: z.string().optional(),
      skills: z.array(z.string()).optional(),
      education: z.string().optional(),
      languages: z.array(z.string()).optional(),
      dependents: z.array(z.string()).optional(),
      contacts: z.array(z.string()).optional(),
    })
    .optional(),
});

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  await connectMongo();
  const auth = await requirePermission(req, "users", "update");
  if (!auth.allowed || !auth.user) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload.", errors: parsed.error.flatten() }, { status: 400 });
  }

  const { id } = await ctx.params;
  const update: Record<string, unknown> = {};
  if (typeof parsed.data.isActive === "boolean") {
    update.isActive = parsed.data.isActive;
  }
  if (parsed.data.profile) {
    for (const [key, value] of Object.entries(parsed.data.profile)) {
      update[`profile.${key}`] = key === "dateOfBirth" && value ? new Date(value as string) : value;
    }
  }
  if (parsed.data.roleNames?.length) {
    const roles = await Role.find({ name: { $in: parsed.data.roleNames } }).lean();
    update.roleIds = roles.map((r) => r._id);
  }

  const user = await User.findByIdAndUpdate(id, { $set: update }, { new: true })
    .populate("roleIds", "name")
    .lean();
  await writeAuditLog(auth.user.sub, "user.update", { userId: id, changes: parsed.data });
  return NextResponse.json({ user });
}
