"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/** Güneş/ay arasında dönerek geçiş yapan tema düğmesi. */
export function AdminThemeToggle({ className }: { className?: string }) {
    const { resolvedTheme, setTheme } = useTheme();

    const toggle = () => {
        const root = document.documentElement;
        root.classList.add("theme-transitioning");
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
        setTimeout(() => root.classList.remove("theme-transitioning"), 400);
    };

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label="Temayı değiştir"
            data-tip="Temayı değiştir"
            data-tip-pos="bottom"
            className={cn("adm-btn adm-btn-ghost adm-btn-icon adm-tip relative overflow-hidden", className)}
        >
            <Sun className="absolute rotate-0 scale-100 opacity-100 transition-all duration-500 [transition-timing-function:var(--adm-spring)] dark:-rotate-90 dark:scale-50 dark:opacity-0" />
            <Moon className="absolute rotate-90 scale-50 opacity-0 transition-all duration-500 [transition-timing-function:var(--adm-spring)] dark:rotate-0 dark:scale-100 dark:opacity-100" />
        </button>
    );
}
