"use client";

import { useRef, useState } from "react";
import { ExternalLink, ImageUp, Loader2, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { IMAGE_ACCEPT, uploadImage } from "./upload";

/**
 * Sürükle-bırak destekli tek görsel alanı. Seçilen görsel /api/upload ile
 * yüklenir ve adresi `name` adlı gizli alanla forma eklenir.
 */
export function ImageDropzone({
    name,
    value,
    onChange,
    aspect = "video",
    hint = "JPG, PNG, WebP veya GIF · en fazla 5 MB",
    contain,
    onGenerate,
    generating,
}: {
    name: string;
    value: string;
    onChange: (url: string) => void;
    aspect?: "video" | "wide" | "square";
    hint?: string;
    /** Görseli kırpmadan göster (logolar, detay kapakları) */
    contain?: boolean;
    /** Verilirse "AI ile oluştur" düğmesi gösterilir */
    onGenerate?: () => void;
    generating?: boolean;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [dragging, setDragging] = useState(false);

    const upload = async (file: File) => {
        setUploading(true);
        try {
            onChange(await uploadImage(file));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Yükleme başarısız oldu.");
        } finally {
            setUploading(false);
        }
    };

    const busy = uploading || generating;
    const aspectClass = aspect === "square" ? "aspect-square" : aspect === "wide" ? "aspect-[2/1]" : "aspect-video";

    return (
        <div>
            <input type="hidden" name={name} value={value} />
            <input
                ref={inputRef}
                type="file"
                accept={IMAGE_ACCEPT}
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) upload(file);
                    e.target.value = "";
                }}
            />

            {value ? (
                <div className={cn("group relative overflow-hidden rounded-xl border border-[var(--adm-border)] bg-[var(--adm-surface-2)]", aspectClass)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={value}
                        alt=""
                        className={cn("adm-enter h-full w-full transition-transform duration-700 group-hover:scale-105", contain ? "object-contain p-3" : "object-cover")}
                    />
                    <div className="absolute inset-0 flex items-end justify-center gap-2 bg-gradient-to-t from-black/60 via-black/10 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
                        <button type="button" onClick={() => inputRef.current?.click()} className="adm-btn adm-btn-sm translate-y-2 bg-white/90 text-zinc-900 transition-transform duration-300 hover:bg-white group-hover:translate-y-0">
                            {uploading ? <Loader2 className="animate-spin" /> : <RefreshCw />} Değiştir
                        </button>
                        <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="adm-btn adm-btn-sm adm-btn-icon translate-y-2 bg-white/90 text-zinc-900 transition-transform delay-[40ms] duration-300 hover:bg-white group-hover:translate-y-0"
                            aria-label="Tam boyut aç"
                        >
                            <ExternalLink />
                        </a>
                        <button
                            type="button"
                            onClick={() => onChange("")}
                            className="adm-btn adm-btn-sm adm-btn-icon translate-y-2 bg-white/90 text-rose-600 transition-transform delay-[80ms] duration-300 hover:bg-white group-hover:translate-y-0"
                            aria-label="Görseli kaldır"
                        >
                            <Trash2 />
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    disabled={busy}
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) upload(file);
                    }}
                    className={cn(
                        "group flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 text-center transition-all duration-300",
                        aspectClass,
                        dragging
                            ? "scale-[1.02] border-[var(--adm-accent)] bg-[var(--adm-accent-soft)]"
                            : "border-[var(--adm-border-strong)] bg-[var(--adm-surface-2)] hover:border-[color-mix(in_srgb,var(--adm-accent)_50%,transparent)] hover:bg-[var(--adm-accent-softer)]",
                    )}
                >
                    <span
                        className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--adm-surface)] shadow-[var(--adm-shadow-sm)] transition-transform duration-300",
                            dragging ? "-translate-y-1 scale-110" : "group-hover:-translate-y-0.5",
                        )}
                    >
                        {busy ? <Loader2 className="h-5 w-5 animate-spin text-[var(--adm-accent)]" /> : <ImageUp className="h-5 w-5 text-[var(--adm-accent)]" />}
                    </span>
                    <span className="text-xs font-medium adm-text-2">
                        {uploading ? "Yükleniyor…" : generating ? "Oluşturuluyor…" : dragging ? "Bırak, yükleyelim" : "Tıkla ya da sürükle bırak"}
                    </span>
                    <span className="text-[0.68rem] adm-text-3">{hint}</span>
                </button>
            )}

            {onGenerate && !value && (
                <button
                    type="button"
                    onClick={onGenerate}
                    disabled={busy}
                    className="adm-btn adm-btn-soft adm-btn-sm mt-2.5 w-full [&:hover>svg]:rotate-12"
                >
                    {generating ? <Loader2 className="animate-spin" /> : <Sparkles />}
                    {generating ? "Görsel oluşturuluyor…" : "AI ile oluştur"}
                </button>
            )}
        </div>
    );
}
