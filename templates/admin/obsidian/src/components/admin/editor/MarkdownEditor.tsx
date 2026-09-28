"use client";

import { useRef, useState } from "react";
import {
    Bold,
    Code,
    Columns2,
    Eye,
    Heading1,
    Heading2,
    Heading3,
    Highlighter,
    Image as ImageIcon,
    Images,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    ListTodo,
    Loader2,
    Minus,
    PenLine,
    Quote,
    Strikethrough,
    Table,
    Underline,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Segmented } from "../ui/Segmented";
import { MarkdownPreview } from "./MarkdownPreview";
import { IMAGE_ACCEPT } from "./upload";

type Tool = { icon: typeof Bold; title: string; before: string; after?: string; shortcut?: string; extended?: boolean };

const TOOL_GROUPS: Tool[][] = [
    [
        { icon: Heading1, title: "Başlık 1", before: "# " },
        { icon: Heading2, title: "Başlık 2", before: "## " },
        { icon: Heading3, title: "Başlık 3", before: "### " },
    ],
    [
        { icon: Bold, title: "Kalın", before: "**", after: "**", shortcut: "B" },
        { icon: Italic, title: "İtalik", before: "*", after: "*", shortcut: "I" },
        { icon: Strikethrough, title: "Üstü çizili", before: "~~", after: "~~" },
        { icon: Underline, title: "Altı çizili", before: "<u>", after: "</u>", extended: true },
        { icon: Highlighter, title: "Vurgulu", before: "<mark>", after: "</mark>", extended: true },
    ],
    [
        { icon: List, title: "Madde listesi", before: "- " },
        { icon: ListOrdered, title: "Numaralı liste", before: "1. " },
        { icon: ListTodo, title: "Yapılacaklar", before: "- [ ] " },
    ],
    [
        { icon: Quote, title: "Alıntı", before: "> " },
        { icon: Code, title: "Kod bloğu", before: "```\n", after: "\n```" },
        { icon: Table, title: "Tablo", before: "\n| Sütun 1 | Sütun 2 |\n|---|---|\n| İçerik | İçerik |\n", extended: true },
        { icon: Minus, title: "Yatay çizgi", before: "\n---\n" },
        { icon: LinkIcon, title: "Bağlantı", before: "[", after: "](url)", shortcut: "K" },
    ],
];

type Mode = "write" | "preview" | "split";

/**
 * Araç çubuklu Markdown/MDX editörü: yaz, önizle ya da geniş ekranda yan yana.
 * Ctrl/⌘+B, I, K kısayolları; altta kelime sayısı ve okuma süresi.
 */
