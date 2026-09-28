"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useListNav } from "./ListNav";

/** 1 … 4 [5] 6 … 12 biçiminde sayfa listesi üretir. */
function pageList(page: number, total: number): (number | "gap")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = new Set([1, total, page - 1, page, page + 1]);
    if (page <= 3) [2, 3, 4].forEach((p) => pages.add(p));
    if (page >= total - 2) [total - 1, total - 2, total - 3].forEach((p) => pages.add(p));
    const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
    const out: (number | "gap")[] = [];
    sorted.forEach((p, i) => {
        if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
        out.push(p);
    });
    return out;
}

export function Pagination({
    page,
    totalPages,
    total,
    pageSize,
    param = "page",
    sizeParam = "per",
    sizeOptions,
    itemLabel = "kayıt",
    compact,
    className,
}: {
    page: number;
    totalPages: number;
    total: number;
    pageSize: number;
    param?: string;
    sizeParam?: string;
    /** Verilirse sayfa başına kayıt seçicisi gösterilir */
    sizeOptions?: number[];
    itemLabel?: string;
    /** Dar paneller için yalnızca önceki/sonraki */
    compact?: boolean;
    className?: string;
}) {
    const { hrefFor, navigate } = useListNav();
    const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);

    const go = (target: number) => (e: React.MouseEvent) => {
        // Bağlantı olarak kalır (orta tık, yeni sekme) ama normal tıkta transition kullanılır
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate({ [param]: target === 1 ? null : target });
    };

    const stepLink = (target: number, disabled: boolean, label: string, Icon: typeof ChevronLeft) =>
        disabled ? (
            <span className="adm-btn adm-btn-ghost adm-btn-sm adm-btn-icon" aria-disabled="true" aria-label={label}>
                <Icon />
            </span>
        ) : (
            <Link
                href={hrefFor({ [param]: target === 1 ? null : target })}
                onClick={go(target)}
                scroll={false}
                className="adm-btn adm-btn-ghost adm-btn-sm adm-btn-icon"
                aria-label={label}
            >
                <Icon />
            </Link>
        );

    return (
        <nav
            aria-label="Sayfalama"
            className={cn("flex flex-wrap items-center justify-between gap-3 text-xs adm-text-3", className)}
        >
            <div className="flex items-center gap-3">
                <span className="tabular-nums">
                    {total === 0 ? (
                        `0 ${itemLabel}`
                    ) : (
                        <>
                            <span className="font-semibold adm-text-2">
                                {from.toLocaleString("tr-TR")}–{to.toLocaleString("tr-TR")}
                            </span>{" "}
                            / {total.toLocaleString("tr-TR")} {itemLabel}
                        </>
                    )}
                </span>
                {sizeOptions && (
                    <label className="hidden items-center gap-2 sm:flex">
                        <span>Sayfa başına</span>
                        <select
                            value={pageSize}
                            onChange={(e) => navigate({ [sizeParam]: e.target.value, [param]: null })}
                            className="adm-input h-8 w-[4.5rem] rounded-lg py-0 pl-2.5 text-xs"
                        >
                            {sizeOptions.map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center gap-1">
                    {stepLink(page - 1, page <= 1, "Önceki sayfa", ChevronLeft)}
                    {compact ? (
                        <span className="px-2 font-medium tabular-nums adm-text-2">
                            {page} / {totalPages}
                        </span>
                    ) : (
                        <>
                            <span className="px-2 font-medium tabular-nums adm-text-2 sm:hidden">
                                {page} / {totalPages}
                            </span>
                            <div className="hidden items-center gap-1 sm:flex">
                                {pageList(page, totalPages).map((p, i) =>
                                    p === "gap" ? (
                                        <span key={`gap-${i}`} className="w-6 text-center">
                                            …
                                        </span>
                                    ) : p === page ? (
                                        <span
                                            key={p}
                                            aria-current="page"
                                            className="adm-pop-in inline-flex h-8 min-w-8 items-center justify-center rounded-[0.625rem] px-2 text-[0.8125rem] font-semibold tabular-nums text-white shadow-[0_6px_16px_-8px_rgb(99_102_241/0.9)]"
                                            style={{ background: "var(--adm-grad)" }}
                                        >
                                            {p}
                                        </span>
                                    ) : (
                                        <Link
                                            key={p}
                                            href={hrefFor({ [param]: p === 1 ? null : p })}
                                            onClick={go(p)}
                                            scroll={false}
                                            className="adm-btn adm-btn-ghost adm-btn-sm min-w-8 px-2 tabular-nums"
                                        >
                                            {p}
                                        </Link>
                                    ),
                                )}
                            </div>
                        </>
                    )}
                    {stepLink(page + 1, page >= totalPages, "Sonraki sayfa", ChevronRight)}
                </div>
            )}
        </nav>
    );
}
