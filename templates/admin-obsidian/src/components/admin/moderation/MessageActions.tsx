"use client";

import { useTransition } from "react";
import { CheckCheck, Loader2, Reply } from "lucide-react";
import { toast } from "sonner";
import { deleteMessage, markAsRead } from "@/app/admin/actions/messages";
import { DeleteButton } from "../DeleteButton";

export function MessageActions({ id, isRead, email, subject }: { id: string; isRead: boolean; email: string; subject?: string | null }) {
    const [isPending, startTransition] = useTransition();
    const replySubject = encodeURIComponent(`Re: ${subject || "Mesajınız"}`);

    return (
        <div className="flex shrink-0 items-center gap-1">
            <a href={`mailto:${email}?subject=${replySubject}`} className="adm-btn adm-btn-soft adm-btn-sm adm-nudge">
                <Reply className="adm-nudge-x" /> Yanıtla
            </a>
            {!isRead && (
                <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                        startTransition(async () => {
                            await markAsRead(id);
                            toast.success("Okundu olarak işaretlendi");
                        })
                    }
                    className="adm-btn adm-btn-ghost adm-btn-sm adm-btn-icon adm-tip"
                    data-tip="Okundu işaretle"
                    aria-label="Okundu işaretle"
                >
                    {isPending ? <Loader2 className="animate-spin" /> : <CheckCheck />}
                </button>
            )}
            <DeleteButton id={id} action={deleteMessage} title="Mesajı sil" successMessage="Mesaj silindi" />
        </div>
    );
}
