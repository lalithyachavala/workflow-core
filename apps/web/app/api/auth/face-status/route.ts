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
  // Only consider new 3-pose embeddings as having a template (legacy SHA256 template is not used for verify).
  const hasTemplate =
    (template?.embeddingFront && typeof template.embeddingFront === "string") ||
    (template?.embeddingLeft && typeof template.embeddingLeft === "string") ||
    (template?.embeddingRight && typeof template.embeddingRight === "string");
  return NextResponse.json({ hasTemplate: !!hasTemplate });
}
