import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/src/lib/mongodb";
import { requireAuth } from "@/src/lib/request-auth";
import { FaceTemplate } from "@/src/db/models";

export async function GET(req: NextRequest) {
  await connectMongo();
  const user = await requireAuth(req);
  if (!user?.sub) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const template = await FaceTemplate.findOne({ userId: user.sub }).lean();
  return NextResponse.json({ hasTemplate: !!(template?.embeddingVector?.length) });
}
