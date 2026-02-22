import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/src/lib/mongodb";
import { requireAuth } from "@/src/lib/request-auth";
import { LoginHistory, User } from "@/src/db/models";

export async function GET(req: NextRequest) {
    try {
        await connectMongo();
        const authData = await requireAuth(req);

        if (!authData?.sub) {
            return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const daysParam = parseInt(searchParams.get("days") || "7", 10);
        const limit = parseInt(searchParams.get("limit") || "100", 10);

        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - daysParam);

        const matchQuery = {
            userId: authData.sub,
            loginTime: { $gte: fromDate }
        };

        const history = await LoginHistory.find(matchQuery)
            .sort({ loginTime: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({
            history: history.map((h: any) => ({
                id: h._id.toString(),
                loginTime: h.loginTime,
                loginTimeFormatted: h.loginTimeFormatted,
                ipAddress: h.ipAddress,
                systemName: h.systemName,
                location: h.location,
            }))
        });
    } catch (error) {
        console.error("LoginHistory Error:", error);
        return NextResponse.json({ message: "Failed to load login history" }, { status: 500 });
    }
}
