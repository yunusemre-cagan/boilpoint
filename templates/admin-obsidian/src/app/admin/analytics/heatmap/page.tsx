"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, ArrowLeft, MousePointer } from "lucide-react";
import Link from "next/link";

interface HeatmapData {
    page: string;
    totalClicks: number;
    points: { x: number; y: number; viewportWidth: number; viewportHeight: number }[];
    availablePages: { page: string; count: number }[];
}

export default function HeatmapPage() {
    const [data, setData] = useState<HeatmapData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedPage, setSelectedPage] = useState("/");
    const [range, setRange] = useState("30");
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: selectedPage, range });
            const res = await fetch(`/api/analytics/heatmap?${params}`);
            const json = await res.json();
            setData(json);
        } catch {
            console.error("Failed to load heatmap data");
        } finally {
            setLoading(false);
        }
    }, [selectedPage, range]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Draw heatmap on canvas
    useEffect(() => {
        if (!data?.points?.length || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Draw background grid
        ctx.strokeStyle = "rgba(99, 102, 241, 0.05)";
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
        }
        for (let y = 0; y < height; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        }

        // Draw click points as heatmap dots
        for (const point of data.points) {
            const px = (point.x / 100) * width;
            const py = (point.y / 100) * height;

            // Create radial gradient for each point
            const gradient = ctx.createRadialGradient(px, py, 0, px, py, 20);
            gradient.addColorStop(0, "rgba(239, 68, 68, 0.6)");
            gradient.addColorStop(0.4, "rgba(249, 115, 22, 0.3)");
            gradient.addColorStop(1, "rgba(249, 115, 22, 0)");

            ctx.beginPath();
            ctx.fillStyle = gradient;
            ctx.arc(px, py, 20, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw center dots for clarity
        for (const point of data.points) {
            const px = (point.x / 100) * width;
            const py = (point.y / 100) * height;
            ctx.beginPath();
            ctx.fillStyle = "rgba(239, 68, 68, 0.8)";
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }, [data]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/admin/analytics" className="adm-btn adm-btn-secondary adm-btn-icon group">
                        <ArrowLeft className="w-4 h-4 adm-text-2" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight adm-text sm:text-[1.7rem]">Tıklama Heatmap</h1>
                        <p className="text-sm adm-text-3">Sayfalar üzerindeki tıklama yoğunluğunu görselleştirin.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedPage}
                        onChange={e => setSelectedPage(e.target.value)}
                        className="adm-input w-auto"
                    >
                        {data?.availablePages?.length ? (
                            data.availablePages.map(p => (
                                <option key={p.page} value={p.page}>
                                    {p.page === "/" ? "Ana Sayfa" : p.page} ({p.count})
                                </option>
                            ))
                        ) : (
                            <option value="/">Ana Sayfa</option>
                        )}
                    </select>
                    <select
                        value={range}
                        onChange={e => setRange(e.target.value)}
                        className="adm-input w-auto"
                    >
                        <option value="7">7 Gün</option>
                        <option value="30">30 Gün</option>
                        <option value="90">90 Gün</option>
                    </select>
                </div>
            </div>

            {loading && !data ? (
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : (
                <>
                    {/* Stats */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 adm-card px-4 py-3">
                            <MousePointer className="w-4 h-4 text-red-500" />
                            <span className="text-sm adm-text-3">Toplam Tıklama:</span>
                            <span className="text-lg font-bold adm-text">{data?.totalClicks?.toLocaleString("tr-TR") || 0}</span>
                        </div>
                        <div className="text-sm text-gray-400">
                            Sayfa: <span className="font-medium text-gray-700 dark:text-gray-300">{selectedPage}</span>
                        </div>
                    </div>

                    {/* Heatmap Canvas */}
                    <div className="adm-card adm-enter p-6">
                        <div className="relative bg-[var(--adm-surface-2)] rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
                            <canvas
                                ref={canvasRef}
                                width={1200}
                                height={675}
                                className="w-full h-full"
                            />
                            {(!data?.points || data.points.length === 0) && (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600">
                                    <div className="text-center">
                                        <MousePointer className="w-12 h-12 mb-3 mx-auto opacity-20" />
                                        <p className="text-sm">Bu sayfa için tıklama verisi bulunmuyor.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 flex items-center justify-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                                <span className="text-xs text-gray-500">Yoğun Tıklama</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-orange-400/40" />
                                <span className="text-xs text-gray-500">Orta Yoğunluk</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-orange-300/20" />
                                <span className="text-xs text-gray-500">Düşük Yoğunluk</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
