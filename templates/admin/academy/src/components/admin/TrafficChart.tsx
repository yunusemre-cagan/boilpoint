"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TrafficDataPoint {
  date: string;
  views: number;
}

interface TrafficChartProps {
  data: TrafficDataPoint[];
}

export function TrafficChart({ data }: TrafficChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400 font-medium text-sm">
        Henüz yeterli ziyaret verisi yok.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
        <defs>
          <linearGradient id="colorViewsIndigo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="currentColor"
          className="text-slate-200/80 dark:text-slate-800/80"
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#0f172a",
            borderRadius: "12px",
            border: "1px solid #334155",
            color: "#f8fafc",
            fontSize: "12px",
          }}
          labelStyle={{ fontWeight: "bold", color: "#a5b4fc" }}
        />
        <Area
          type="monotone"
          dataKey="views"
          stroke="#6366f1"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorViewsIndigo)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
