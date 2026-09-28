"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { Command } from "cmdk";
import * as RadixDialog from "@radix-ui/react-dialog";
import { Briefcase, CornerDownLeft, Globe, LogOut, PenLine, Search, SunMoon } from "lucide-react";
import { useAdminUI } from "./AdminUIContext";
import { NAV_SECTIONS } from "./nav";
import { SIDEBAR_MODE_OPTIONS } from "./SidebarModeControl";

const itemClass =
    "group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm adm-text-2 transition-colors duration-150 " +
    "data-[selected=true]:bg-[var(--adm-accent-soft)] data-[selected=true]:text-[var(--adm-text)]";

const iconClass =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--adm-border)] bg-[var(--adm-surface-2)] adm-text-3 transition-all duration-200 " +
    "group-data-[selected=true]:scale-105 group-data-[selected=true]:border-transparent group-data-[selected=true]:text-white group-data-[selected=true]:[background:var(--adm-grad)]";

const groupClass =
    "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[0.68rem] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.12em] [&_[cmdk-group-heading]]:text-[var(--adm-text-3)]";

/** ⌘K / Ctrl+K ile açılan hızlı gezinme ve eylem paleti. */
export function AdminCommandPalette() {
    const router = useRouter();
    const { commandOpen, setCommandOpen, setSidebarMode, sidebarMode } = useAdminUI();
    const { resolvedTheme, setTheme } = useTheme();

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setCommandOpen(!commandOpen);
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [commandOpen, setCommandOpen]);

    const run = (fn: () => void) => {
        setCommandOpen(false);
        // Pencere kapanma animasyonuna fırsat ver
        setTimeout(fn, 60);
    };

    return (
        <RadixDialog.Root open={commandOpen} onOpenChange={setCommandOpen}>
            <RadixDialog.Portal>
                <RadixDialog.Overlay className="adm-overlay adm-portal" />
                <RadixDialog.Content
                    className="adm-dialog adm-palette adm-elevated adm-portal overflow-hidden rounded-[1.25rem] p-0"
                    style={{ "--dialog-w": "38rem" } as React.CSSProperties}
                >
                    <RadixDialog.Title className="sr-only">Komut paleti</RadixDialog.Title>
                    <RadixDialog.Description className="sr-only">Sayfa veya eylem arayın</RadixDialog.Description>
                    <Command loop className="flex max-h-[min(70vh,32rem)] flex-col">
                        <div className="flex items-center gap-3 border-b border-[var(--adm-border)] px-4">
                            <Search className="h-4 w-4 shrink-0 text-[var(--adm-accent)]" />
                            <Command.Input
                                autoFocus
                                placeholder="Sayfa ya da eylem ara…"
                                className="h-14 w-full bg-transparent text-[0.95rem] outline-none placeholder:text-[var(--adm-text-3)] adm-text"
                            />
                            <kbd className="adm-kbd">Esc</kbd>
                        </div>
                        <Command.List className="min-h-0 flex-1 overflow-y-auto p-2 [scrollbar-width:thin]">
                            <Command.Empty className="px-3 py-10 text-center text-sm adm-text-3">Sonuç bulunamadı.</Command.Empty>

                            <Command.Group heading="Eylemler" className={groupClass}>
                                <Command.Item value="Yeni yazı oluştur" keywords={["blog", "yaz"]} onSelect={() => run(() => router.push("/admin/posts/new"))} className={itemClass}>
                                    <span className={iconClass}><PenLine className="h-4 w-4" /></span>
                                    <span className="flex-1">Yeni yazı oluştur</span>
                                </Command.Item>
                                <Command.Item value="Yeni proje ekle" onSelect={() => run(() => router.push("/admin/projects/new"))} className={itemClass}>
                                    <span className={iconClass}><Briefcase className="h-4 w-4" /></span>
                                    <span className="flex-1">Yeni proje ekle</span>
                                </Command.Item>
                                <Command.Item value="Siteyi görüntüle" keywords={["site", "ana sayfa", "önizle"]} onSelect={() => run(() => window.open("/", "_blank", "noopener"))} className={itemClass}>
                                    <span className={iconClass}><Globe className="h-4 w-4" /></span>
                                    <span className="flex-1">Siteyi görüntüle</span>
                                    <span className="text-xs adm-text-3">Yeni sekme</span>
                                </Command.Item>
                                <Command.Item
                                    value="Temayı değiştir"
                                    keywords={["karanlık", "aydınlık", "dark", "light"]}
                                    onSelect={() => run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))}
                                    className={itemClass}
                                >
                                    <span className={iconClass}><SunMoon className="h-4 w-4" /></span>
                                    <span className="flex-1">Temayı değiştir</span>
                                    <span className="text-xs adm-text-3">{resolvedTheme === "dark" ? "Aydınlık" : "Karanlık"}</span>
                                </Command.Item>
                            </Command.Group>

                            {NAV_SECTIONS.map((section) => (
                                <Command.Group key={section.title} heading={section.title} className={groupClass}>
                                    {section.items.map((item) => (
                                        <Command.Item
                                            key={item.href}
                                            value={item.name}
                                            keywords={item.keywords?.split(" ")}
                                            onSelect={() => run(() => router.push(item.href))}
                                            className={itemClass}
                                        >
                                            <span className={iconClass}><item.icon className="h-4 w-4" /></span>
                                            <span className="flex-1">{item.name}</span>
                                            <CornerDownLeft className="h-3.5 w-3.5 opacity-0 transition-opacity group-data-[selected=true]:opacity-60" />
                                        </Command.Item>
                                    ))}
                                </Command.Group>
                            ))}

                            <Command.Group heading="Kenar çubuğu" className={groupClass}>
                                {SIDEBAR_MODE_OPTIONS.map((option) => (
                                    <Command.Item
                                        key={option.value}
                                        value={`Kenar çubuğu: ${option.label}`}
                                        keywords={["menü", "sidebar"]}
                                        onSelect={() => run(() => setSidebarMode(option.value))}
                                        className={itemClass}
                                    >
                                        <span className={iconClass}><option.icon className="h-4 w-4" /></span>
                                        <span className="flex-1">Kenar çubuğu: {option.label}</span>
                                        {sidebarMode === option.value && <span className="adm-badge" data-tone="accent">Aktif</span>}
                                    </Command.Item>
                                ))}
                            </Command.Group>

                            <Command.Group heading="Hesap" className={groupClass}>
                                <Command.Item value="Çıkış yap" onSelect={() => run(() => signOut({ callbackUrl: "/admin/login" }))} className={itemClass}>
                                    <span className={iconClass}><LogOut className="h-4 w-4" /></span>
                                    <span className="flex-1">Çıkış yap</span>
                                </Command.Item>
                            </Command.Group>
                        </Command.List>
                        <div className="flex items-center gap-4 border-t border-[var(--adm-border)] px-4 py-2.5 text-[0.7rem] adm-text-3">
                            <span className="flex items-center gap-1.5"><kbd className="adm-kbd">↑</kbd><kbd className="adm-kbd">↓</kbd> gezin</span>
                            <span className="flex items-center gap-1.5"><kbd className="adm-kbd">↵</kbd> seç</span>
                        </div>
                    </Command>
                </RadixDialog.Content>
            </RadixDialog.Portal>
        </RadixDialog.Root>
    );
}
