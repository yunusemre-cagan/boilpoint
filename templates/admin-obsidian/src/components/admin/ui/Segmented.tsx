"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type IconType = React.ComponentType<{ className?: string }>;

export type SegmentedItem<T extends string> = {
    value: T;
    label: React.ReactNode;
    icon?: IconType;
    count?: number;
    /** Dar ekranlarda yalnızca ikonu göster */
    iconOnlyOnMobile?: boolean;
    tip?: string;
};

/**
 * Seçili sekmenin arkasında yaylanarak kayan bir gösterge bulunan seçici.
 * Ok tuşlarıyla da gezilebilir.
 */
export function Segmented<T extends string>({
    items,
    value,
    onChange,
    ariaLabel,
    className,
    stretch,
}: {
    items: SegmentedItem<T>[];
    value: T;
    onChange: (value: T) => void;
    ariaLabel: string;
    className?: string;
    /** Tüm genişliği kaplayan eşit sekmeler */
    stretch?: boolean;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [indicator, setIndicator] = useState<{ x: number; w: number } | null>(null);
    const [ready, setReady] = useState(false);

    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const measure = () => {
            const active = container.querySelector<HTMLElement>(`[data-seg-value="${CSS.escape(value)}"]`);
            if (!active) return setIndicator(null);
            setIndicator({ x: active.offsetLeft, w: active.offsetWidth });
        };

        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(container);
        // İlk ölçümden sonra geçiş animasyonunu aç (ilk çizimde soldan kaymasın)
        const raf = requestAnimationFrame(() => setReady(true));
        return () => {
            observer.disconnect();
            cancelAnimationFrame(raf);
        };
    }, [value, items.length]);

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        const index = items.findIndex((item) => item.value === value);
        const next = items[(index + (e.key === "ArrowRight" ? 1 : -1) + items.length) % items.length];
        onChange(next.value);
        containerRef.current?.querySelector<HTMLElement>(`[data-seg-value="${CSS.escape(next.value)}"]`)?.focus();
    };

    return (
        <div
            ref={containerRef}
            role="tablist"
            aria-label={ariaLabel}
            onKeyDown={onKeyDown}
            className={cn("adm-seg", stretch && "flex w-full", className)}
        >
            <span
                aria-hidden
                className="adm-seg-indicator"
                style={{
                    width: indicator?.w ?? 0,
                    transform: `translateX(${indicator?.x ?? 0}px)`,
                    opacity: indicator ? 1 : 0,
                    transition: ready ? undefined : "none",
                }}
            />
            {items.map((item) => {
                const selected = item.value === value;
                const Icon = item.icon;
                return (
                    <button
                        key={item.value}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        tabIndex={selected ? 0 : -1}
                        data-seg-value={item.value}
                        data-tip={item.tip}
                        onClick={() => onChange(item.value)}
                        className={cn("adm-seg-item", stretch && "flex-1", item.tip && "adm-tip")}
                    >
                        {Icon && <Icon />}
                        <span className={cn(item.iconOnlyOnMobile && "hidden sm:inline")}>{item.label}</span>
                        {item.count !== undefined && <span className="adm-seg-count">{item.count.toLocaleString("tr-TR")}</span>}
                    </button>
                );
            })}
        </div>
    );
}
