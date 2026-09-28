import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger" | "info";

export function Badge({
    tone = "neutral",
    dot,
    pulse,
    className,
    children,
}: {
    tone?: BadgeTone;
    dot?: boolean;
    pulse?: boolean;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <span className={cn("adm-badge", className)} data-tone={tone}>
            {dot && <span className={cn("adm-dot", pulse && "adm-dot-pulse")} aria-hidden />}
            {children}
        </span>
    );
}

/** Yazı/proje yayın durumu için hazır rozet. */
export function StatusBadge({ published, draftLabel = "Taslak" }: { published: boolean; draftLabel?: string }) {
    return published ? (
        <Badge tone="success" dot>
            Yayında
        </Badge>
    ) : (
        <Badge tone="warning" dot>
            {draftLabel}
        </Badge>
    );
}
