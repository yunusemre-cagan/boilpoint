"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Eye, Users, Clock, TrendingDown, Activity, UserPlus, UserCheck,
    Calendar, Filter, Loader2, Globe, Flag, ArrowRight, MousePointer,
    BarChart3, PieChart as PieIcon, LayoutDashboard, Share2
} from "lucide-react";
import { 
    VisitorAreaChart, TopPagesBarChart, DistributionPieChart, 
    Sparkline, SessionDurationHistogram 
} from "./AnalyticsCharts";
import Link from "next/link";
import { PageHeader } from "../ui/PageHeader";
import { Segmented } from "../ui/Segmented";

// ─── Types ──────────────────────────────────
interface DashboardData {
    kpis: {
        totalPageViews: number;
        uniqueVisitors: number;
        totalEvents: number;
        totalSessions: number;
        avgDuration: number;
        bounceRate: number;
        newVisitors: number;
        returningVisitors: number;
        flaggedEvents: number;
        dau: number;
        wau: number;
        mau: number;
    };
    sparklines: {
        pageViews: number[];
        uniqueVisitors: number[];
    };
    chartData: { date: string; pageViews: number; uniqueVisitors: number }[];
    topPages: { page: string; count: number }[];
    devices: { name: string; count: number }[];
    browsers: { name: string; count: number }[];
    referrers: { name: string; url: string; count: number }[];
    durationDistribution: { name: string; count: number }[];
    popularElements: { name: string; count: number }[];
    newVsReturning: { new: number; returning: number };
}

const RANGE_OPTIONS = [
    { label: "7 Gün", value: "7" },
    { label: "30 Gün", value: "30" },
    { label: "90 Gün", value: "90" },
];

