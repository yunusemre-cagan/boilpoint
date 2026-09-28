"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search, Sparkles } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

export interface NavItem {
    label: string;
    href: string;
}

export interface NavbarProps {
    brand?: {
        name: string;
        href?: string;
        logoNode?: React.ReactNode;
    };
    navItems?: NavItem[];
    showSearch?: boolean;
    showThemeToggle?: boolean;
    onSearchClick?: () => void;
    className?: string;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
    { label: "Ana Sayfa", href: "/" },
    { label: "Hakkımda", href: "/hakkimda" },
    { label: "Blog", href: "/blog" },
    { label: "Projeler", href: "/projeler" },
    { label: "Araçlar", href: "/araclar" },
    { label: "İletişim", href: "/iletisim" },
];

export function Navbar({
    brand = { name: "Boilpoint", href: "/" },
    navItems = DEFAULT_NAV_ITEMS,
    showSearch = true,
    showThemeToggle = true,
    onSearchClick,
    className,
}: NavbarProps) {
    const [isScrolled, setIsScrolled] = React.useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const pathname = usePathname();

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Sayfa değiştiğinde mobil menüyü otomatik kapat
    React.useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <header
            className={cn(
                "fixed top-0 inset-x-0 z-50 transition-all duration-500",
                isScrolled ? "py-3.5 opacity-100" : "py-5",
                className
            )}
        >
            <div
                className={cn(
                    "container mx-auto px-4 md:px-6 transition-all duration-500",
                    isScrolled ? "max-w-5xl" : "max-w-6xl"
                )}
            >
                <div
                    className={cn(
                        "flex items-center justify-between gap-3 rounded-full px-4 md:px-5 transition-all duration-500",
                        isScrolled
                            ? "py-2.5 border border-border/70 bg-background/80 dark:bg-zinc-950/80 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20"
                            : "py-2 bg-transparent border border-transparent"
                    )}
                >
                    {/* Brand / Logo */}
                    <Link
                        href={brand.href || "/"}
                        className="text-lg font-bold tracking-tight hover:opacity-85 transition-opacity flex items-center gap-2.5 group shrink-0"
                    >
                        {brand.logoNode ? (
                            brand.logoNode
                        ) : (
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 font-bold text-white shadow-md shadow-indigo-500/25">
                                B
                            </span>
                        )}
                        <span className="font-extrabold tracking-tight text-foreground">
                            {brand.name}
                        </span>
                    </Link>

                    {/* Desktop Pill Navigation */}
                    <nav className="hidden lg:flex items-center gap-1 bg-muted/60 dark:bg-muted/30 border border-border/30 rounded-full px-2 py-1">
                        <ul className="flex items-center gap-1">
                            {navItems.map((item) => {
                                const isActive =
                                    pathname === item.href ||
                                    (item.href !== "/" && pathname?.startsWith(item.href));
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "relative px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-300 rounded-full group",
                                                isActive
                                                    ? "text-accent-foreground font-semibold"
                                                    : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            {isActive && (
                                                <span className="absolute inset-0 bg-accent rounded-full -z-10 shadow-sm" />
                                            )}
                                            <span className="relative z-10">{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Actions: Search & Theme Toggle */}
                    <div className="hidden lg:flex items-center gap-2.5 shrink-0">
                        {showSearch && (
                            <button
                                type="button"
                                onClick={onSearchClick || (() => window.dispatchEvent(new CustomEvent("open-cmdk")))}
                                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-full transition-colors flex items-center gap-2 group"
                                aria-label="Arama Yap"
                            >
                                <Search className="w-4 h-4" />
                                <span className="text-[0.65rem] font-bold font-mono bg-muted/80 text-muted-foreground py-0.5 px-1.5 rounded-md group-hover:bg-muted transition-colors border border-border/40">
                                    ⌘K
                                </span>
                            </button>
                        )}
                        {showThemeToggle && <ThemeToggle />}
                    </div>

                    {/* Mobile Menu Toggle Button */}
                    <div className="flex items-center gap-1.5 lg:hidden">
                        {showSearch && (
                            <button
                                type="button"
                                onClick={onSearchClick || (() => window.dispatchEvent(new CustomEvent("open-cmdk")))}
                                className="p-2 text-foreground rounded-full hover:bg-muted transition-colors"
                                aria-label="Arama Yap"
                            >
                                <Search className="w-4 h-4" />
                            </button>
                        )}
                        {showThemeToggle && <ThemeToggle />}
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-foreground rounded-full hover:bg-muted transition-colors focus:bg-muted outline-none"
                            aria-label="Menüyü Aç/Kapat"
                            aria-expanded={isMobileMenuOpen}
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown Drawer */}
            <div
                className={cn(
                    "absolute top-full left-0 right-0 max-w-5xl mx-auto px-4 mt-2 transition-all duration-300 lg:hidden",
                    isMobileMenuOpen
                        ? "opacity-100 translate-y-0 visible"
                        : "opacity-0 -translate-y-4 invisible pointer-events-none"
                )}
            >
                <div className="rounded-3xl p-5 shadow-2xl border border-border/60 bg-background/95 dark:bg-zinc-950/95 backdrop-blur-2xl flex flex-col gap-3">
                    <nav>
                        <ul className="flex flex-col gap-1">
                            {navItems.map((item) => {
                                const isActive =
                                    pathname === item.href ||
                                    (item.href !== "/" && pathname?.startsWith(item.href));
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "block px-4 py-2.5 rounded-2xl text-sm font-medium transition-all",
                                                isActive
                                                    ? "bg-accent text-accent-foreground font-semibold"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                            )}
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </div>
            </div>
        </header>
    );
}
