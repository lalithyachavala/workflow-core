import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/src/lib/mongodb";
import { requirePermission } from "@/src/lib/request-auth";
import { LoginHistory, User } from "@/src/db/models";

export async function GET(req: NextRequest) {
    try {
        await connectMongo();
        const { allowed } = await requirePermission(req, "users", "read");
        if (!allowed) {
            return NextResponse.json({ message: "Forbidden." }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const daysParam = parseInt(searchParams.get("days") || "7", 10);
        const limit = parseInt(searchParams.get("limit") || "1000", 10);

        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - daysParam);

        const matchQuery = {
            loginTime: { $gte: fromDate }
        };

        const history = await LoginHistory.find(matchQuery)
            .populate("userId", "email profile")
            .sort({ loginTime: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({
            history: history.map((h: any) => ({
                id: h._id.toString(),
                userId: h.userId?._id?.toString(),
                email: h.userId?.email || "Unknown",
                displayName: h.userId?.profile?.displayName || "Unknown",
                loginTime: h.loginTime,
                loginTimeFormatted: h.loginTimeFormatted,
                ipAddress: h.ipAddress,
                systemName: h.systemName,
                location: h.location,
            }))
        });
    } catch (error) {
        console.error("Admin Login History Error:", error);
        return NextResponse.json({ message: "Failed to load login history" }, { status: 500 });
    }
}
