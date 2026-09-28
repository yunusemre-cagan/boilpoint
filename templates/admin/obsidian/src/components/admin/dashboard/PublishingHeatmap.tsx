const DAY = 86_400_000;
const WEEKS = 26;
const WEEKDAY_LABELS = ["Pzt", "", "Çar", "", "Cum", "", ""];
const WEEKDAY_NAMES = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
/** Tek tonlu (indigo) sıralı ölçek: boş → yoğun */
const LEVELS = [
    "var(--adm-surface-3)",
    "color-mix(in srgb, var(--adm-accent) 28%, var(--adm-surface-2))",
    "color-mix(in srgb, var(--adm-accent) 52%, var(--adm-surface-2))",
    "color-mix(in srgb, var(--adm-accent) 76%, var(--adm-surface-2))",
    "var(--adm-accent)",
];

const level = (count: number) => Math.min(count, LEVELS.length - 1);

/**
 * Son 26 haftada oluşturulan yazıların gün gün dağılımı (GitHub tarzı).
 * Hücreler kabın genişliğine göre esner; altında kısa bir özet yer alır.
 */
export function PublishingHeatmap({ dates, now }: { dates: Date[]; now: Date }) {
    const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    // Pazartesi başlangıçlı haftalar: bu haftanın pazartesisinden 25 hafta geri
    const weekday = (new Date(today).getUTCDay() + 6) % 7;
    const start = today - weekday * DAY - (WEEKS - 1) * 7 * DAY;

    const counts = new Map<number, number>();
    const perWeekday = Array(7).fill(0) as number[];
    let thisMonth = 0;
    for (const date of dates) {
        const day = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
        if (day < start || day > today) continue;
        counts.set(day, (counts.get(day) ?? 0) + 1);
        perWeekday[(new Date(day).getUTCDay() + 6) % 7]++;
        if (date.getUTCMonth() === now.getUTCMonth() && date.getUTCFullYear() === now.getUTCFullYear()) thisMonth++;
    }
    const total = [...counts.values()].reduce((a, b) => a + b, 0);
    const busiest = perWeekday.indexOf(Math.max(...perWeekday));

    const fmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone: "UTC" });
    const monthFmt = new Intl.DateTimeFormat("tr-TR", { month: "short", timeZone: "UTC" });

    const weeks = Array.from({ length: WEEKS }, (_, w) =>
        Array.from({ length: 7 }, (_, d) => {
            const day = start + (w * 7 + d) * DAY;
            return { day, future: day > today, count: counts.get(day) ?? 0 };
        }),
    );

    return (
        <div>
            <div className="flex items-baseline justify-between gap-3">
                <p className="text-xs adm-text-3">
                    Son 6 ayda <span className="font-semibold adm-text">{total}</span> yazı
                </p>
                <div className="flex items-center gap-1 text-[0.68rem] adm-text-3" aria-hidden>
                    Az
                    {LEVELS.map((color, i) => (
                        <span key={i} className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: color }} />
                    ))}
                    Çok
                </div>
            </div>

            <div
                className="mt-3 grid gap-[3px]"
                style={{ gridTemplateColumns: `1.6rem repeat(${WEEKS}, minmax(0, 1fr))` }}
                role="img"
                aria-label={`Son 26 haftada ${total} yazı oluşturuldu`}
            >
                <div className="grid grid-rows-[0.8rem_repeat(7,minmax(0,1fr))] gap-[3px] text-[0.6rem] adm-text-3" aria-hidden>
                    <span />
                    {WEEKDAY_LABELS.map((d, i) => (
                        <span key={i} className="flex items-center leading-none">
                            {d}
                        </span>
                    ))}
                </div>
                {weeks.map((week, w) => {
                    const first = new Date(week[0].day);
                    const showMonth = w === 0 || first.getUTCDate() <= 7;
                    return (
                        <div key={w} className="grid grid-rows-[0.8rem_repeat(7,auto)] gap-[3px]">
                            <span className="relative text-[0.6rem] leading-none adm-text-3" aria-hidden>
                                {showMonth && w < WEEKS - 1 ? <span className="absolute left-0 whitespace-nowrap">{monthFmt.format(first)}</span> : null}
                            </span>
                            {week.map((cell, d) =>
                                cell.future ? (
                                    <span key={d} className="aspect-square w-full" />
                                ) : (
                                    <span
                                        key={d}
                                        className="adm-tip adm-pop-in aspect-square w-full rounded-[3px] transition-transform duration-200 hover:z-10 hover:scale-125"
                                        data-tip={`${cell.count ? `${cell.count} yazı` : "Yazı yok"} · ${fmt.format(new Date(cell.day))}`}
                                        style={{ backgroundColor: LEVELS[level(cell.count)], "--i": w * 0.35 } as React.CSSProperties}
                                    />
                                ),
                            )}
                        </div>
                    );
                })}
            </div>

            <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-[var(--adm-border)] pt-4 text-center">
                <div>
                    <dt className="text-[0.7rem] adm-text-3">Bu ay</dt>
                    <dd className="mt-1 text-lg font-semibold tabular-nums adm-text">{thisMonth}</dd>
                </div>
                <div>
                    <dt className="text-[0.7rem] adm-text-3">Haftalık ort.</dt>
                    <dd className="mt-1 text-lg font-semibold tabular-nums adm-text">{(total / WEEKS).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}</dd>
                </div>
                <div>
                    <dt className="text-[0.7rem] adm-text-3">En verimli gün</dt>
                    <dd className="mt-1 text-sm font-semibold leading-7 adm-text">{total ? WEEKDAY_NAMES[busiest] : "—"}</dd>
                </div>
            </dl>
        </div>
    );
}
