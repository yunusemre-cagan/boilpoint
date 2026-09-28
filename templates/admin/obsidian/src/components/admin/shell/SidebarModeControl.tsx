"use client";

import { Check, MousePointer2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover } from "../ui/Popover";
import { Segmented } from "../ui/Segmented";
import { useAdminUI } from "./AdminUIContext";
import type { SidebarMode } from "./nav";

export const SIDEBAR_MODE_OPTIONS: {
    value: SidebarMode;
    label: string;
    description: string;
    icon: typeof PanelLeftOpen;
}[] = [
    { value: "expanded", label: "Sürekli açık", description: "Menü her zaman tam genişlikte", icon: PanelLeftOpen },
    { value: "hover", label: "Üzerine gelince", description: "Yalnızca ikonlar; fareyle genişler", icon: MousePointer2 },
    { value: "collapsed", label: "Sadece ikon", description: "Her zaman dar, ipuçlarıyla", icon: PanelLeftClose },
];

/** Üç kenar çubuğu modunun küçük çizimi. */
export function SidebarModePreview({ mode, active }: { mode: SidebarMode; active?: boolean }) {
    const wide = mode === "expanded";
    return (
        <span
            aria-hidden
            className={cn(
                "relative flex h-9 w-14 shrink-0 overflow-hidden rounded-md border transition-colors",
                active ? "border-[var(--adm-accent)] bg-[var(--adm-accent-softer)]" : "border-[var(--adm-border-strong)] bg-[var(--adm-surface-2)]",
            )}
        >
            <span
                className={cn(
                    "flex h-full flex-col gap-[3px] border-r p-[4px] transition-all duration-500",
                    active ? "border-[color-mix(in_srgb,var(--adm-accent)_40%,transparent)]" : "border-[var(--adm-border-strong)]",
                    wide ? "w-6" : "w-3",
                )}
            >
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        className={cn("h-[3px] rounded-full", active ? "bg-[var(--adm-accent)]" : "bg-[var(--adm-text-3)]", i === 0 ? "opacity-100" : "opacity-50")}
                    />
                ))}
            </span>
            {mode === "hover" && (
                <span
                    className={cn(
                        "absolute inset-y-[3px] left-3 w-3 rounded-r-sm border border-dashed",
                        active ? "border-[var(--adm-accent)]" : "border-[var(--adm-text-3)]",
                    )}
                />
            )}
            <span className="flex flex-1 flex-col gap-[3px] p-[5px]">
                <span className="h-[3px] w-2/3 rounded-full bg-[var(--adm-text-3)] opacity-40" />
                <span className="h-[3px] w-1/2 rounded-full bg-[var(--adm-text-3)] opacity-25" />
            </span>
        </span>
    );
}

/**
 * Kenar çubuğunun altındaki mod seçici. Geniş halde üç ikonlu seçici,
 * dar halde tek ikonlu bir düğmeden açılan menü olarak görünür.
 */
export function SidebarModeControl({ expanded }: { expanded: boolean }) {
    const { sidebarMode, setSidebarMode } = useAdminUI();
    const current = SIDEBAR_MODE_OPTIONS.find((option) => option.value === sidebarMode)!;

    if (expanded) {
        return (
            <div className="flex items-center justify-between gap-2 px-[14px] pl-[26px]">
                <p className="truncate text-[0.68rem] font-semibold uppercase tracking-[0.12em] adm-text-3">Menü</p>
                <Segmented
                    ariaLabel="Kenar çubuğu modu"
                    value={sidebarMode}
                    onChange={setSidebarMode}
                    items={SIDEBAR_MODE_OPTIONS.map((option) => ({
                        value: option.value,
                        icon: option.icon,
                        label: <span className="sr-only">{option.label}</span>,
                        tip: option.label,
                    }))}
                />
            </div>
        );
    }

    return (
        <div className="px-[14px]">
            <Popover
                placement="right-end"
                width={264}
                trigger={({ ref, onClick, ...aria }) => (
                    <button
                        ref={ref}
                        type="button"
                        onClick={onClick}
                        {...aria}
                        aria-label="Kenar çubuğu modu"
                        className="adm-btn adm-btn-ghost mx-auto flex h-10 w-12 p-0"
                    >
                        <current.icon className="!h-[1.1rem] !w-[1.1rem]" />
                    </button>
                )}
            >
                {(close) => (
                    <div>
                        <p className="px-2.5 pb-1.5 pt-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] adm-text-3">Kenar çubuğu</p>
                        {SIDEBAR_MODE_OPTIONS.map((option) => {
                            const active = option.value === sidebarMode;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        setSidebarMode(option.value);
                                        close();
                                    }}
                                    className="adm-menu-item gap-3"
                                >
                                    <SidebarModePreview mode={option.value} active={active} />
                                    <span className="min-w-0 flex-1">
                                        <span className={cn("block font-semibold", active ? "adm-text" : "adm-text-2")}>{option.label}</span>
                                        <span className="block text-[0.7rem] font-normal adm-text-3">{option.description}</span>
                                    </span>
                                    {active && <Check className="adm-pop-in !text-[var(--adm-accent)]" />}
                                </button>
                            );
                        })}
                    </div>
                )}
            </Popover>
        </div>
    );
}
