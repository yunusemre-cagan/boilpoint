"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, ArrowLeft, ArrowRight, LogIn, LogOut as LogOutIcon } from "lucide-react";
import Link from "next/link";

interface FlowData {
    flows: { from: string; to: string; count: number }[];
    entryPages: { page: string; count: number }[];
    exitPages: { page: string; count: number }[];
}

const RANGE_OPTIONS = [
    { label: "7 Gün", value: "7" },
    { label: "30 Gün", value: "30" },
    { label: "90 Gün", value: "90" },
];

export default function FlowPage() {
    const [data, setData] = useState<FlowData | null>(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState("30");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/analytics/flow?range=${range}`);
            const json = await res.json();
            setData(json);
        } catch {
            console.error("Failed to load flow data");
        } finally {
            setLoading(false);
        }
    }, [range]);

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
                        <h1 className="text-2xl font-semibold tracking-tight adm-text sm:text-[1.7rem]">Kullanıcı Akışı</h1>
                        <p className="text-sm adm-text-3">Hangi sayfadan hangi sayfaya geçildiğini görün.</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 adm-seg">
                    {RANGE_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setRange(opt.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                range === opt.value
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading && !data ? (
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : data ? (
                <>
                    {/* Flow transitions */}
                    <div className="adm-card adm-enter p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-lg">
                                <ArrowRight className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-bold adm-text">Sayfa Geçişleri</h2>
                        </div>
                        {data.flows.length > 0 ? (
                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                                {data.flows.map((flow, idx) => (
                                    <div key={idx} className="flex items-center gap-3 py-3 px-4 bg-[var(--adm-surface-2)] rounded-xl group hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors">
                                        <span className="text-xs font-mono text-gray-400 w-6">{idx + 1}</span>
                                        <div className="flex-1 flex items-center gap-2 min-w-0">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px] bg-white dark:bg-gray-800 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700" title={flow.from}>
                                                {flow.from === "/" ? "Ana Sayfa" : flow.from}
                                            </span>
                                            <ArrowRight className="w-4 h-4 text-indigo-400 shrink-0" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px] bg-white dark:bg-gray-800 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700" title={flow.to}>
                                                {flow.to === "/" ? "Ana Sayfa" : flow.to}
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2.5 py-0.5 rounded-lg shrink-0">
                                            {flow.count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center py-12 text-gray-400 text-sm">Henüz sayfa geçiş verisi bulunmuyor.</p>
                        )}
                    </div>

                    {/* Entry & Exit Pages */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="adm-card adm-enter p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-lg">
                                    <LogIn className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-bold adm-text">Giriş Sayfaları</h2>
                            </div>
                            <PageList items={data.entryPages} color="emerald" />
                        </div>
                        <div className="adm-card adm-enter p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-lg">
                                    <LogOutIcon className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-bold adm-text">Çıkış Sayfaları</h2>
                            </div>
                            <PageList items={data.exitPages} color="rose" />
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
}

function PageList({ items, color }: { items: { page: string; count: number }[]; color: string }) {
    const colorMap: Record<string, string> = {
        emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
        rose: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20",
    };

    if (items.length === 0) {
        return <p className="text-center py-8 text-gray-400 text-sm">Veri bulunmuyor.</p>;
    }

    return (
        <div className="space-y-3">
            {items.map((item, idx) => {
                const percentage = (item.count / Math.max(items[0]?.count || 1, 1)) * 100;
                return (
                    <div key={idx}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[70%]" title={item.page}>
                                <span className="text-gray-400 font-mono mr-2 text-xs">{idx + 1}.</span>
                                {item.page === "/" ? "Ana Sayfa" : item.page}
                            </span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${colorMap[color]}`}>{item.count}</span>
                        </div>
                        <div className="w-full h-1 bg-[var(--adm-surface-3)] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-700 ${color === "emerald" ? "bg-emerald-500" : "bg-rose-500"}`} style={{ width: `${percentage}%` }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
