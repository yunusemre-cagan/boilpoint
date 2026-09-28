"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, ArrowLeft, Flag, Filter, Calendar } from "lucide-react";
import Link from "next/link";

interface FlaggedEvent {
    id: string;
    eventType: string;
    visitorId: string;
    page: string;
    flagLabel: string | null;
    metadata: string | null;
    createdAt: string;
    browser: string | null;
    deviceType: string | null;
}

export default function EventsPage() {
    const [events, setEvents] = useState<FlaggedEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState("30");
    const [eventTypeFilter, setEventTypeFilter] = useState("");
    const [pageFilter, setPageFilter] = useState("");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ range });
            if (eventTypeFilter) params.set("eventType", eventTypeFilter);
            if (pageFilter) params.set("page", pageFilter);

            const res = await fetch(`/api/analytics/events?${params}`);
            const json = await res.json();
            setEvents(json.events || []);
        } catch {
            console.error("Failed to load events");
        } finally {
            setLoading(false);
        }
    }, [range, eventTypeFilter, pageFilter]);

    useEffect(() => { fetchData(); }, [fetchData]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/admin/analytics" className="adm-btn adm-btn-secondary adm-btn-icon group">
                        <ArrowLeft className="w-4 h-4 adm-text-2" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight adm-text sm:text-[1.7rem]">Önemli Eventler</h1>
                        <p className="text-sm adm-text-3">Bayraklı (flagged) eventlerin detaylı listesi.</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={range}
                        onChange={e => setRange(e.target.value)}
                        className="adm-input w-auto"
                    >
                        <option value="7">7 Gün</option>
                        <option value="30">30 Gün</option>
                        <option value="90">90 Gün</option>
                    </select>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                            type="text"
                            value={eventTypeFilter}
                            onChange={e => setEventTypeFilter(e.target.value)}
                            placeholder="Event tipi..."
                            className="pl-8 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 w-36"
                        />
                    </div>
                    <input
                        type="text"
                        value={pageFilter}
                        onChange={e => setPageFilter(e.target.value)}
                        placeholder="Sayfa filtresi..."
                        className="adm-input w-auto w-40"
                    />
                </div>
            </div>

            {loading && events.length === 0 ? (
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : events.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 border border-[var(--adm-border)] rounded-2xl p-12 shadow-sm text-center">
                    <Flag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="adm-text-3">Henüz önemli event bulunmuyor.</p>
                    <p className="text-xs text-gray-400 mt-2">
                        HTML elementlerine <code className="bg-[var(--adm-surface-3)] px-1.5 py-0.5 rounded text-xs">data-track-flag=&quot;label&quot;</code> attribute&apos;u ekleyin.
                    </p>
                </div>
            ) : (
                <div className="adm-card adm-enter overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[var(--adm-border)]">
                                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase adm-text-3 tracking-wide">Flag</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase adm-text-3 tracking-wide">Event Tipi</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase adm-text-3 tracking-wide">Sayfa</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase adm-text-3 tracking-wide">Ziyaretçi</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase adm-text-3 tracking-wide">Cihaz</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase adm-text-3 tracking-wide">Tarih</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase adm-text-3 tracking-wide">Metadata</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map(event => {
                                    let meta: any = {};
                                    try { meta = JSON.parse(event.metadata || "{}"); } catch { /* */ }

                                    return (
                                        <tr key={event.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                            <td className="px-6 py-3">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-semibold">
                                                    <Flag className="w-3 h-3" />
                                                    {event.flagLabel || "—"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="text-gray-700 dark:text-gray-300 bg-[var(--adm-surface-3)] px-2 py-0.5 rounded text-xs font-mono">{event.eventType}</span>
                                            </td>
                                            <td className="px-6 py-3 text-gray-600 dark:text-gray-400 truncate max-w-[160px]" title={event.page}>
                                                {event.page}
                                            </td>
                                            <td className="px-6 py-3 text-gray-500 font-mono text-xs truncate max-w-[100px]" title={event.visitorId}>
                                                {event.visitorId.slice(0, 8)}...
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="text-xs text-gray-500">{event.deviceType || "—"}</span>
                                                {event.browser && (
                                                    <span className="text-xs text-gray-400 ml-1.5">({event.browser})</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-3 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(event.createdAt).toLocaleString("tr-TR", {
                                                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                {Object.keys(meta).length > 0 && (
                                                    <details className="text-xs">
                                                        <summary className="cursor-pointer text-indigo-500 hover:text-indigo-600 font-medium">Detay</summary>
                                                        <pre className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-[10px] text-gray-600 dark:text-gray-400 overflow-x-auto max-w-[200px]">
                                                            {JSON.stringify(meta, null, 2)}
                                                        </pre>
                                                    </details>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
