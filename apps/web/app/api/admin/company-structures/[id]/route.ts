import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectMongo } from "@/src/lib/mongodb";
import { CompanyStructure } from "@/src/db/models";
import { requirePermission } from "@/src/lib/request-auth";
import { writeAuditLog } from "@/src/audit/log";

const bodySchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().optional(),
  type: z.string().optional(),
  country: z.string().optional(),
  timeZone: z.string().optional(),
  parentStructure: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  await connectMongo();
  const auth = await requirePermission(req, "company_structure", "update");
  if (!auth.allowed || !auth.user) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const { id } = await ctx.params;
  const row = await CompanyStructure.findByIdAndUpdate(id, { $set: parsed.data }, { new: true }).lean();
  await writeAuditLog(auth.user.sub, "company_structure.update", { rowId: id, changes: parsed.data });
  return NextResponse.json({ row });
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  await connectMongo();
  const auth = await requirePermission(req, "company_structure", "delete");
  if (!auth.allowed || !auth.user) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const { id } = await ctx.params;
  await CompanyStructure.findByIdAndDelete(id);
  await writeAuditLog(auth.user.sub, "company_structure.delete", { rowId: id });
  return NextResponse.json({ ok: true });
}
