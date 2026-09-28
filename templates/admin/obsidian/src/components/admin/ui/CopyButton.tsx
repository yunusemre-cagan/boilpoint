"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/** Panoya kopyalar; kopyalanınca ikon onay işaretine dönüşür. */
export function CopyButton({
    value,
    label,
    tip = "Bağlantıyı kopyala",
    className,
    size = "sm",
    variant = "ghost",
}: {
    value: string;
    label?: string;
    tip?: string;
    className?: string;
    size?: "sm" | "md";
    variant?: "ghost" | "secondary";
}) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            // Göreli adresleri tam adrese çevir
            const text = value.startsWith("/") ? `${window.location.origin}${value}` : value;
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
        } catch {
            /* pano izni yoksa sessizce geç */
        }
    };

    return (
        <button
            type="button"
            onClick={copy}
            data-tip={label ? "" : copied ? "Kopyalandı" : tip}
            aria-label={tip}
            className={cn(
                "adm-btn adm-tip",
                variant === "ghost" ? "adm-btn-ghost" : "adm-btn-secondary",
                size === "sm" && "adm-btn-sm",
                !label && "adm-btn-icon",
                copied && "!text-emerald-600 dark:!text-emerald-400",
                className,
            )}
        >
            {copied ? <Check key="ok" className="adm-pop-in" /> : <Copy key="copy" />}
            {label && <span>{copied ? "Kopyalandı" : label}</span>}
        </button>
    );
}
