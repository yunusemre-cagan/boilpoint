"use client";

import { useEffect, useRef, useState } from "react";

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Değere doğru sayarak ilerleyen sayı. Değer değiştiğinde önceki değerden
 * yenisine akar. Hareket azaltma tercihi varsa doğrudan son değeri gösterir.
 */
export function AnimatedNumber({
    value,
    duration = 1100,
    format = (n) => Math.round(n).toLocaleString("tr-TR"),
    className,
}: {
    value: number;
    duration?: number;
    format?: (n: number) => string;
    className?: string;
}) {
    const [display, setDisplay] = useState(0);
    const fromRef = useRef(0);

    useEffect(() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const from = fromRef.current;
        if (reduce || from === value) {
            fromRef.current = value;
            setDisplay(value);
            return;
        }
        let raf = 0;
        const start = performance.now();
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const current = from + (value - from) * easeOutExpo(t);
            setDisplay(current);
            fromRef.current = current;
            if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [value, duration]);

    return <span className={className}>{format(display)}</span>;
}
