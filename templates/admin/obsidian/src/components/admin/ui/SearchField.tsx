"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useListNav } from "./ListNav";

/**
 * Adres çubuğundaki bir parametreye bağlı arama kutusu. Yazmayı bıraktıktan
 * kısa süre sonra sunucu tarafı listeyi günceller ve sayfayı başa alır.
 * "/" tuşu kutuya odaklanır.
 */
export function SearchField({
    param = "q",
    pageParam = "page",
    placeholder = "Ara…",
    className,
    shortcut = true,
}: {
    param?: string;
    pageParam?: string;
    placeholder?: string;
    className?: string;
    shortcut?: boolean;
}) {
    const { navigate, isPending } = useListNav();
    const searchParams = useSearchParams();
    const urlValue = searchParams.get(param) ?? "";
    const [value, setValue] = useState(urlValue);
    const lastPushed = useRef(urlValue);
    const inputRef = useRef<HTMLInputElement>(null);

    // Adres dışarıdan değişirse (ör. filtre temizlendi) kutuyu eşitle
    useEffect(() => {
        if (urlValue !== lastPushed.current) {
            lastPushed.current = urlValue;
            setValue(urlValue);
        }
    }, [urlValue]);

    useEffect(() => {
        const trimmed = value.trim();
        if (trimmed === lastPushed.current.trim()) return;
        const timer = setTimeout(() => {
            lastPushed.current = trimmed;
            navigate({ [param]: trimmed || null, [pageParam]: null });
        }, 350);
        return () => clearTimeout(timer);
    }, [value, navigate, param, pageParam]);

    useEffect(() => {
        if (!shortcut) return;
        const onKey = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (e.key !== "/" || target.closest("input, textarea, select, [contenteditable=true]")) return;
            e.preventDefault();
            inputRef.current?.focus();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [shortcut]);

    return (
        <div className={cn("adm-field-icon group relative", className)}>
            {isPending ? <Loader2 className="animate-spin !text-[var(--adm-accent)]" /> : <Search />}
            <input
                ref={inputRef}
                type="search"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Escape" && value) {
                        e.stopPropagation();
                        setValue("");
                    }
                }}
                placeholder={placeholder}
                aria-label={placeholder}
                className="adm-input pr-16 [&::-webkit-search-cancel-button]:hidden"
            />
            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                {value ? (
                    <button
                        type="button"
                        onClick={() => {
                            setValue("");
                            inputRef.current?.focus();
                        }}
                        className="adm-pop-in inline-flex h-6 w-6 items-center justify-center rounded-md adm-text-3 transition-colors hover:bg-[var(--adm-surface-2)] hover:text-[var(--adm-text)]"
                        aria-label="Aramayı temizle"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                ) : (
                    shortcut && <kbd className="adm-kbd hidden transition-opacity group-focus-within:opacity-0 sm:inline-flex">/</kbd>
                )}
            </div>
        </div>
    );
}
