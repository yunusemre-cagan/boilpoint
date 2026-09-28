import { ArrowUpRight, EyeOff } from "lucide-react";
import { buttonClass, type ButtonSize, type ButtonVariant } from "./Button";
import { cn } from "@/lib/utils";

/**
 * İçeriği sitede yeni sekmede açan düğme. Yayında olmayan içerikler sitede
 * görünmediği için düğme devre dışı kalır ve nedenini ipucunda söyler.
 */
export function ViewOnSite({
    href,
    disabled,
    disabledReason = "Taslak yazılar sitede görünmez",
    label,
    variant = "ghost",
    size = "sm",
    className,
    tipPos,
}: {
    href: string;
    disabled?: boolean;
    disabledReason?: string;
    label?: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
    tipPos?: "top" | "bottom" | "left";
}) {
    const classes = buttonClass({ variant, size, iconOnly: !label, className: cn("adm-tip adm-nudge", className) });

    if (disabled) {
        return (
            <span className={classes} aria-disabled="true" data-tip={disabledReason} data-tip-pos={tipPos} tabIndex={0}>
                {label ? <EyeOff /> : <ArrowUpRight />}
                {label && <span>{label}</span>}
            </span>
        );
    }

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={classes}
            data-tip={label ? "" : "Sitede görüntüle"}
            data-tip-pos={tipPos}
            aria-label={label ? undefined : "Sitede görüntüle"}
        >
            <ArrowUpRight className="adm-nudge-up" />
            {label && <span>{label}</span>}
        </a>
    );
}
