"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Undo2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DeleteButton } from "../DeleteButton";

type Action = (id: string) => Promise<unknown>;

/** Onayla / reddet / sil düğmeleri (yorumlar ve ziyaretçi defteri). */
export function ModerationActions({
    id,
    status,
    approve,
    reject,
    remove,
}: {
    id: string;
    status: string;
    approve: Action;
    reject: Action;
    remove: Action;
}) {
    const [isPending, startTransition] = useTransition();
    const [running, setRunning] = useState<"approve" | "reject" | null>(null);

    const run = (kind: "approve" | "reject", fn: Action, message: string) => {
        setRunning(kind);
        startTransition(async () => {
            try {
                const result = (await fn(id)) as { error?: string } | undefined;
                if (result?.error) toast.error(result.error);
                else toast.success(message);
            } catch {
                toast.error("İşlem tamamlanamadı.");
            } finally {
                setRunning(null);
            }
        });
    };

    return (
        <div className="flex shrink-0 items-center gap-1">
            {status !== "approved" && (
                <button
                    type="button"
                    disabled={isPending}
                    onClick={() => run("approve", approve, "Onaylandı ve yayına alındı")}
                    className="adm-btn adm-btn-sm bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
                >
                    {running === "approve" ? <Loader2 className="animate-spin" /> : <Check />}
                    Onayla
                </button>
            )}
            {status !== "rejected" && (
                <button
                    type="button"
                    disabled={isPending}
                    onClick={() => run("reject", reject, status === "approved" ? "Yayından kaldırıldı" : "Reddedildi")}
                    className={cn("adm-btn adm-btn-ghost adm-btn-sm adm-tip", status === "approved" && "adm-btn-icon")}
                    data-tip={status === "approved" ? "Yayından kaldır" : ""}
                    aria-label={status === "approved" ? "Yayından kaldır" : "Reddet"}
                >
                    {running === "reject" ? <Loader2 className="animate-spin" /> : status === "approved" ? <Undo2 /> : <X />}
                    {status !== "approved" && "Reddet"}
                </button>
            )}
            <DeleteButton id={id} action={remove} title="Kalıcı olarak sil" successMessage="Silindi" />
        </div>
    );
}
