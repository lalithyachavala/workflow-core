import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectMongo } from "@/src/lib/mongodb";
import { Role } from "@/src/db/models";
import { requirePermission } from "@/src/lib/request-auth";
import { writeAuditLog } from "@/src/audit/log";

const bodySchema = z.object({
  name: z.string().min(2),
  description: z.string().default(""),
  permissions: z.array(z.string().regex(/^[a-z]+:[a-z]+$/)).min(1),
});

export async function GET(req: NextRequest) {
  await connectMongo();
  const auth = await requirePermission(req, "roles", "read");
  if (!auth.allowed || !auth.user) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const roles = await Role.find().sort({ name: 1 }).lean();
  return NextResponse.json({ roles });
}

export async function POST(req: NextRequest) {
  await connectMongo();
  const auth = await requirePermission(req, "roles", "create");
  if (!auth.allowed || !auth.user) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload.", errors: parsed.error.flatten() }, { status: 400 });
  }

  const role = await Role.create(parsed.data);
  await writeAuditLog(auth.user.sub, "role.create", { roleId: role._id.toString(), name: role.name });
  return NextResponse.json({ role }, { status: 201 });
}
