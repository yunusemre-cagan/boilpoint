import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin";
import { subDays, startOfDay, endOfDay, format } from "date-fns";

export const dynamic = "force-dynamic";

// Onaysız ziyaretçiler her sayfa açılışında yeni "anon-" kimliği alır;
// tekil ziyaretçi / DAU-WAU-MAU sayımlarını şişirmesinler.
const KNOWN_VISITOR = { NOT: { visitorId: { startsWith: "anon-" } } };

export async function GET(req: NextRequest) {
    if (!(await getAdminSession())) {
        return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const range = searchParams.get("range") || "30"; // 7, 30, 90
        const page = searchParams.get("page") || undefined;
        const eventType = searchParams.get("eventType") || undefined;

        const days = Math.min(Number(range) || 30, 365);
        const from = startOfDay(subDays(new Date(), days));
        const to = endOfDay(new Date());

        const baseWhere: any = {
            createdAt: { gte: from, lte: to },
            ...(page ? { page } : {}),
            ...(eventType ? { eventType } : {}),
        };

        const sessionWhere: any = {
            startedAt: { gte: from, lte: to },
        };

        // ── KPIs ──────────────────────────────────
        const [
            totalPageViews,
            totalEvents,
            uniqueVisitorIds,
            sessions,
            flaggedEventsCount,
        ] = await Promise.all([
            prisma.analyticsEvent.count({ where: { ...baseWhere, eventType: "page_view" } }),
            prisma.analyticsEvent.count({ where: baseWhere }),
            prisma.analyticsEvent.groupBy({
                by: ["visitorId"],
                where: { ...KNOWN_VISITOR, ...baseWhere, eventType: "page_view" },
                _count: { visitorId: true },
            }),
            prisma.analyticsSession.findMany({
                where: sessionWhere,
                select: { duration: true, bounced: true, isNewVisitor: true, pageCount: true },
            }),
            prisma.analyticsEvent.count({ where: { ...baseWhere, flagged: true } }),
        ]);

        const uniqueVisitors = uniqueVisitorIds.length;
        const totalSessions = sessions.length;
        const avgDuration = totalSessions > 0
            ? Math.round(sessions.reduce((a, s) => a + s.duration, 0) / totalSessions)
            : 0;
        const bounceRate = totalSessions > 0
            ? Math.round((sessions.filter(s => s.bounced).length / totalSessions) * 100)
            : 0;
        const newVisitors = sessions.filter(s => s.isNewVisitor).length;
        const returningVisitors = totalSessions - newVisitors;

        // ── DAU / WAU / MAU ─────────────────────────
        const now = new Date();
        const [dauResult, wauResult, mauResult] = await Promise.all([
            prisma.analyticsEvent.groupBy({
                by: ["visitorId"],
                where: { ...KNOWN_VISITOR, eventType: "page_view", createdAt: { gte: startOfDay(now) } },
                _count: { visitorId: true },
            }),
            prisma.analyticsEvent.groupBy({
                by: ["visitorId"],
                where: { ...KNOWN_VISITOR, eventType: "page_view", createdAt: { gte: subDays(now, 7) } },
                _count: { visitorId: true },
            }),
            prisma.analyticsEvent.groupBy({
                by: ["visitorId"],
                where: { ...KNOWN_VISITOR, eventType: "page_view", createdAt: { gte: subDays(now, 30) } },
                _count: { visitorId: true },
            }),
        ]);

        // ── Daily Chart ─────────────────────────────
        const chartData = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = subDays(new Date(), i);
            const dayStart = startOfDay(d);
            const dayEnd = endOfDay(d);

            const [pvCount, uvResult] = await Promise.all([
                prisma.analyticsEvent.count({
                    where: { eventType: "page_view", createdAt: { gte: dayStart, lte: dayEnd } },
                }),
                prisma.analyticsEvent.groupBy({
                    by: ["visitorId"],
                    where: { ...KNOWN_VISITOR, eventType: "page_view", createdAt: { gte: dayStart, lte: dayEnd } },
                    _count: { visitorId: true },
                }),
            ]);

            chartData.push({
                date: format(d, "d MMM"),
                fullDate: format(d, "yyyy-MM-dd"),
                pageViews: pvCount,
                uniqueVisitors: uvResult.length,
            });
        }

        // ── Top Pages ────────────────────────────────
        const topPages = await prisma.analyticsEvent.groupBy({
            by: ["page"],
            where: { ...baseWhere, eventType: "page_view" },
            _count: { page: true },
            orderBy: { _count: { page: "desc" } },
            take: 10,
        });

        // ── Device Distribution ─────────────────────
        const devices = await prisma.analyticsSession.groupBy({
            by: ["deviceType"],
            where: { ...sessionWhere, deviceType: { not: null } },
            _count: { deviceType: true },
        });

        // ── Browser Distribution ────────────────────
        const browsers = await prisma.analyticsSession.groupBy({
            by: ["browser"],
            where: { ...sessionWhere, browser: { not: null } },
            _count: { browser: true },
        });

        // ── Top Referrers ───────────────────────────
        const referrers = await prisma.analyticsEvent.groupBy({
            by: ["referrer"],
            where: {
                ...baseWhere,
                eventType: "page_view",
                NOT: [
                    { referrer: null },
                    { referrer: "" },
                ],
            },
            _count: { referrer: true },
            orderBy: { _count: { referrer: "desc" } },
            take: 10,
        });

        // ── Sparklines (Daily trend for each KPI) ──
        const sparklines: any = {
            pageViews: chartData.map(d => d.pageViews),
            uniqueVisitors: chartData.map(d => d.uniqueVisitors),
            sessions: [], // Populate below
            duration: [],
            bounceRate: [],
        };

        // ── Advanced Stats (Populate Sparklines & Distribution) ──
        const durationBuckets = [
            { name: "0-30s", count: 0, range: [0, 30] },
            { name: "30s-2m", count: 0, range: [31, 120] },
            { name: "2m-10m", count: 0, range: [121, 600] },
            { name: "10m+", count: 0, range: [601, 36000] },
        ];

        sessions.forEach(s => {
            if (s.duration <= 30) durationBuckets[0].count++;
            else if (s.duration <= 120) durationBuckets[1].count++;
            else if (s.duration <= 600) durationBuckets[2].count++;
            else durationBuckets[3].count++;
        });

        // ── Popular Elements from Metadata ──
        const clickEvents = await prisma.analyticsEvent.findMany({
            where: { ...baseWhere, eventType: "click", metadata: { not: null } },
            select: { metadata: true },
            take: 100,
        });

        const elementCounts: Record<string, number> = {};
        clickEvents.forEach(e => {
            try {
                const meta = JSON.parse(e.metadata || "{}");
                const id = meta.id || meta.text || "Bilinmiyor";
                if (id) elementCounts[id] = (elementCounts[id] || 0) + 1;
            } catch { /* */ }
        });
        const popularElements = Object.entries(elementCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return NextResponse.json({
            kpis: {
                totalPageViews,
                uniqueVisitors,
                totalEvents,
                totalSessions,
                avgDuration,
                bounceRate,
                newVisitors,
                returningVisitors,
                flaggedEvents: flaggedEventsCount,
                dau: dauResult.length,
                wau: wauResult.length,
                mau: mauResult.length,
            },
            sparklines,
            chartData,
            durationDistribution: durationBuckets,
            popularElements,
            topPages: topPages.map(p => ({ page: p.page, count: p._count.page })),
            devices: devices.map(d => ({ name: d.deviceType || "unknown", count: d._count.deviceType })),
            browsers: browsers.map(b => ({ name: b.browser || "unknown", count: b._count.browser })),
            referrers: referrers.map(r => {
                let domain = r.referrer || "Bilinmiyor";
                try { if (r.referrer) domain = new URL(r.referrer).hostname; } catch { /* */ }
                return { name: domain, url: r.referrer, count: r._count.referrer };
            }),
            newVsReturning: { new: newVisitors, returning: returningVisitors },
        });
    } catch (error) {
        console.error("Dashboard API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
