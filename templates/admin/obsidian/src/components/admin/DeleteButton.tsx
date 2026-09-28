"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ActionResult = { error?: string; success?: boolean } | void | undefined | null;

interface DeleteButtonProps {
    id: string;
    action: (id: string) => Promise<ActionResult | unknown>;
    /** İpucu ve erişilebilir ad */
    title?: string;
    /** Düğmede görünen metin (verilmezse yalnızca ikon) */
    label?: string;
    /** Onay adımındaki metin */
    confirmLabel?: string;
    /** Başarılı silmeden sonra gösterilecek bildirim */
    successMessage?: string;
    size?: "sm" | "md";
    /** Görsel üstünde (koyu zemin) kullanılan varyant */
    tone?: "default" | "overlay";
    className?: string;
    onDeleted?: () => void;
}

/**
 * İki adımlı silme düğmesi: ilk tıklamada kırmızıya döner ve "Emin misin?"
 * diye sorar; birkaç saniye içinde ikinci tıklama gelmezse eski haline döner.
 */
export function DeleteButton({
    id,
    action,
    title = "Sil",
    label,
    confirmLabel = "Emin misin?",
    successMessage,
    size = "sm",
    tone = "default",
    className,
    onDeleted,
}: DeleteButtonProps) {
    const [armed, setArmed] = useState(false);
    const [isPending, startTransition] = useTransition();
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => () => {
        if (timer.current) clearTimeout(timer.current);
    }, []);

    const disarm = () => {
        if (timer.current) clearTimeout(timer.current);
        setArmed(false);
    };

    const onClick = () => {
        if (isPending) return;
        if (!armed) {
            setArmed(true);
            timer.current = setTimeout(() => setArmed(false), 3200);
            return;
        }
        disarm();
        startTransition(async () => {
            try {
                const result = (await action(id)) as ActionResult;
                if (result && typeof result === "object" && result.error) {
                    toast.error(result.error);
                    return;
                }
                if (successMessage) toast.success(successMessage);
                onDeleted?.();
            } catch {
                toast.error("İşlem tamamlanamadı. Lütfen tekrar deneyin.");
            }
        });
    };

    const showText = armed || !!label;

    return (
        <button
            type="button"
            onClick={onClick}
            onBlur={() => armed && disarm()}
            disabled={isPending}
            aria-label={armed ? `${title}: onaylamak için tekrar tıklayın` : title}
            data-tip={armed || label ? "" : title}
            className={cn(
                "adm-btn adm-tip overflow-hidden",
                size === "sm" ? "adm-btn-sm" : "",
                !showText && "adm-btn-icon",
                tone === "overlay"
                    ? armed
                        ? "bg-rose-600 text-white"
                        : "bg-black/35 text-white hover:bg-rose-600"
                    : armed
                      ? "adm-btn-danger"
                      : "adm-btn-ghost hover:!bg-rose-500/10 hover:!text-rose-600 dark:hover:!text-rose-400",
                className,
            )}
        >
            {isPending ? (
                <Loader2 className="animate-spin" />
            ) : (
                <Trash2 className={cn(armed && "adm-pop-in")} />
            )}
            {showText && <span className={cn(armed && "adm-pop-in")}>{armed ? confirmLabel : label}</span>}
            {armed && (
                <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-white/70"
                    style={{ animation: "adm-armed 3.2s linear forwards" }}
                />
            )}
        </button>
    );
}