function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}dk ${sec}s`;
}

// ─── Main Dashboard ─────────────────────────
export function AnalyticsDashboardClient() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState("30");
    const [eventTypeFilter, setEventTypeFilter] = useState("");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ range });
            if (eventTypeFilter) params.set("eventType", eventTypeFilter);
            const res = await fetch(`/api/analytics/dashboard?${params}`);
            
            if (!res.ok) throw new Error(`API error: ${res.status}`);
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            setData(json);
        } catch (err) {
            console.error("Failed to load dashboard data:", err);
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [range, eventTypeFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading && !data) {
        return (
            <div className="space-y-6" aria-busy="true" aria-label="Veriler hazırlanıyor">
                <div className="flex items-center gap-4">
                    <span className="adm-skeleton h-11 w-11 rounded-[0.9rem]" />
                    <div className="space-y-2">
                        <span className="adm-skeleton h-6 w-44" />
                        <span className="adm-skeleton h-4 w-72 max-w-[60vw]" />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="adm-card space-y-4 p-5">
                            <span className="adm-skeleton h-9 w-9 rounded-xl" />
                            <span className="adm-skeleton h-7 w-24" />
                        </div>
                    ))}
                </div>
                <div className="adm-card p-6">
                    <span className="adm-skeleton h-[300px] w-full rounded-xl" />
                </div>
            </div>
        );
    }

    if (!data || !data.kpis) {
        return (
            <div className="text-center py-32 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Veri yüklenemedi veya henüz istatistik oluşmadı.</p>
                <button 
                  onClick={() => fetchData()}
                  className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform"
                >
                  Tekrar Dene
                </button>
            </div>
        );
    }

    const { kpis, sparklines, chartData, topPages, devices, browsers, referrers, durationDistribution, popularElements, newVsReturning } = data;

    return (
        <div className="space-y-8 pb-20">
            {/* ── Başlık ve filtreler ─────────────── */}
            <PageHeader
                icon={BarChart3}
                title="İstatistikler"
                description="Ziyaretçi davranışlarını, oturumları ve popüler içerikleri ayrıntılı takip et."
                actions={
                    <>
                        <Segmented
                            ariaLabel="Zaman aralığı"
                            value={range}
                            onChange={setRange}
                            items={RANGE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                        />
                        <QuickLink href="/admin/analytics/flow" icon={Share2} label="Akış" />
                        <QuickLink href="/admin/analytics/heatmap" icon={MousePointer} label="Heatmap" />
                        <QuickLink href="/admin/analytics/events" icon={Flag} label="Eventler" />
                    </>
                }
            />

            {/* ── KPI Bento Grid ───────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard 
                    icon={Eye} 
                    label="Sayfa Görüntüleme" 
                    value={kpis.totalPageViews} 
                    color="#6366f1" 
                    sparkline={sparklines.pageViews}
                    className="md:col-span-2 lg:col-span-1"
                />
                <KpiCard 
                    icon={Users} 
                    label="Tekil Ziyaretçi" 
                    value={kpis.uniqueVisitors} 
                    color="#10b981" 
                    sparkline={sparklines.uniqueVisitors}
                />
                <KpiCard 
                    icon={Clock} 
                    label="Ort. Süre" 
                    value={formatDuration(kpis.avgDuration)} 
                    color="#f59e0b" 
                />
                <KpiCard 
                    icon={TrendingDown} 
                    label="Hemen Çıkma" 
                    value={`%${kpis.bounceRate}`} 
                    color="#ef4444" 
                />
            </div>

            {/* ── Main Data Row ────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trend Chart (Large) */}
                <div className="lg:col-span-2 adm-card adm-enter relative overflow-hidden p-6 group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4">
                        <Activity className="w-32 h-32" />
                    </div>
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold tracking-tight">Ziyaretçi Trendi</h3>
                                <p className="text-xs adm-text-3 font-medium uppercase tracking-widest">Görüntüleme & Tekil Ziyaret</p>
                            </div>
                        </div>
                        {loading && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
                    </div>
                    <VisitorAreaChart data={chartData} />
                </div>

                {/* Popular Elements & Sources */}
                <div className="space-y-6">
                    {/* Traffic Sources */}
                    <div className="adm-card adm-enter p-6">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] adm-text-3 mb-6 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-emerald-500" /> Trafik Kaynakları
                        </h3>
                        <div className="space-y-4">
                            {referrers.slice(0, 5).map((ref, i) => (
                                <div key={i} className="flex items-center justify-between group/item">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[var(--adm-surface-3)] flex items-center justify-center text-[10px] font-bold text-gray-400 group-hover/item:text-emerald-500 transition-colors">
                                            {i + 1}
                                        </div>
                                        <span className="text-sm font-bold truncate max-w-[120px]">{ref.name}</span>
                                    </div>
                                    <span className="text-xs font-semibold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-lg">{ref.count}</span>
                                </div>
                            ))}
                            {referrers.length === 0 && <EmptyState text="Kaynak bulunamadı" />}
                        </div>
                    </div>

                    {/* Popular Clicks */}
                    <div className="adm-card adm-enter p-6">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] adm-text-3 mb-6 flex items-center gap-2">
                            <MousePointer className="w-4 h-4 text-indigo-500" /> Popüler Tıklamalar
                        </h3>
                        <div className="space-y-4">
                            {popularElements.map((el, i) => (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-semibold uppercase">
                                        <span className="truncate max-w-[150px]">{el.name}</span>
                                        <span>{el.count}</span>
                                    </div>
                                    <div className="w-full h-1 bg-[var(--adm-surface-3)] rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                                            style={{ width: `${(el.count / popularElements[0].count) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {popularElements.length === 0 && <EmptyState text="Tıklama verisi yok" />}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Secondary Data Row ─────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Popular Pages */}
                <div className="adm-card adm-enter p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-violet-500/10 text-violet-500 rounded-2xl">
                            <Eye className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-semibold tracking-tight">En Popüler Sayfalar</h3>
                    </div>
                    <TopPagesBarChart data={topPages} />
                </div>

                {/* Session Duration */}
                <div className="adm-card adm-enter p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                            <Clock className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-semibold tracking-tight">Oturum Süreleri</h3>
                    </div>
                    <SessionDurationHistogram data={durationDistribution} />
                </div>
            </div>

            
            {/* ── Distribution Row ───────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DistributionCard title="Cihaz Dağılımı" data={devices} icon={Activity} />
                <DistributionCard title="Tarayıcılar" data={browsers} icon={Globe} />
                <DistributionCard 
                    title="Yeni vs Geri Dönen" 
                    data={[
                        { name: "Yeni", count: newVsReturning.new },
                        { name: "Geri Dönen", count: newVsReturning.returning }
                    ]} 
                    icon={Users}
                />
            </div>
        </div>
    );
}

// ─── Sub-Components ──────────────────────────

function KpiCard({ icon: Icon, label, value, color, sparkline, className = "" }: any) {
    return (
        <div className={`adm-card adm-card-interactive adm-enter relative group overflow-hidden p-5 ${className}`}>
            <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-start justify-between">
                    <div className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 group-hover:scale-110 transition-transform duration-500" style={{ color }}>
                        <Icon className="w-5 h-5" />
                    </div>
                    {sparkline && <Sparkline data={sparkline} color={color} />}
                </div>
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest adm-text-3 mb-1">{label}</p>
                    <p className="text-3xl font-semibold tracking-tight adm-text">
                        {typeof value === "number" ? value.toLocaleString("tr-TR") : value}
                    </p>
                </div>
            </div>
        </div>
    );
}

function DistributionCard({ title, data, icon: Icon }: any) {
    return (
        <div className="adm-card adm-enter p-6">
            <div className="flex items-center gap-2 mb-6">
                <Icon className="w-4 h-4 text-indigo-500" />
                <h3 className="text-[10px] font-semibold uppercase tracking-widest">{title}</h3>
            </div>
            {data.length > 0 ? (
                <DistributionPieChart data={data} title="" />
            ) : (
                <EmptyState text="Veri bulunmuyor" />
            )}
        </div>
    );
}

function QuickLink({ href, icon: Icon, label }: any) {
    return (
        <Link href={href} className="adm-btn adm-btn-secondary adm-nudge">
            <Icon className="adm-nudge-up text-[var(--adm-accent)]" /> {label}
        </Link>
    );
}

function EmptyState({ text }: { text: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <Activity className="w-6 h-6 mb-2 opacity-20" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{text}</span>
        </div>
    );
}

