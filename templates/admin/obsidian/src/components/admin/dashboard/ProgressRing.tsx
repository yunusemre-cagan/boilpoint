/** Oran göstergesi: halka açılışta sıfırdan hedef değere dolar. */
export function ProgressRing({ value, size = 44, stroke = 5, label }: { value: number; size?: number; stroke?: number; label: string }) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const clamped = Math.max(0, Math.min(1, value));
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} style={{ stroke: "var(--adm-accent-soft)" }} />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={c * (1 - clamped)}
                style={
                    {
                        stroke: "var(--adm-accent)",
                        "--c": c,
                        animation: "adm-ring 1.2s var(--adm-ease) 0.2s both",
                    } as React.CSSProperties
                }
            />
        </svg>
    );
}
