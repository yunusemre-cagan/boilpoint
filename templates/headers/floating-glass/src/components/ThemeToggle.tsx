"use client";

import * as React from "react";
import { Moon, Sun, Monitor, Check } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        setMounted(true);
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!mounted) {
        return <div className="w-9 h-9" />;
    }

    const currentTheme = theme || "system";

    const handleSetTheme = (newTheme: string) => {
        setTheme(newTheme);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="relative inline-flex items-center justify-center p-2 rounded-full bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors outline-none"
                aria-label="Toggle theme"
            >
                <Sun className="h-4 w-4 dark:hidden" />
                <Moon className="h-4 w-4 hidden dark:block" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-36 rounded-2xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                    <button
                        type="button"
                        onClick={() => handleSetTheme("light")}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs rounded-xl transition-colors ${currentTheme === "light" ? "bg-accent/10 text-accent font-semibold" : "text-foreground/80 hover:bg-muted"}`}
                    >
                        <div className="flex items-center gap-2">
                            <Sun className="h-3.5 w-3.5" />
                            <span>Aydınlık</span>
                        </div>
                        {currentTheme === "light" && <Check className="h-3.5 w-3.5" />}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSetTheme("dark")}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs rounded-xl transition-colors ${currentTheme === "dark" ? "bg-accent/10 text-accent font-semibold" : "text-foreground/80 hover:bg-muted"}`}
                    >
                        <div className="flex items-center gap-2">
                            <Moon className="h-3.5 w-3.5" />
                            <span>Karanlık</span>
                        </div>
                        {currentTheme === "dark" && <Check className="h-3.5 w-3.5" />}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSetTheme("system")}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs rounded-xl transition-colors ${currentTheme === "system" ? "bg-accent/10 text-accent font-semibold" : "text-foreground/80 hover:bg-muted"}`}
                    >
                        <div className="flex items-center gap-2">
                            <Monitor className="h-3.5 w-3.5" />
                            <span>Sistem</span>
                        </div>
                        {currentTheme === "system" && <Check className="h-3.5 w-3.5" />}
                    </button>
                </div>
            )}
        </div>
    );
}
