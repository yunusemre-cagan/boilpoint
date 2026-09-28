"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { createCategory, createTag } from "@/app/admin/actions/taxonomy";

type FormState = { error: string; success: boolean; message: string };
const initialState: FormState = { error: "", success: false, message: "" };

function SubmitButton({ label }: { label: string }) {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className="adm-btn adm-btn-primary adm-nudge shrink-0">
            {pending ? <Loader2 className="animate-spin" /> : <Plus className="adm-nudge-rot" />}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}

/** Kategori ya da etiket ekleme satırı. */
export function TaxonomyCreateForm({ kind }: { kind: "category" | "tag" }) {
    const [state, formAction] = useActionState(kind === "category" ? createCategory : createTag, initialState);
    const formRef = useRef<HTMLFormElement>(null);
    const errorRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset();
            toast.success(state.message);
        } else if (state.error) {
            errorRef.current?.animate(
                [{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(5px)" }, { transform: "translateX(0)" }],
                { duration: 320 },
            );
        }
    }, [state]);

    const label = kind === "category" ? "Kategori ekle" : "Etiket ekle";

    return (
        <form ref={formRef} action={formAction} className="space-y-2">
            <div className="flex gap-2">
                <label htmlFor={`${kind}-name`} className="sr-only">
                    {kind === "category" ? "Kategori adı" : "Etiket adı"}
                </label>
                <input
                    id={`${kind}-name`}
                    name="name"
                    required
                    minLength={2}
                    placeholder={kind === "category" ? "Yeni kategori, örn. Teknoloji" : "Yeni etiket, örn. React"}
                    aria-invalid={state.error ? true : undefined}
                    className="adm-input"
                />
                <SubmitButton label={label} />
            </div>
            {state.error && (
                <p ref={errorRef} className="flex items-center gap-1.5 text-xs text-rose-500">
                    <AlertCircle className="h-3.5 w-3.5" /> {state.error}
                </p>
            )}
        </form>
    );
}
