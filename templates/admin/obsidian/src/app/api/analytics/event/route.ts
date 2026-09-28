import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { anonymizeIp, getClientIp, rateLimit } from "@/lib/rateLimit";

const EVENT_TYPE_RE = /^[a-z0-9_]{1,40}$/;
const ID_RE = /^[A-Za-z0-9-]{8,64}$/;

/** Metni kırpar; string değilse null döner. */
function str(value: unknown, max: number): string | null {
    return typeof value === "string" && value.length > 0 ? value.slice(0, max) : null;
}

/**
 * Tarayıcıdan gelen ham olayı doğrular ve alan uzunluklarını sınırlar.
 * Geçersizse null döner (sessizce atlanır).
 */
function sanitizeEvent(raw: unknown) {
    if (!raw || typeof raw !== "object") return null;
    const e = raw as Record<string, unknown>;

    const eventType = typeof e.eventType === "string" && EVENT_TYPE_RE.test(e.eventType) ? e.eventType : null;
    const visitorId = typeof e.visitorId === "string" && ID_RE.test(e.visitorId) ? e.visitorId : null;
    const sessionId = typeof e.sessionId === "string" && ID_RE.test(e.sessionId) ? e.sessionId : null;
    const page = typeof e.page === "string" && e.page.startsWith("/") ? e.page.slice(0, 300) : null;
    if (!eventType || !visitorId || !sessionId || !page) return null;

    const metadataRaw = typeof e.metadata === "string" ? e.metadata : (e.metadata ? JSON.stringify(e.metadata) : null);
    // Aşırı büyük metadata'yı hiç saklama (kesilmiş JSON parse edilemez)
    const metadata = metadataRaw && metadataRaw.length <= 2000 ? metadataRaw : null;

    return {
        eventType,
        visitorId,
        sessionId,
        page,
        referrer: str(e.referrer, 500),
        userAgent: str(e.userAgent, 400),
        metadata,
        deviceType: str(e.deviceType, 20),
        browser: str(e.browser, 40),
        flagged: e.flagged === true,
        flagLabel: str(e.flagLabel, 100),
    };
}

