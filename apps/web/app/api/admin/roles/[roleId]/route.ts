import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectMongo } from "@/src/lib/mongodb";
import { requirePermission } from "@/src/lib/request-auth";
import { Role } from "@/src/db/models";
import { writeAuditLog } from "@/src/audit/log";

const patchSchema = z.object({
  description: z.string().optional(),
  permissions: z.array(z.string().regex(/^[a-z]+:[a-z]+$/)).optional(),
});

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ roleId: string }> },
) {
  await connectMongo();
  const auth = await requirePermission(req, "roles", "update");
  if (!auth.allowed || !auth.user) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }
  const { roleId } = await ctx.params;

  const role = await Role.findByIdAndUpdate(roleId, { $set: parsed.data }, { new: true }).lean();
  await writeAuditLog(auth.user.sub, "role.update", { roleId, changes: parsed.data });
  return NextResponse.json({ role });
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ roleId: string }> },
) {
  await connectMongo();
  const auth = await requirePermission(req, "roles", "delete");
  if (!auth.allowed || !auth.user) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const { roleId } = await ctx.params;
  await Role.findByIdAndDelete(roleId);
  await writeAuditLog(auth.user.sub, "role.delete", { roleId });
  return NextResponse.json({ ok: true });
}
