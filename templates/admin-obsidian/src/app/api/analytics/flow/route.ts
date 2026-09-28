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

        const days = Math.min(Number(range) || 30, 365);
        const from = startOfDay(subDays(new Date(), days));
        const to = endOfDay(new Date());

        // Get all page_view events with previousPage in metadata
        const pageViews = await prisma.analyticsEvent.findMany({
            where: {
                eventType: "page_view",
                createdAt: { gte: from, lte: to },
            },
            select: {
                page: true,
                metadata: true,
            },
        });

        // Build flow map: { "from → to": count }
        const flowMap: Record<string, number> = {};
        const entryPages: Record<string, number> = {};

        for (const pv of pageViews) {
            let previousPage: string | null = null;
            if (pv.metadata) {
                try {
                    const meta = JSON.parse(pv.metadata);
                    previousPage = meta.previousPage || null;
                } catch { /* ignore */ }
            }

            if (previousPage) {
                const key = `${previousPage}|||${pv.page}`;
                flowMap[key] = (flowMap[key] || 0) + 1;
            } else {
                // Entry page (first page in session)
                entryPages[pv.page] = (entryPages[pv.page] || 0) + 1;
            }
        }

        // Convert to array and sort by count
        const flows = Object.entries(flowMap)
            .map(([key, count]) => {
                const [from, to] = key.split("|||");
                return { from, to, count };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 50);

        const entries = Object.entries(entryPages)
            .map(([page, count]) => ({ page, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 20);

        // Exit pages from sessions
        const exitPages = await prisma.analyticsSession.groupBy({
            by: ["exitPage"],
            where: { startedAt: { gte: from, lte: to }, exitPage: { not: null } },
            _count: { exitPage: true },
            orderBy: { _count: { exitPage: "desc" } },
            take: 20,
        });

        return NextResponse.json({
            flows,
            entryPages: entries,
            exitPages: exitPages.map(e => ({ page: e.exitPage, count: e._count.exitPage })),
        });
    } catch (error) {
        console.error("Flow API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
