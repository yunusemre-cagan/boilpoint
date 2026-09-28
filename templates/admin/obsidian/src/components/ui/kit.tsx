"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/** Araç sayfalarında kullanılan standart kart. */
export function Panel({
    children,
    className,
    title,
    icon: Icon,
    action,
}: {
    children: React.ReactNode;
    className?: string;
    title?: string;
    icon?: React.ComponentType<{ className?: string }>;
    action?: React.ReactNode;
}) {
    return (
        <div className={cn("p-6 md:p-8 rounded-[2rem] glass-card border border-border/50 space-y-5", className)}>
            {(title || action) && (
                <div className="flex items-center justify-between gap-4">
                    {title && (
                        <h2 className="flex items-center gap-2 font-bold text-foreground">
                            {Icon && <Icon className="w-4 h-4 text-accent" />}
                            {title}
                        </h2>
                    )}
                    {action}
                </div>
            )}
            {children}
        </div>
    );
}

/** Etiketli form alanı. */
export function Field({
    label,
    hint,
    children,
    className,
}: {
    label: string;
    hint?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <label className={cn("block space-y-1.5", className)}>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
            {children}
            {hint && <span className="block text-xs text-muted-foreground font-light">{hint}</span>}
        </label>
    );
}

export const inputClass =
    "w-full px-4 py-3 rounded-xl bg-background/60 border border-border text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20";

export const monoClass = "font-mono text-sm";

/** Panoya kopyalama düğmesi. */
export function CopyButton({
    value,
    label,
    className,
    disabled,
}: {
    value: string;
    label?: string;
    className?: string;
    disabled?: boolean;
}) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
        } catch {
            const area = document.createElement("textarea");
            area.value = value;
            document.body.appendChild(area);
            area.select();
            document.execCommand("copy");
            document.body.removeChild(area);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };

    return (
        <button
            type="button"
            onClick={copy}
            disabled={disabled || !value}
            aria-label={label ? undefined : "Kopyala"}
            className={cn(
                "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border disabled:opacity-40 disabled:cursor-not-allowed",
                copied
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-accent/40",
                className
            )}
        >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {label && <span>{copied ? "Kopyalandı" : label}</span>}
        </button>
    );
}

/** Sekme çubuğu. */
export function Tabs<T extends string>({
    value,
    onChange,
    options,
    className,
}: {
    value: T;
    onChange: (value: T) => void;
    options: { id: T; label: string }[];
    className?: string;
}) {
    return (
        <div className={cn("flex flex-wrap gap-2 p-1.5 rounded-2xl bg-muted/50 border border-border/50", className)}>
            {options.map((option) => (
                <button
                    key={option.id}
                    type="button"
                    onClick={() => onChange(option.id)}
                    aria-pressed={value === option.id}
                    className={cn(
                        "flex-1 min-w-fit px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap",
                        value === option.id
                            ? "bg-accent text-white shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}

/** Sonuç satırı: etiket + değer + kopyala. */
export function ResultRow({
    label,
    value,
    mono = true,
    copyable = true,
}: {
    label: string;
    value: string;
    mono?: boolean;
    copyable?: boolean;
}) {
    return (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background/60 border border-border/50">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-32 shrink-0">
                {label}
            </span>
            <span className={cn("flex-1 min-w-0 break-all text-sm text-foreground", mono && "font-mono")}>{value}</span>
            {copyable && <CopyButton value={value} />}
        </div>
    );
}

/** Uyarı / bilgi kutusu. */
export function Note({
    children,
    tone = "info",
}: {
    children: React.ReactNode;
    tone?: "info" | "warn" | "success" | "error";
}) {
    const tones = {
        info: "border-blue-500/30 bg-blue-500/5 text-blue-600 dark:text-blue-400",
        warn: "border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400",
        success: "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400",
        error: "border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-400",
    };
    return (
        <div className={cn("px-4 py-3 rounded-xl border text-xs leading-relaxed font-light", tones[tone])}>
            {children}
        </div>
    );
}
