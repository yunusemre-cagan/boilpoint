"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Cloud, ExternalLink, HardDrive, Maximize2 } from "lucide-react";
import { deleteMedia } from "@/app/admin/actions/media";
import { DeleteButton } from "../DeleteButton";
import { CopyButton } from "../ui/CopyButton";
import { Dialog } from "../ui/Dialog";
import { Thumb } from "../ui/Thumb";
import { formatBytes, type MediaItem } from "./constants";

const dateFmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeStyle: "short" });

/** Medya ızgarası + ok tuşlarıyla gezilebilen önizleme penceresi. */
export function MediaGrid({ items }: { items: MediaItem[] }) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const current = openIndex !== null ? items[openIndex] : null;

    const step = useCallback(
        (delta: number) => setOpenIndex((i) => (i === null ? i : (i + delta + items.length) % items.length)),
        [items.length],
    );

    useEffect(() => {
        if (openIndex === null) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") step(1);
            if (e.key === "ArrowLeft") step(-1);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [openIndex, step]);

    return (
        <>
            <ul className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:gap-4 sm:p-5 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {items.map((file, i) => (
                    <li
                        key={file.id}
                        className="adm-enter group relative overflow-hidden rounded-2xl border border-[var(--adm-border)] bg-[var(--adm-surface)] transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-[var(--adm-border-strong)] hover:shadow-[var(--adm-shadow-md)]"
                        style={{ "--i": Math.min(i, 18) * 0.5 } as React.CSSProperties}
                    >
                        <button
                            type="button"
                            onClick={() => setOpenIndex(i)}
                            className="block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--adm-ring)]"
                            aria-label={`${file.name} önizle`}
                        >
                            <Thumb
                                src={file.url}
                                alt={file.name}
                                width={480}
                                height={480}
                                className="aspect-square w-full"
                                imgClassName="transition-transform duration-700 [transition-timing-function:var(--adm-ease)] group-hover:scale-110"
                            />
                        </button>

                        {/* Üzerine gelince beliren eylemler */}
                        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-2 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 group-hover:opacity-100">
                            <span className="flex h-6 items-center gap-1 rounded-md bg-black/45 px-1.5 text-[0.65rem] font-medium text-white">
                                {file.type === "cloudinary" ? <Cloud className="h-3 w-3" /> : <HardDrive className="h-3 w-3" />}
                                {file.format?.toUpperCase() ?? (file.type === "cloudinary" ? "Bulut" : "Yerel")}
                            </span>
                            <div className="pointer-events-auto flex gap-1">
                                <button
                                    type="button"
                                    onClick={() => setOpenIndex(i)}
                                    className="adm-btn adm-btn-sm adm-btn-icon h-7 w-7 -translate-y-1 bg-black/45 text-white transition-transform duration-300 hover:bg-black/70 group-hover:translate-y-0"
                                    aria-label="Büyüt"
                                >
                                    <Maximize2 />
                                </button>
                                <DeleteButton
                                    id={file.id}
                                    action={deleteMedia}
                                    title="Görseli sil"
                                    tone="overlay"
                                    successMessage="Görsel silindi"
                                    className="h-7 min-w-7 -translate-y-1 transition-transform delay-[40ms] duration-300 group-hover:translate-y-0"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 border-t border-[var(--adm-border)] px-3 py-2.5">
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-medium adm-text" title={file.name}>
                                    {file.name}
                                </p>
                                <p className="mt-0.5 flex items-center gap-1.5 text-[0.68rem] tabular-nums adm-text-3">
                                    <span>{formatBytes(file.size)}</span>
                                    <span aria-hidden>·</span>
                                    <span>{dateFmt.format(new Date(file.date))}</span>
                                </p>
                            </div>
                            <CopyButton value={file.url} tip="Adresi kopyala" className="h-7 w-7 shrink-0 opacity-60 transition-opacity group-hover:opacity-100" />
                        </div>
                    </li>
                ))}
            </ul>

            <Dialog open={current !== null} onOpenChange={(open) => !open && setOpenIndex(null)} title={current?.name ?? "Önizleme"} width="60rem" className="p-0" hideTitle>
                {current && (
                    <div className="grid md:grid-cols-[minmax(0,1fr)_17rem]">
                        <div className="adm-checker relative flex min-h-[18rem] items-center justify-center rounded-t-[1.4rem] p-4 md:rounded-l-[1.4rem] md:rounded-tr-none md:p-6">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img key={current.id} src={current.url} alt={current.name} className="adm-pop-in max-h-[65vh] w-auto max-w-full rounded-xl object-contain shadow-[var(--adm-shadow-md)]" />
                            {items.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => step(-1)}
                                        className="adm-btn adm-btn-secondary adm-btn-icon absolute left-3 top-1/2 -translate-y-1/2 rounded-full"
                                        aria-label="Önceki görsel"
                                    >
                                        <ChevronLeft />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => step(1)}
                                        className="adm-btn adm-btn-secondary adm-btn-icon absolute right-3 top-1/2 -translate-y-1/2 rounded-full"
                                        aria-label="Sonraki görsel"
                                    >
                                        <ChevronRight />
                                    </button>
                                </>
                            )}
                        </div>
                        <div className="flex flex-col gap-5 p-6">
                            <div className="pr-8">
                                <p className="break-all text-sm font-semibold adm-text">{current.name}</p>
                                <p className="mt-1 text-xs adm-text-3">
                                    {openIndex! + 1} / {items.length} · ← → ile gezin
                                </p>
                            </div>
                            <dl className="space-y-3 text-xs">
                                {[
                                    ["Kaynak", current.type === "cloudinary" ? "Cloudinary" : "Yerel sunucu"],
                                    ["Boyut", formatBytes(current.size)],
                                    ...(current.width && current.height ? [["Çözünürlük", `${current.width} × ${current.height}`]] : []),
                                    ...(current.format ? [["Biçim", current.format.toUpperCase()]] : []),
                                    ["Yüklenme", dateTimeFmt.format(new Date(current.date))],
                                ].map(([label, value]) => (
                                    <div key={label} className="flex items-center justify-between gap-3 border-b border-[var(--adm-border)] pb-3 last:border-0">
                                        <dt className="adm-text-3">{label}</dt>
                                        <dd className="text-right font-medium adm-text-2">{value}</dd>
                                    </div>
                                ))}
                            </dl>
                            <div className="mt-auto grid gap-2">
                                <CopyButton value={current.url} label="Adresi kopyala" size="md" variant="secondary" className="w-full" />
                                <a href={current.url} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-secondary adm-nudge w-full">
                                    <ExternalLink className="adm-nudge-up" /> Yeni sekmede aç
                                </a>
                                <DeleteButton
                                    id={current.id}
                                    action={deleteMedia}
                                    label="Sil"
                                    confirmLabel="Silmek için tekrar tıkla"
                                    title="Görseli sil"
                                    size="md"
                                    successMessage="Görsel silindi"
                                    className="w-full"
                                    onDeleted={() => setOpenIndex(null)}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </Dialog>
        </>
    );
}
