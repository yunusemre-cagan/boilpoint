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
        const page = searchParams.get("page") || "/";
        const range = searchParams.get("range") || "30";

        const days = Math.min(Number(range) || 30, 365);
        const from = startOfDay(subDays(new Date(), days));
        const to = endOfDay(new Date());

        // Get all heatmap_click events for the specified page
        const clicks = await prisma.analyticsEvent.findMany({
            where: {
                eventType: "heatmap_click",
                page,
                createdAt: { gte: from, lte: to },
            },
            select: {
                metadata: true,
                createdAt: true,
            },
            take: 5000, // limit to prevent overload
            orderBy: { createdAt: "desc" },
        });

        // Parse coordinates from metadata
        const points = clicks
            .map((c) => {
                try {
                    const meta = JSON.parse(c.metadata || "{}");
                    return {
                        x: parseFloat(meta.x),
                        y: parseFloat(meta.y),
                        viewportWidth: meta.viewportWidth,
                        viewportHeight: meta.viewportHeight,
                    };
                } catch {
                    return null;
                }
            })
            .filter((p): p is NonNullable<typeof p> => p !== null && !isNaN(p.x) && !isNaN(p.y));

        // Get available pages for the dropdown
        const availablePages = await prisma.analyticsEvent.groupBy({
            by: ["page"],
            where: {
                eventType: "heatmap_click",
                createdAt: { gte: from, lte: to },
            },
            _count: { page: true },
            orderBy: { _count: { page: "desc" } },
            take: 50,
        });

        return NextResponse.json({
            page,
            totalClicks: points.length,
            points,
            availablePages: availablePages.map(p => ({ page: p.page, count: p._count.page })),
        });
    } catch (error) {
        console.error("Heatmap API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
