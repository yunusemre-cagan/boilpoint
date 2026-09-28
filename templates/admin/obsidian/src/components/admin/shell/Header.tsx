"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import {
    ArrowUpRight,
    Bell,
    BookHeart,
    CheckCheck,
    ChevronRight,
    Globe,
    LogOut,
    Mail,
    Menu,
    MessageSquareDot,
    Search,
    Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover } from "../ui/Popover";
import { useAdminUI } from "./AdminUIContext";
import { breadcrumbsFor } from "./nav";
import { AdminThemeToggle } from "./ThemeToggle";
import { UserAvatar } from "./UserAvatar";

export function AdminHeader() {
    const pathname = usePathname();
    const { setMobileNavOpen, setCommandOpen } = useAdminUI();
    const [scrolled, setScrolled] = useState(false);
    const [isMac, setIsMac] = useState(true);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 4);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const crumbs = breadcrumbsFor(pathname);

    return (
        <header
            data-scrolled={scrolled || undefined}
            className="adm-header sticky top-0 z-30 flex h-[var(--adm-header-h)] items-center gap-2 px-4 sm:px-6 lg:px-8"
        >
            <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="adm-btn adm-btn-ghost adm-btn-icon -ml-2 lg:hidden"
                aria-label="Menüyü aç"
            >
                <Menu />
            </button>

            {/* Konum */}
            <nav aria-label="Konum" className="flex min-w-0 flex-1 items-center gap-1.5 text-sm">
                <Link href="/admin" className="hidden shrink-0 font-medium adm-text-3 transition-colors hover:text-[var(--adm-text)] sm:inline">
                    Panel
                </Link>
                {crumbs.length === 0 && <span className="font-semibold adm-text sm:hidden">Dashboard</span>}
                {crumbs.map((crumb, i) => {
                    const last = i === crumbs.length - 1;
                    return (
                        <span key={crumb.href} className={cn("min-w-0 items-center gap-1.5", last ? "flex" : "hidden sm:flex")}>
                            <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 adm-text-3 sm:block" />
                            {last ? (
                                <span key={pathname} className="adm-enter truncate font-semibold adm-text">
                                    {crumb.label}
                                </span>
                            ) : (
                                <Link href={crumb.href} className="truncate font-medium adm-text-3 transition-colors hover:text-[var(--adm-text)]">
                                    {crumb.label}
                                </Link>
                            )}
                        </span>
                    );
                })}
            </nav>

            {/* Arama / komut paleti */}
            <button
                type="button"
                onClick={() => setCommandOpen(true)}
                className="group hidden h-9 w-60 items-center gap-2.5 rounded-xl border border-[var(--adm-border-strong)] bg-[var(--adm-surface)] px-3 text-sm adm-text-3 shadow-[var(--adm-shadow-xs)] transition-all duration-300 hover:border-[color-mix(in_srgb,var(--adm-accent)_40%,var(--adm-border-strong))] hover:shadow-[0_0_0_4px_var(--adm-accent-softer)] md:flex xl:w-72"
            >
                <Search className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:text-[var(--adm-accent)]" />
                <span className="flex-1 text-left">Ara veya git…</span>
                <span className="flex items-center gap-0.5">
                    <kbd className="adm-kbd">{isMac ? "⌘" : "Ctrl"}</kbd>
                    <kbd className="adm-kbd">K</kbd>
                </span>
            </button>

            <div className="flex items-center gap-0.5 sm:gap-1">
                <button
                    type="button"
                    onClick={() => setCommandOpen(true)}
                    className="adm-btn adm-btn-ghost adm-btn-icon md:hidden"
                    aria-label="Ara"
                >
                    <Search />
                </button>
                <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="adm-btn adm-btn-ghost adm-btn-icon adm-tip hidden sm:inline-flex [&>svg]:transition-transform [&>svg]:duration-500 hover:[&>svg]:rotate-[20deg]"
                    data-tip="Siteyi görüntüle"
                    data-tip-pos="bottom"
                    aria-label="Siteyi görüntüle"
                >
                    <Globe />
                </a>
                <AdminThemeToggle />
                <NotificationsMenu />
                <UserMenu />
            </div>
        </header>
    );
}

