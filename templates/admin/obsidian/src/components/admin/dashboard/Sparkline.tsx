/**
 * Küçük eğilim çizgisi: tüm dönem sönük gri, son dönem vurgu renginde,
 * son noktada yüzey halkalı bir işaret. Çizgi açılışta soldan sağa çizilir.
 */
export function Sparkline({
    values,
    highlightLast = 7,
    width = 120,
    height = 36,
    color = "var(--adm-accent)",
    label,
}: {
    values: number[];
    highlightLast?: number;
    width?: number;
    height?: number;
    color?: string;
    label: string;
}) {
    if (values.length < 2) return null;
    const pad = 4;
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const span = max - min || 1;
    const step = (width - pad * 2) / (values.length - 1);
    const points = values.map((v, i) => [pad + i * step, height - pad - ((v - min) / span) * (height - pad * 2)] as const);
    const toPath = (pts: readonly (readonly [number, number])[]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
    const length = (pts: readonly (readonly [number, number])[]) =>
        pts.reduce((sum, [x, y], i) => (i ? sum + Math.hypot(x - pts[i - 1][0], y - pts[i - 1][1]) : 0), 0);

    const recent = points.slice(Math.max(0, points.length - highlightLast));
    const [lastX, lastY] = points[points.length - 1];
    const area = `${toPath(recent)} L${recent[recent.length - 1][0].toFixed(1)} ${height} L${recent[0][0].toFixed(1)} ${height} Z`;

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} className="overflow-visible">
            <path d={toPath(points)} fill="none" strokeOpacity={0.45} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ stroke: "var(--adm-text-3)" }} />
            <path d={area} fillOpacity={0.1} className="adm-enter" style={{ "--i": 6, fill: color } as React.CSSProperties} />
            <path
                d={toPath(recent)}
                fill="none"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="adm-draw"
                style={{ "--len": Math.ceil(length(recent)) + 2, stroke: color } as React.CSSProperties}
            />
            <circle
                cx={lastX}
                cy={lastY}
                r={4}
                strokeWidth={2}
                className="adm-pop-in"
                style={{ "--i": 18, transformOrigin: `${lastX}px ${lastY}px`, fill: color, stroke: "var(--adm-surface)" } as React.CSSProperties}
            />
        </svg>
    );
}
