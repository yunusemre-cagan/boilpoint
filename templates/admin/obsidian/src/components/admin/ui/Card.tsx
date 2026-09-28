import { cn } from "@/lib/utils";

type IconType = React.ComponentType<{ className?: string }>;

export function Card({
    className,
    interactive,
    enter,
    style,
    children,
    as: Tag = "div",
}: {
    className?: string;
    interactive?: boolean;
    /** Sayfa açılışında kademeli belirme sırası (kaydırmaya bağlı değildir) */
    enter?: number;
    style?: React.CSSProperties;
    children: React.ReactNode;
    as?: "div" | "section" | "article";
}) {
    return (
        <Tag
            className={cn("adm-card", interactive && "adm-card-interactive", enter !== undefined && "adm-enter", className)}
            style={enter !== undefined ? ({ "--i": enter, ...style } as React.CSSProperties) : style}
        >
            {children}
        </Tag>
    );
}

export function CardHeader({
    icon: Icon,
    title,
    description,
    action,
    className,
}: {
    icon?: IconType;
    title: React.ReactNode;
    description?: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6", className)}>
            <div className="flex min-w-0 items-center gap-3">
                {Icon && (
                    <span className="adm-icon-tile h-9 w-9 rounded-[0.7rem]">
                        <Icon className="h-[1.05rem] w-[1.05rem]" />
                    </span>
                )}
                <div className="min-w-0">
                    <h2 className="truncate text-[0.95rem] font-semibold tracking-tight adm-text">{title}</h2>
                    {description && <p className="mt-0.5 text-xs adm-text-3">{description}</p>}
                </div>
            </div>
            {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        </div>
    );
}
