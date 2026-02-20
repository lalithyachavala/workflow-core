import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectMongo } from "@/src/lib/mongodb";
import { CompanyStructure } from "@/src/db/models";
import { requirePermission } from "@/src/lib/request-auth";
import { writeAuditLog } from "@/src/audit/log";

const bodySchema = z.object({
  name: z.string().min(1),
  address: z.string().default(""),
  type: z.string().default("Department"),
  country: z.string().default(""),
  timeZone: z.string().default(""),
  parentStructure: z.string().default(""),
});

export async function GET(req: NextRequest) {
  await connectMongo();
  const auth = await requirePermission(req, "company_structure", "read");
  if (!auth.allowed) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const rows = await CompanyStructure.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ rows });
}

export async function POST(req: NextRequest) {
  await connectMongo();
  const auth = await requirePermission(req, "company_structure", "create");
  if (!auth.allowed || !auth.user) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload.", errors: parsed.error.flatten() }, { status: 400 });
  }

  const row = await CompanyStructure.create(parsed.data);
  await writeAuditLog(auth.user.sub, "company_structure.create", { rowId: row._id.toString() });
  return NextResponse.json({ row }, { status: 201 });
}
