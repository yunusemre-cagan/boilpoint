import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin";
import { subDays, startOfDay, endOfDay } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    if (!(await getAdminSession())) {
        return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const range = searchParams.get("range") || "30";
        const eventType = searchParams.get("eventType") || undefined;
        const page = searchParams.get("page") || undefined;

        const days = Math.min(Number(range) || 30, 365);
        const from = startOfDay(subDays(new Date(), days));
        const to = endOfDay(new Date());

        const where: any = {
            flagged: true,
            createdAt: { gte: from, lte: to },
        };

        if (eventType) where.eventType = { contains: eventType, mode: "insensitive" };
        if (page) where.page = { contains: page, mode: "insensitive" };

        const events = await prisma.analyticsEvent.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: 100,
            select: {
                id: true,
                eventType: true,
                visitorId: true,
                page: true,
                flagLabel: true,
                metadata: true,
                createdAt: true,
                browser: true,
                deviceType: true,
            },
        });

        return NextResponse.json({ events });
    } catch (error) {
        console.error("Events API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
