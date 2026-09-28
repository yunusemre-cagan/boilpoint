import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type IconType = React.ComponentType<{ className?: string }>;

export function PageHeader({
    icon: Icon,
    eyebrow,
    title,
    description,
    actions,
    back,
    className,
}: {
    icon?: IconType;
    eyebrow?: React.ReactNode;
    title: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
    back?: { href: string; label: string };
    className?: string;
}) {
    return (
        <header className={cn("flex flex-col gap-5 md:flex-row md:items-end md:justify-between", className)}>
            <div className="flex min-w-0 items-start gap-4">
                {back ? (
                    <Link
                        href={back.href}
                        className="adm-btn adm-btn-secondary adm-btn-icon adm-tip group mt-0.5 shrink-0"
                        data-tip={back.label}
                        data-tip-pos="bottom"
                        aria-label={back.label}
                    >
                        <ArrowLeft className="transition-transform duration-300 group-hover:-translate-x-0.5" />
                    </Link>
                ) : (
                    Icon && (
                        <span className="adm-icon-tile mt-0.5 hidden h-11 w-11 rounded-[0.9rem] sm:inline-flex">
                            <Icon className="h-5 w-5" />
                        </span>
                    )
                )}
                <div className="min-w-0">
                    {eyebrow && (
                        <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] adm-accent-text">{eyebrow}</p>
                    )}
                    <h1 className="text-2xl font-semibold tracking-tight adm-text sm:text-[1.7rem]">{title}</h1>
                    {description && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed adm-text-2">{description}</p>}
                </div>
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
    );
}
