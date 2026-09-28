"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Yaylı başparmaklı açma/kapama anahtarı. `name` verilirse form ile birlikte
 * "true"/"false" değeri gönderen gizli bir alan da oluşturur.
 */
export function Switch({
    checked,
    onChange,
    name,
    label,
    description,
    disabled,
    className,
}: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    name?: string;
    label?: React.ReactNode;
    description?: React.ReactNode;
    disabled?: boolean;
    className?: string;
}) {
    const id = useId();

    const control = (
        <button
            id={id}
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className="adm-switch disabled:cursor-not-allowed disabled:opacity-50"
        >
            <span className="adm-switch-thumb" />
        </button>
    );

    return (
        <>
            {name && <input type="hidden" name={name} value={checked ? "true" : "false"} />}
            {label ? (
                <div className={cn("flex items-center justify-between gap-4", className)}>
                    <label htmlFor={id} className="min-w-0 cursor-pointer select-none">
                        <span className="block text-sm font-medium adm-text">{label}</span>
                        {description && <span className="mt-0.5 block text-xs adm-text-3">{description}</span>}
                    </label>
                    {control}
                </div>
            ) : (
                control
            )}
        </>
    );
}
