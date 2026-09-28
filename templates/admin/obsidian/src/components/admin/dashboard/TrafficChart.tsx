"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Segmented } from "../ui/Segmented";
import { AnimatedNumber } from "../ui/AnimatedNumber";

export type TrafficPoint = { key: string; label: string; pageViews: number; uniqueVisitors: number };

type Range = "7" | "14" | "30";

const SERIES = [
    { key: "pageViews", name: "Sayfa görüntüleme", cssVar: "--chart-1" },
    { key: "uniqueVisitors", name: "Tekil ziyaretçi", cssVar: "--chart-2" },
] as const;

/** Grafik renkleri CSS jetonlarından okunur; tema değişince yeniden okunur. */
function useChartColors() {
    const { resolvedTheme } = useTheme();
    const [colors, setColors] = useState({ s1: "#6366f1", s2: "#14b8a6", grid: "rgba(20,20,45,0.07)", axis: "#8b8b97", cursor: "rgba(20,20,45,0.18)", surface: "#ffffff" });

    useEffect(() => {
        const read = () => {
            const css = getComputedStyle(document.documentElement);
            const get = (name: string) => css.getPropertyValue(name).trim();
            setColors({
                s1: get("--chart-1"),
                s2: get("--chart-2"),
                grid: get("--chart-grid"),
                axis: get("--chart-axis"),
                cursor: get("--chart-cursor"),
                surface: get("--adm-surface"),
            });
        };
        // next-themes sınıfı uyguladıktan sonra oku
        const raf = requestAnimationFrame(read);
        return () => cancelAnimationFrame(raf);
    }, [resolvedTheme]);

    return colors;
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; value: number; color: string }[]; label?: string }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="adm-elevated min-w-[11rem] rounded-xl px-3.5 py-3 text-xs">
            <p className="mb-2 font-semibold adm-text">{label}</p>
            <div className="space-y-1.5">
                {SERIES.map((series) => {
                    const item = payload.find((p) => p.dataKey === series.key);
                    if (!item) return null;
                    return (
                        <div key={series.key} className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-2 adm-text-2">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                                {series.name}
                            </span>
                            <span className="font-semibold tabular-nums adm-text">{item.value.toLocaleString("tr-TR")}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/** Son 7/14/30 günün ziyaret grafiği; seriler tek eksende, üstte seçici ve toplamlar. */
export function TrafficChart({ data }: { data: TrafficPoint[] }) {
    const [range, setRange] = useState<Range>("14");
    const colors = useChartColors();
    const visible = useMemo(() => data.slice(-Number(range)), [data, range]);
    const totals = useMemo(
        () => ({
            pageViews: visible.reduce((s, d) => s + d.pageViews, 0),
            uniqueVisitors: visible.reduce((s, d) => s + d.uniqueVisitors, 0),
        }),
        [visible],
    );
    const seriesColor = { pageViews: colors.s1, uniqueVisitors: colors.s2 };

    return (
        <div>
            <div className="flex flex-wrap items-end justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
                <div>
                    <h2 className="text-[0.95rem] font-semibold tracking-tight adm-text">Ziyaretçi trafiği</h2>
                    <p className="mt-0.5 text-xs adm-text-3">Son {range} gün · günlük</p>
                </div>
                <Segmented
                    ariaLabel="Zaman aralığı"
                    value={range}
                    onChange={setRange}
                    items={[
                        { value: "7", label: "7G" },
                        { value: "14", label: "14G" },
                        { value: "30", label: "30G" },
                    ]}
                />
            </div>

            {/* Gösterge + toplamlar (değerler her zaman görünür metin olarak da okunur) */}
            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 px-5 sm:px-6">
                {SERIES.map((series) => (
                    <div key={series.key}>
                        <p className="flex items-center gap-2 text-xs adm-text-2">
                            <span className="h-[3px] w-3.5 rounded-full" style={{ backgroundColor: seriesColor[series.key] }} />
                            {series.name}
                        </p>
                        <p className="mt-1 text-2xl font-semibold tracking-tight adm-text">
                            <AnimatedNumber value={totals[series.key]} />
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-2 h-[260px] w-full px-2 pb-3 sm:h-[300px] sm:px-3">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={visible} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                        <CartesianGrid vertical={false} stroke={colors.grid} strokeWidth={1} />
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: colors.axis, fontSize: 11 }}
                            tickMargin={10}
                            minTickGap={24}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: colors.axis, fontSize: 11 }}
                            tickFormatter={(v: number) => v.toLocaleString("tr-TR")}
                            width={44}
                            allowDecimals={false}
                        />
                        <Tooltip content={<ChartTooltip />} cursor={{ stroke: colors.cursor, strokeWidth: 1 }} />
                        {SERIES.map((series) => (
                            <Area
                                key={series.key}
                                type="monotone"
                                dataKey={series.key}
                                name={series.name}
                                stroke={seriesColor[series.key]}
                                strokeWidth={2}
                                fill={seriesColor[series.key]}
                                fillOpacity={0.1}
                                dot={false}
                                activeDot={{ r: 4.5, strokeWidth: 2, stroke: colors.surface, fill: seriesColor[series.key] }}
                                animationDuration={900}
                                animationEasing="ease-out"
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
