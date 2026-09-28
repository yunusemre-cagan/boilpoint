"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { ArrowUpRight, Globe, LogOut, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover } from "../ui/Popover";
import { useAdminUI } from "./AdminUIContext";
import { NAV_SECTIONS, isNavActive } from "./nav";
import { SidebarModeControl } from "./SidebarModeControl";
import { UserAvatar } from "./UserAvatar";

type Tip = { label: string; y: number } | null;

/**
 * Masaüstü kenar çubuğu. Üç mod:
 *  - expanded: her zaman tam genişlik, içerik yana itilir
 *  - hover: ikon şeridi; fare üzerine gelince içeriğin üstüne açılır
 *  - collapsed: her zaman ikon şeridi; öğelerin adları ipucu balonunda
 */
export function AdminSidebar() {
    const { sidebarMode } = useAdminUI();
    const [peek, setPeek] = useState(false);
    const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const expanded = sidebarMode === "expanded" || (sidebarMode === "hover" && peek);
    const overlay = sidebarMode === "hover" && peek;

    const clearTimers = () => {
        if (enterTimer.current) clearTimeout(enterTimer.current);
        if (leaveTimer.current) clearTimeout(leaveTimer.current);
    };

    return (
        <aside
            aria-label="Yönetim menüsü"
            data-expanded={expanded}
            onMouseEnter={() => {
                if (sidebarMode !== "hover") return;
                clearTimers();
                // Küçük bir niyet gecikmesi: imleç yalnızca üzerinden geçiyorsa açılmasın
                enterTimer.current = setTimeout(() => setPeek(true), 90);
            }}
            onMouseLeave={() => {
                clearTimers();
                leaveTimer.current = setTimeout(() => setPeek(false), 220);
            }}
            onFocus={(e) => {
                if (sidebarMode === "hover" && e.target.matches(":focus-visible")) setPeek(true);
            }}
            onBlur={(e) => {
                if (sidebarMode === "hover" && !e.currentTarget.contains(e.relatedTarget as Node)) setPeek(false);
            }}
            className={cn(
                "fixed inset-y-0 left-0 z-40 hidden flex-col overflow-hidden border-r lg:flex",
                "border-[var(--adm-border)] bg-[var(--adm-surface)] transition-[width,box-shadow] [transition-duration:450ms] [transition-timing-function:var(--adm-ease)]",
                overlay && "shadow-[var(--adm-shadow-lg)]",
            )}
            style={{ width: expanded ? "var(--adm-sidebar-w)" : "var(--adm-rail-w)" }}
        >
            <SidebarContent expanded={expanded} tooltips={sidebarMode === "collapsed"} />
        </aside>
    );
}

