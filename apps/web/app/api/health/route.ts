import { NextResponse } from "next/server";
import { connectMongo } from "@/src/lib/mongodb";

export async function GET() {
  await connectMongo();
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
