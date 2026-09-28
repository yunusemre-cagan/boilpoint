import { cn } from "@/lib/utils";

type IconType = React.ComponentType<{ className?: string }>;

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
    compact,
}: {
    icon: IconType;
    title: string;
    description?: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
    compact?: boolean;
}) {
    return (
        <div className={cn("flex flex-col items-center justify-center text-center", compact ? "px-4 py-10" : "px-6 py-16", className)}>
            <div className="relative mb-4">
                <span className="absolute inset-0 -z-10 scale-150 rounded-full bg-[radial-gradient(circle,var(--adm-accent-soft),transparent_70%)]" aria-hidden />
                <span className="adm-icon-tile adm-float h-14 w-14 rounded-2xl">
                    <Icon className="h-6 w-6" />
                </span>
            </div>
            <h3 className="text-[0.95rem] font-semibold adm-text">{title}</h3>
            {description && <p className="mt-1 max-w-sm text-sm adm-text-3">{description}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}
