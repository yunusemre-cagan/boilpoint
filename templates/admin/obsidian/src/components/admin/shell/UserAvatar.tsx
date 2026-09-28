import { cn } from "@/lib/utils";
import type { AdminUser } from "./AdminUIContext";

export function initialsOf(name: string | null | undefined, email?: string | null) {
    const source = (name || email || "A").trim();
    const parts = source.split(/\s+/).filter(Boolean);
    const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : source.slice(0, 2);
    return letters.toLocaleUpperCase("tr-TR");
}

export function UserAvatar({ user, className }: { user: AdminUser; className?: string }) {
    return (
        <span
            aria-hidden
            className={cn(
                "relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.65rem] text-[0.7rem] font-bold tracking-wide text-white",
                "shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_4px_12px_-4px_rgb(99_102_241/0.7)]",
                className,
            )}
            style={{ background: "var(--adm-grad)" }}
        >
            {initialsOf(user.name, user.email)}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--adm-surface)] bg-emerald-500" />
        </span>
    );
}