export function MarkdownEditor({
    name,
    value,
    onChange,
    label = "İçerik",
    placeholder = "Yazmaya başla… Markdown ve MDX desteklenir.",
    required,
    extended,
    minHeight = 460,
    onImage,
    onGallery,
}: {
    name: string;
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    required?: boolean;
    /** Altı çizili, vurgu ve tablo araçlarını da göster */
    extended?: boolean;
    minHeight?: number;
    /** Tek görsel yükleyip eklenecek metni döndürür */
    onImage?: (file: File) => Promise<string | null>;
    /** Birden çok görsel yükleyip eklenecek metni döndürür */
    onGallery?: (files: File[]) => Promise<string | null>;
}) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const imageInput = useRef<HTMLInputElement>(null);
    const galleryInput = useRef<HTMLInputElement>(null);
    const [mode, setMode] = useState<Mode>("write");
    const [uploading, setUploading] = useState(false);

    const insert = (before: string, after = "") => {
        const textarea = textareaRef.current;
        if (!textarea) {
            onChange(value + before + after);
            return;
        }
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = value.substring(start, end);
        onChange(value.substring(0, start) + before + selected + after + value.substring(end));
        requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        });
    };

    const runUpload = async (task: () => Promise<string | null>) => {
        setUploading(true);
        try {
            const snippet = await task();
            if (snippet) insert(snippet);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Yükleme başarısız oldu.");
        } finally {
            setUploading(false);
        }
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!(e.metaKey || e.ctrlKey)) return;
        const tool = TOOL_GROUPS.flat().find((t) => t.shortcut && t.shortcut.toLowerCase() === e.key.toLowerCase());
        if (tool) {
            e.preventDefault();
            insert(tool.before, tool.after);
        }
    };

    const words = value.trim() ? value.trim().split(/\s+/).length : 0;
    const readingMinutes = Math.max(1, Math.ceil(words / 200));

    const toolButton = "adm-btn adm-btn-ghost adm-btn-sm adm-btn-icon adm-tip h-8 w-8 rounded-lg";

    return (
        <div className="adm-card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--adm-border)] px-4 py-3">
                <span className="text-sm font-semibold adm-text">{label}</span>
                <Segmented
                    ariaLabel="Editör görünümü"
                    value={mode}
                    onChange={setMode}
                    items={[
                        { value: "write", label: "Yaz", icon: PenLine },
                        { value: "preview", label: "Önizle", icon: Eye },
                        { value: "split", label: "Yan yana", icon: Columns2, iconOnlyOnMobile: true },
                    ]}
                />
            </div>

            {mode !== "preview" && (
                <div className="flex flex-wrap items-center gap-0.5 border-b border-[var(--adm-border)] bg-[var(--adm-surface-2)] px-2 py-1.5">
                    {TOOL_GROUPS.map((group, gi) => (
                        <div key={gi} className="flex items-center gap-0.5">
                            {gi > 0 && <span className="mx-1 h-4 w-px bg-[var(--adm-border-strong)]" aria-hidden />}
                            {group
                                .filter((tool) => extended || !tool.extended)
                                .map((tool) => (
                                    <button
                                        key={tool.title}
                                        type="button"
                                        onClick={() => insert(tool.before, tool.after)}
                                        className={toolButton}
                                        data-tip={tool.shortcut ? `${tool.title} (Ctrl+${tool.shortcut})` : tool.title}
                                        aria-label={tool.title}
                                    >
                                        <tool.icon />
                                    </button>
                                ))}
                        </div>
                    ))}
                    {(onImage || onGallery) && (
                        <div className="flex items-center gap-0.5">
                            <span className="mx-1 h-4 w-px bg-[var(--adm-border-strong)]" aria-hidden />
                            {onImage && (
                                <>
                                    <button
                                        type="button"
                                        disabled={uploading}
                                        onClick={() => imageInput.current?.click()}
                                        className={toolButton}
                                        data-tip="Görsel ekle"
                                        aria-label="Görsel ekle"
                                    >
                                        {uploading ? <Loader2 className="animate-spin" /> : <ImageIcon />}
                                    </button>
                                    <input
                                        ref={imageInput}
                                        type="file"
                                        accept={IMAGE_ACCEPT}
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) runUpload(() => onImage(file));
                                            e.target.value = "";
                                        }}
                                    />
                                </>
                            )}
                            {onGallery && (
                                <>
                                    <button
                                        type="button"
                                        disabled={uploading}
                                        onClick={() => galleryInput.current?.click()}
                                        className={cn(toolButton, "!text-[var(--adm-accent)]")}
                                        data-tip="Galeri ekle (çoklu seçim)"
                                        aria-label="Galeri ekle"
                                    >
                                        {uploading ? <Loader2 className="animate-spin" /> : <Images />}
                                    </button>
                                    <input
                                        ref={galleryInput}
                                        type="file"
                                        accept={IMAGE_ACCEPT}
                                        multiple
                                        className="hidden"
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files ?? []);
                                            if (files.length) runUpload(() => onGallery(files));
                                            e.target.value = "";
                                        }}
                                    />
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className={cn(mode === "split" && "grid lg:grid-cols-2")}>
                <textarea
                    ref={textareaRef}
                    name={name}
                    required={required}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder={placeholder}
                    spellCheck
                    className={cn(
                        "adm-mono block w-full resize-y bg-transparent px-5 py-4 text-[0.8125rem] leading-7 outline-none placeholder:text-[var(--adm-text-3)] adm-text",
                        mode === "preview" && "hidden",
                        mode === "split" && "lg:border-r lg:border-[var(--adm-border)]",
                    )}
                    style={{ minHeight }}
                />
                {mode !== "write" && (
                    <div
                        className={cn("overflow-y-auto px-6 py-5", mode === "split" && "hidden border-t border-[var(--adm-border)] lg:block lg:border-t-0")}
                        style={{ minHeight, maxHeight: mode === "split" ? minHeight * 1.6 : undefined }}
                    >
                        <MarkdownPreview content={value} />
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[var(--adm-border)] bg-[var(--adm-surface-2)] px-4 py-2 text-[0.7rem] adm-text-3">
                <span className="tabular-nums">
                    {words.toLocaleString("tr-TR")} kelime · {value.length.toLocaleString("tr-TR")} karakter
                </span>
                <span>~{readingMinutes} dk okuma</span>
            </div>
        </div>
    );
}
