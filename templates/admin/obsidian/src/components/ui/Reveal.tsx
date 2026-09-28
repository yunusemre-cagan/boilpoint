"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * İçeriği görünür alana girdiğinde yumuşakça belirtir.
 *
 * Hareket duyarlılığı açık olan kullanıcılarda (prefers-reduced-motion)
 * animasyon uygulanmaz; içerik doğrudan görünür olur.
 */
export function Reveal({
    children,
    delay = 0,
    className,
}: {
    children: React.ReactNode;
    /** Kademeli giriş için milisaniye cinsinden gecikme */
    delay?: number;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // Hareket azaltma tercihi varsa doğrudan göster
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setVisible(true);
            return;
        }

        // IntersectionObserver yoksa (çok eski tarayıcı) içeriği gizli bırakma
        if (typeof IntersectionObserver === "undefined") {
            setVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setVisible(true);
                        observer.disconnect();
                    }
                }
            },
            { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            style={visible && delay ? { transitionDelay: `${delay}ms` } : undefined}
            className={cn(
                "transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:translate-y-0 motion-reduce:opacity-100",
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5",
                className
            )}
        >
            {children}
        </div>
    );
}
