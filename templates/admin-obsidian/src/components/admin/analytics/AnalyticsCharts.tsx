"use client";

import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ─── Colors ──────────────────────────────────
const COLORS = [
    "#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
    "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#06b6d4"
];

// ─── Sparkline (Small Line Chart for KPI Cards) ────
export function Sparkline({ data, color }: { data: number[]; color: string }) {
    const chartData = data.map((v, i) => ({ value: v, id: i }));
    return (
        <div className="h-8 w-16">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        fill={color}
                        fillOpacity={0.1}
                        strokeWidth={1.5}
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

// ─── Session Duration Histogram ────────────────────
export function SessionDurationHistogram({ data }: { data: { name: string; count: number }[] }) {
    return (
        <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(17, 24, 39, 0.95)",
                            borderRadius: "12px",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "#fff",
                        }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

// ─── Area Chart (Daily Visitors) ──────────────
export function VisitorAreaChart({ data }: { data: any[] }) {
    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="gradViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradVisitors" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} dx={-10} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(17, 24, 39, 0.95)",
                            borderRadius: "12px",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "#fff",
                            boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                        }}
                        labelStyle={{ color: "#e5e7eb", fontWeight: "bold", marginBottom: "4px" }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Area type="monotone" dataKey="pageViews" name="Sayfa Görüntüleme" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#gradViews)" animationDuration={1000} />
                    <Area type="monotone" dataKey="uniqueVisitors" name="Tekil Ziyaretçi" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#gradVisitors)" animationDuration={1000} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

// ─── Bar Chart (Top Pages) ───────────────────
export function TopPagesBarChart({ data }: { data: { page: string; count: number }[] }) {
    const chartData = data.map(d => ({
        page: d.page === "/" ? "Ana Sayfa" : d.page.length > 25 ? d.page.slice(0, 22) + "..." : d.page,
        fullPage: d.page,
        count: d.count,
    }));

    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <YAxis type="category" dataKey="page" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} width={80} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "rgba(17, 24, 39, 0.95)",
                            borderRadius: "12px",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "#fff",
                        }}
                        formatter={((value: any) => [value ?? 0, "Görüntüleme"]) as any}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={20} animationDuration={1000} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

// ─── Pie Chart ───────────────────────────────
export function DistributionPieChart({
    data,
    title,
}: {
    data: { name: string; count: number }[];
    title: string;
}) {
    const total = data.reduce((a, d) => a + d.count, 0);

    return (
        <div>
            <h3 className="text-sm font-semibold adm-text-3 uppercase tracking-wide mb-4">{title}</h3>
            <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="count"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            strokeWidth={0}
                            animationDuration={1000}
                        >
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(17, 24, 39, 0.95)",
                                borderRadius: "12px",
                                border: "1px solid rgba(255,255,255,0.1)",
                                color: "#fff",
                            }}
                            formatter={((value: any, name: any) => [
                                `${value ?? 0} (${total > 0 ? Math.round((Number(value ?? 0) / total) * 100) : 0}%)`,
                                name,
                            ]) as any}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 justify-center">
                {data.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span>{d.name}</span>
                        <span className="font-bold adm-text">{total > 0 ? Math.round((d.count / total) * 100) : 0}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
