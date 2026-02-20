import { NextResponse } from "next/server";
import { z } from "zod";
import { connectMongo } from "@/src/lib/mongodb";
import { revokeRefreshToken } from "@/src/lib/tokens";

const bodySchema = z.object({
  refreshToken: z.string().min(10),
});

export async function POST(req: Request) {
  await connectMongo();
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  await revokeRefreshToken(parsed.data.refreshToken);
  return NextResponse.json({ ok: true });
}
