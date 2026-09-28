"use client";

import { createContext, useCallback, useContext, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type Updates = Record<string, string | number | null | undefined>;

type ListNavValue = {
    isPending: boolean;
    /** Mevcut adres parametrelerine güncellemeleri uygulayıp oluşan adresi döndürür */
    hrefFor: (updates: Updates) => string;
    /** Sunucu tarafı listeyi yeni parametrelerle yeniden getirir (eski liste beklerken soluklaşır) */
    navigate: (updates: Updates) => void;
};

const ListNavContext = createContext<ListNavValue | null>(null);

/**
 * Sunucu tarafında sayfalanan listeler için adres (search param) tabanlı gezinme.
 * Arama, filtre ve sayfa değişiklikleri bir transition içinde yapılır; yeni veri
 * gelene kadar eski liste yerinde kalır ve üstte ince bir ilerleme çubuğu akar.
 */
export function ListNav({ children, className }: { children: React.ReactNode; className?: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const hrefFor = useCallback(
        (updates: Updates) => {
            const params = new URLSearchParams(searchParams.toString());
            for (const [key, value] of Object.entries(updates)) {
                if (value === null || value === undefined || value === "") params.delete(key);
                else params.set(key, String(value));
            }
            const query = params.toString();
            return query ? `${pathname}?${query}` : pathname;
        },
        [pathname, searchParams],
    );

    const navigate = useCallback(
        (updates: Updates) => {
            startTransition(() => router.push(hrefFor(updates), { scroll: false }));
        },
        [router, hrefFor],
    );

    return (
        <ListNavContext.Provider value={{ isPending, hrefFor, navigate }}>
            <div className={cn("adm-listnav relative", className)} data-pending={isPending || undefined} aria-busy={isPending}>
                {children}
            </div>
        </ListNavContext.Provider>
    );
}

export function useListNav() {
    const value = useContext(ListNavContext);
    if (!value) throw new Error("useListNav, <ListNav> içinde kullanılmalı");
    return value;
}

/** Bekleme sırasında soluklaşan liste gövdesi. */
export function ListNavBody({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("adm-listnav-body", className)}>{children}</div>;
}

/** Bekleme sırasında akan ince ilerleme çubuğu (üst öğe relative olmalı). */
export function ListProgress({ className }: { className?: string }) {
    return <div aria-hidden className={cn("adm-progress", className)} />;
}