export function SidebarContent({
    expanded,
    tooltips,
    onNavigate,
    mobile,
}: {
    expanded: boolean;
    tooltips?: boolean;
    onNavigate?: () => void;
    mobile?: boolean;
}) {
    const pathname = usePathname();
    const { counts, user } = useAdminUI();
    const navRef = useRef<HTMLDivElement>(null);
    const [indicator, setIndicator] = useState<{ top: number; height: number } | null>(null);
    const [tip, setTip] = useState<Tip>(null);

    // Aktif öğenin arkasındaki vurgunun konumu (öğeler arasında kayarak geçer)
    useLayoutEffect(() => {
        const active = navRef.current?.querySelector<HTMLElement>("[data-active=true]");
        setIndicator(active ? { top: active.offsetTop, height: active.offsetHeight } : null);
    }, [pathname, expanded]);

    const tipHandlers = (label: string) =>
        tooltips
            ? {
                  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTip({ label, y: rect.top + rect.height / 2 });
                  },
                  onMouseLeave: () => setTip(null),
                  onFocus: (e: React.FocusEvent<HTMLElement>) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTip({ label, y: rect.top + rect.height / 2 });
                  },
                  onBlur: () => setTip(null),
              }
            : {};

    const label = (text: React.ReactNode, index = 0) => (
        <span
            className={cn(
                "min-w-0 flex-1 truncate whitespace-nowrap text-left transition-[opacity,transform] duration-300 [transition-timing-function:var(--adm-ease)]",
                expanded ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-1 opacity-0",
            )}
            style={{ transitionDelay: expanded ? `${60 + index * 14}ms` : "0ms" }}
        >
            {text}
        </span>
    );

    let itemIndex = 0;

    return (
        <div className="flex h-full min-h-0 flex-col">
            {/* Marka */}
            <div className="flex h-16 shrink-0 items-center px-[18px]">
                <Link href="/admin" onClick={onNavigate} className="group flex items-center gap-2.5" aria-label="Dashboard">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold shadow-md shadow-indigo-500/20">
                            O
                        </span>
                        <span className={cn("font-bold tracking-tight text-base adm-text transition-opacity duration-300", expanded ? "opacity-100" : "pointer-events-none opacity-0")}>
                            Obsidian
                        </span>
                    </div>
                    <span
                        className={cn(
                            "rounded-md px-1.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.14em] transition-all duration-300",
                            "bg-[var(--adm-accent-soft)] text-[var(--adm-accent-text)]",
                            expanded ? "opacity-100" : "pointer-events-none -translate-x-2 opacity-0",
                        )}
                    >
                        Panel
                    </span>
                </Link>
            </div>

            {/* Yeni yazı */}
            <div className="shrink-0 px-[14px] pb-3">
                <Link
                    href="/admin/posts/new"
                    onClick={onNavigate}
                    {...tipHandlers("Yeni Yazı")}
                    className="adm-btn adm-btn-primary adm-nudge h-10 w-full justify-start gap-0 overflow-hidden rounded-xl p-0"
                >
                    <span className="flex w-12 shrink-0 items-center justify-center">
                        <PenLine className="adm-nudge-rot !h-[1.05rem] !w-[1.05rem]" />
                    </span>
                    {label("Yeni Yazı")}
                </Link>
            </div>

            {/* Gezinme */}
            <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-4 [scrollbar-width:thin]">
                <div ref={navRef} className="relative">
                    {indicator && (
                        <span
                            aria-hidden
                            className="absolute left-[14px] right-[14px] rounded-xl bg-[var(--adm-accent-soft)] transition-[transform,height] duration-500 [transition-timing-function:var(--adm-spring)]"
                            style={{ height: indicator.height, transform: `translateY(${indicator.top}px)`, top: 0 }}
                        >
                            <span className="absolute -left-[14px] top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full" style={{ background: "var(--adm-grad)" }} />
                        </span>
                    )}

                    {NAV_SECTIONS.map((section) => (
                        <div key={section.title} className="pt-1.5">
                            <div className="relative flex h-6 items-center px-[26px]">
                                <span
                                    className={cn(
                                        "text-[0.68rem] font-semibold uppercase tracking-[0.12em] adm-text-3 transition-opacity duration-300",
                                        expanded ? "opacity-100" : "opacity-0",
                                    )}
                                >
                                    {section.title}
                                </span>
                                <span
                                    aria-hidden
                                    className={cn(
                                        "absolute left-1/2 top-1/2 h-px w-5 -translate-x-1/2 bg-[var(--adm-border-strong)] transition-opacity duration-300",
                                        expanded ? "opacity-0" : "opacity-100",
                                    )}
                                    style={{ left: "calc(var(--adm-rail-w) / 2)" }}
                                />
                            </div>
                            <ul className="space-y-0.5">
                                {section.items.map((item) => {
                                    const active = isNavActive(pathname, item.href);
                                    const count = item.badge ? counts[item.badge] : 0;
                                    const index = itemIndex++;
                                    return (
                                        <li key={item.href} className="px-[14px]">
                                            <Link
                                                href={item.href}
                                                onClick={() => {
                                                    setTip(null);
                                                    onNavigate?.();
                                                }}
                                                data-active={active}
                                                aria-current={active ? "page" : undefined}
                                                {...tipHandlers(item.name)}
                                                className={cn(
                                                    "group relative flex h-9 items-center rounded-xl text-[0.8125rem] font-medium outline-none transition-colors duration-200",
                                                    "focus-visible:ring-2 focus-visible:ring-[var(--adm-ring)]",
                                                    active ? "text-[var(--adm-text)]" : "text-[var(--adm-text-2)] hover:bg-[var(--adm-surface-2)] hover:text-[var(--adm-text)]",
                                                )}
                                            >
                                                <span className="relative flex w-12 shrink-0 items-center justify-center">
                                                    <item.icon
                                                        className={cn(
                                                            "h-[1.1rem] w-[1.1rem] transition-transform duration-300 [transition-timing-function:var(--adm-spring)] group-hover:scale-110",
                                                            active ? "text-[var(--adm-accent)]" : "text-[var(--adm-text-3)] group-hover:text-[var(--adm-text-2)]",
                                                        )}
                                                    />
                                                    {count > 0 && !expanded && (
                                                        <span className="absolute right-2.5 top-0 flex h-2 w-2 text-[var(--adm-accent)]">
                                                            <span className="adm-dot adm-dot-pulse h-2 w-2" />
                                                        </span>
                                                    )}
                                                </span>
                                                {label(item.name, index)}
                                                {count > 0 && expanded && (
                                                    <span className="adm-count mr-2.5">{count > 99 ? "99+" : count}</span>
                                                )}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
            </nav>

            {/* Alt bölüm */}
            <div className="shrink-0 space-y-2 border-t border-[var(--adm-border)] pb-3 pt-2">
                <div className="px-[14px]">
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        {...tipHandlers("Siteyi Görüntüle")}
                        className="group adm-nudge flex h-9 items-center rounded-xl text-[0.8125rem] font-medium text-[var(--adm-text-2)] transition-colors hover:bg-[var(--adm-surface-2)] hover:text-[var(--adm-text)]"
                    >
                        <span className="flex w-12 shrink-0 items-center justify-center">
                            <Globe className="h-[1.1rem] w-[1.1rem] text-[var(--adm-text-3)] transition-transform duration-500 group-hover:rotate-[20deg] group-hover:text-[var(--adm-accent)]" />
                        </span>
                        {label("Siteyi Görüntüle")}
                        <ArrowUpRight
                            className={cn(
                                "adm-nudge-up mr-3 h-3.5 w-3.5 shrink-0 text-[var(--adm-text-3)] transition-[transform,opacity] duration-300",
                                expanded ? "opacity-100" : "opacity-0",
                            )}
                        />
                    </a>
                </div>

                {!mobile && <SidebarModeControl expanded={expanded} />}

                <div className="px-[14px]">
                    {expanded ? (
                        <div className="flex items-center gap-3 rounded-xl border border-[var(--adm-border)] bg-[var(--adm-surface-2)] p-2 pl-2.5">
                            <UserAvatar user={user} />
                            <div className="min-w-0 flex-1 leading-tight">
                                <p className="truncate text-[0.8125rem] font-semibold adm-text">{user.name || "Yönetici"}</p>
                                <p className="truncate text-[0.7rem] adm-text-3">{user.email || "Admin"}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                                className="adm-btn adm-btn-ghost adm-btn-sm adm-btn-icon adm-tip hover:!text-rose-500"
                                data-tip="Çıkış yap"
                                aria-label="Çıkış yap"
                            >
                                <LogOut />
                            </button>
                        </div>
                    ) : (
                        <Popover
                            placement="right-end"
                            width={220}
                            trigger={({ ref, onClick, ...aria }) => (
                                <button
                                    ref={ref}
                                    type="button"
                                    onClick={onClick}
                                    {...aria}
                                    aria-label="Hesap"
                                    className="mx-auto flex h-10 w-12 items-center justify-center rounded-xl transition-colors hover:bg-[var(--adm-surface-2)]"
                                >
                                    <UserAvatar user={user} />
                                </button>
                            )}
                        >
                            <div className="px-2.5 pb-2 pt-1.5">
                                <p className="truncate text-sm font-semibold adm-text">{user.name || "Yönetici"}</p>
                                <p className="truncate text-xs adm-text-3">{user.email}</p>
                            </div>
                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                                className="adm-menu-item hover:!text-rose-500 [&:hover>svg]:!text-rose-500"
                            >
                                <LogOut /> Çıkış yap
                            </button>
                        </Popover>
                    )}
                </div>
            </div>

            {/* Dar moddaki ipucu balonu (taşmayı kesen kaptan etkilenmesin diye sabit konumlu) */}
            {tooltips && tip && (
                <div
                    key={tip.label}
                    role="tooltip"
                    className="adm-portal pointer-events-none fixed z-[60] -translate-y-1/2"
                    style={{ top: tip.y, left: "calc(var(--adm-rail-w) + 10px)" }}
                >
                    <div className="adm-popover whitespace-nowrap rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-50 shadow-lg [--origin:left_center] dark:bg-zinc-100 dark:text-zinc-900">
                        {tip.label}
                    </div>
                </div>
            )}
        </div>
    );
}