function NotificationsMenu() {
    const { counts } = useAdminUI();
    const total = counts.comments + counts.guestbook + counts.messages;
    const items = [
        { count: counts.comments, label: "yorum onay bekliyor", href: "/admin/comments?status=pending", icon: MessageSquareDot },
        { count: counts.guestbook, label: "defter mesajı onay bekliyor", href: "/admin/guestbook?status=pending", icon: BookHeart },
        { count: counts.messages, label: "okunmamış mesaj", href: "/admin/messages?status=unread", icon: Mail },
    ].filter((item) => item.count > 0);

    return (
        <Popover
            width={300}
            trigger={({ ref, onClick, open, ...aria }) => (
                <button
                    ref={ref}
                    type="button"
                    onClick={onClick}
                    {...aria}
                    aria-label={total > 0 ? `Bildirimler (${total})` : "Bildirimler"}
                    className={cn("adm-btn adm-btn-ghost adm-btn-icon adm-wiggle relative", open && "bg-[var(--adm-surface-2)] text-[var(--adm-text)]")}
                >
                    <Bell className="origin-top" />
                    {total > 0 && (
                        <span className="absolute right-2 top-2 flex h-2 w-2 text-rose-500">
                            <span className="adm-dot adm-dot-pulse h-2 w-2 ring-2 ring-[var(--adm-bg)]" />
                        </span>
                    )}
                </button>
            )}
        >
            {(close) => (
                <div>
                    <div className="flex items-center justify-between px-2.5 pb-2 pt-1.5">
                        <p className="text-sm font-semibold adm-text">Bildirimler</p>
                        {total > 0 && <span className="adm-count">{total}</span>}
                    </div>
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center px-4 pb-5 pt-3 text-center">
                            <span className="adm-pop-in mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <CheckCheck className="h-5 w-5" />
                            </span>
                            <p className="text-sm font-medium adm-text">Her şey yolunda</p>
                            <p className="mt-0.5 text-xs adm-text-3">Bekleyen bir işin yok.</p>
                        </div>
                    ) : (
                        items.map((item, i) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                role="menuitem"
                                onClick={close}
                                className="adm-menu-item adm-enter adm-nudge"
                                style={{ "--i": i } as React.CSSProperties}
                            >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--adm-accent-soft)]">
                                    <item.icon className="!text-[var(--adm-accent)]" />
                                </span>
                                <span className="flex-1">
                                    <span className="font-semibold adm-text">{item.count}</span> {item.label}
                                </span>
                                <ChevronRight className="adm-nudge-x" />
                            </Link>
                        ))
                    )}
                </div>
            )}
        </Popover>
    );
}

function UserMenu() {
    const { user } = useAdminUI();
    return (
        <Popover
            width={240}
            trigger={({ ref, onClick, ...aria }) => (
                <button
                    ref={ref}
                    type="button"
                    onClick={onClick}
                    {...aria}
                    aria-label="Hesap menüsü"
                    className="ml-1 rounded-[0.7rem] transition-transform duration-300 hover:scale-105 active:scale-95"
                >
                    <UserAvatar user={user} />
                </button>
            )}
        >
            {(close) => (
                <div>
                    <div className="flex items-center gap-3 px-2.5 pb-2.5 pt-1.5">
                        <UserAvatar user={user} className="h-9 w-9" />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold adm-text">{user.name || "Yönetici"}</p>
                            <p className="truncate text-xs adm-text-3">{user.email}</p>
                        </div>
                    </div>
                    <div className="my-1 h-px bg-[var(--adm-border)]" />
                    <Link href="/admin/settings" role="menuitem" onClick={close} className="adm-menu-item">
                        <Settings /> Ayarlar
                    </Link>
                    <a href="/" target="_blank" rel="noopener noreferrer" role="menuitem" onClick={close} className="adm-menu-item adm-nudge">
                        <Globe /> <span className="flex-1">Siteyi görüntüle</span> <ArrowUpRight className="adm-nudge-up" />
                    </a>
                    <div className="my-1 h-px bg-[var(--adm-border)]" />
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => signOut({ callbackUrl: "/admin/login" })}
                        className="adm-menu-item hover:!text-rose-500 [&:hover>svg]:!text-rose-500"
                    >
                        <LogOut /> Çıkış yap
                    </button>
                </div>
            )}
        </Popover>
    );
}