export async function POST(req: Request) {
    const ip = getClientIp(req);

    // Normal istemci ~5 sn'de bir toplu gönderir; dakikada 60 istek fazlasıyla yeterli
    const limit = rateLimit(`analytics-event:${ip}`, { limit: 60, windowMs: 60_000 });
    if (!limit.success) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    try {
        const body = await req.json();
        const events = body?.events;

        if (!Array.isArray(events) || events.length === 0) {
            return NextResponse.json({ error: "No events provided" }, { status: 400 });
        }

        // Cap at 50 events per request to prevent abuse
        const batch = events
            .slice(0, 50)
            .map(sanitizeEvent)
            .filter((e): e is NonNullable<ReturnType<typeof sanitizeEvent>> => e !== null);
        const ipAddress = anonymizeIp(ip);

        // Separate session_end events from regular events
        const regularEvents: typeof batch = [];
        const sessionEndEvents: typeof batch = [];

        for (const event of batch) {
            if (event.eventType === "session_end") {
                sessionEndEvents.push(event);
            } else {
                regularEvents.push(event);
            }
        }

        // Insert regular events in bulk
        if (regularEvents.length > 0) {
            await prisma.analyticsEvent.createMany({
                data: regularEvents.map((e: any) => ({
                    eventType: e.eventType,
                    visitorId: e.visitorId,
                    sessionId: e.sessionId,
                    page: e.page,
                    referrer: e.referrer || null,
                    userAgent: e.userAgent || null,
                    metadata: typeof e.metadata === "string" ? e.metadata : (e.metadata ? JSON.stringify(e.metadata) : null),
                    deviceType: e.deviceType || null,
                    browser: e.browser || null,
                    flagged: e.flagged === true,
                    flagLabel: e.flagLabel || null,
                    ipAddress,
                })),
            });
        }

        // Process session_end events → create/update AnalyticsSession
        for (const se of sessionEndEvents) {
            // Also save the event itself
            await prisma.analyticsEvent.create({
                data: {
                    eventType: "session_end",
                    visitorId: se.visitorId,
                    sessionId: se.sessionId,
                    page: se.page,
                    referrer: se.referrer || null,
                    userAgent: se.userAgent || null,
                    metadata: typeof se.metadata === "string" ? se.metadata : (se.metadata ? JSON.stringify(se.metadata) : null),
                    deviceType: se.deviceType || null,
                    browser: se.browser || null,
                    flagged: se.flagged === true,
                    flagLabel: se.flagLabel || null,
                    ipAddress,
                },
            });

            // Parse session metadata
            let meta: any = {};
            try {
                meta = typeof se.metadata === "string" ? JSON.parse(se.metadata) : (se.metadata || {});
            } catch { /* ignore parse errors */ }

            // Sahte/uç değerler Int sütununu taşırmasın: en fazla 24 saat, 1000 sayfa
            const duration = Math.min(Math.max(Math.round(Number(meta.duration) || 0), 0), 86_400);
            const pageCount = Math.min(Math.max(Math.round(Number(meta.pageCount) || 1), 1), 1000);
            const bounced = meta.bounced === true || pageCount <= 1;
            const entryPage = typeof meta.entryPage === "string" ? meta.entryPage.slice(0, 300) : se.page;
            const exitPage = typeof meta.exitPage === "string" ? meta.exitPage.slice(0, 300) : se.page;
            const isNewVisitor = meta.isNewVisitor === true;

            await prisma.analyticsSession.upsert({
                where: { sessionId: se.sessionId },
                update: {
                    endedAt: new Date(),
                    duration,
                    bounced,
                    exitPage,
                    pageCount,
                },
                create: {
                    visitorId: se.visitorId,
                    sessionId: se.sessionId,
                    startedAt: new Date(Date.now() - duration * 1000),
                    endedAt: new Date(),
                    duration,
                    bounced,
                    entryPage,
                    exitPage,
                    pageCount,
                    deviceType: se.deviceType || null,
                    browser: se.browser || null,
                    referrer: se.referrer || null,
                    isNewVisitor,
                },
            });
        }

        // Also update legacy VisitorStats + PageView for backward compat
        const pageViewEvents = batch.filter((e: any) => e.eventType === "page_view");
        if (pageViewEvents.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Count unique visitors in this batch
            const uniqueVisitors = new Set(pageViewEvents.map((e: any) => e.visitorId));
            const hasNewVisitor = pageViewEvents.some((e: any) => {
                try {
                    const m = typeof e.metadata === "string" ? JSON.parse(e.metadata) : e.metadata;
                    return m?.isNewVisitor === true;
                } catch { return false; }
            });

            await prisma.visitorStats.upsert({
                where: { date: today },
                update: {
                    pageViews: { increment: pageViewEvents.length },
                    uniqueVisitors: hasNewVisitor ? { increment: uniqueVisitors.size } : undefined,
                    totalVisitors: hasNewVisitor ? { increment: uniqueVisitors.size } : undefined,
                },
                create: {
                    date: today,
                    pageViews: pageViewEvents.length,
                    uniqueVisitors: hasNewVisitor ? uniqueVisitors.size : 0,
                    totalVisitors: hasNewVisitor ? uniqueVisitors.size : 0,
                },
            });

            // Create PageView records for legacy compat
            await prisma.pageView.createMany({
                data: pageViewEvents.map((e: any) => ({
                    path: e.page,
                    referrer: e.referrer || null,
                    userAgent: e.userAgent || null,
                    ipAddress,
                })),
            });
        }

        return NextResponse.json({ success: true, count: batch.length });
    } catch (error) {
        console.error("Analytics event error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
