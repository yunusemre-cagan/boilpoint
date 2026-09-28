"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type Placement = "bottom-end" | "bottom-start" | "right-end" | "right-start";

type TriggerProps = {
    ref: React.RefObject<HTMLButtonElement | null>;
    onClick: () => void;
    "aria-expanded": boolean;
    "aria-haspopup": "menu";
};

/**
 * Tetikleyiciye göre sabit konumlanan, belgeye portal ile eklenen açılır panel.
 * Kenar çubuğu gibi taşmayı kesen kapların içinden de düzgün açılır.
 * Dışarı tıklama, Escape, kaydırma ve yeniden boyutlandırma paneli kapatır.
 */
export function Popover({
    trigger,
    children,
    placement = "bottom-end",
    width = 240,
    className,
}: {
    trigger: (props: TriggerProps & { open: boolean }) => React.ReactNode;
    children: React.ReactNode | ((close: () => void) => React.ReactNode);
    placement?: Placement;
    width?: number;
    className?: string;
}) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState<React.CSSProperties | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const close = useCallback(() => setOpen(false), []);

    useLayoutEffect(() => {
        if (!open || !triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const gap = 8;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const next: React.CSSProperties & Record<string, string | number> = { width };
        if (placement.startsWith("bottom")) {
            next.top = rect.bottom + gap;
            if (placement === "bottom-end") next.right = Math.max(8, vw - rect.right);
            else next.left = Math.min(rect.left, vw - width - 8);
            next["--origin" as string] = placement === "bottom-end" ? "top right" : "top left";
        } else {
            next.left = rect.right + gap + 4;
            if (placement === "right-end") {
                next.bottom = Math.max(8, vh - rect.bottom);
                next["--origin" as string] = "bottom left";
            } else {
                next.top = rect.top;
                next["--origin" as string] = "top left";
            }
        }
        setPosition(next);
    }, [open, placement, width]);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e: PointerEvent) => {
            const target = e.target as Node;
            if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
            setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setOpen(false);
                triggerRef.current?.focus();
            }
        };
        const onViewportChange = () => setOpen(false);
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKey);
        window.addEventListener("resize", onViewportChange);
        window.addEventListener("scroll", onViewportChange, true);
        // İlk öğeye odaklan (klavye kullanıcıları için)
        requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("[role=menuitem], button, a")?.focus({ preventScroll: true }));
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKey);
            window.removeEventListener("resize", onViewportChange);
            window.removeEventListener("scroll", onViewportChange, true);
        };
    }, [open]);

    return (
        <>
            {trigger({
                ref: triggerRef,
                open,
                onClick: () => setOpen((o) => !o),
                "aria-expanded": open,
                "aria-haspopup": "menu",
            })}
            {open &&
                position &&
                createPortal(
                    <div
                        ref={panelRef}
                        role="menu"
                        className={cn("adm-popover adm-elevated adm-portal fixed z-[70] p-1.5", className)}
                        style={position}
                        onKeyDown={(e) => {
                            if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
                            e.preventDefault();
                            const items = [...(panelRef.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? [])];
                            const index = items.indexOf(document.activeElement as HTMLElement);
                            const next = items[(index + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length];
                            next?.focus();
                        }}
                    >
                        {typeof children === "function" ? children(close) : children}
                    </div>,
                    document.body,
                )}
        </>
    );
}
