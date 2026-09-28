"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
    AlertCircle,
    ArrowLeft,
    CalendarClock,
    Check,
    Clock,
    FolderTree,
    Globe,
    ImageIcon,
    Link2,
    Loader2,
    PartyPopper,
    Plus,
    Save,
    Send,
    Sparkles,
    Tags,
    Wand2,
} from "lucide-react";
import { createPost, updatePost } from "@/app/admin/actions/post";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/Badge";
import { Button, ButtonLink } from "../ui/Button";
import { CopyButton } from "../ui/CopyButton";
import { Dialog } from "../ui/Dialog";
import { Switch } from "../ui/Switch";
import { ViewOnSite } from "../ui/ViewOnSite";
import { ImageDropzone } from "../editor/ImageDropzone";
import { MarkdownEditor } from "../editor/MarkdownEditor";
import { TagInput, type TagOption } from "../editor/TagInput";
import { uploadImage } from "../editor/upload";

type FormState = { error?: string; success?: boolean };

export type EditablePost = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    detailCoverImage: string | null;
    categoryId: string | null;
    published: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
    tags: TagOption[];
};

const TR_MAP: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u" };

function slugify(text: string) {
    return text
        .replace(/[çğıöşüÇĞİÖŞÜ]/g, (m) => TR_MAP[m])
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}

const EXCERPT_LIMIT = 160;

function SaveButton({ mode, published }: { mode: "create" | "edit"; published: boolean }) {
    const { pending } = useFormStatus();
    const label = mode === "edit" ? "Kaydet" : published ? "Yayınla" : "Taslağı kaydet";
    return (
        <Button type="submit" variant="primary" disabled={pending} className="adm-nudge min-w-[8.5rem]">
            {pending ? <Loader2 className="animate-spin" /> : mode === "create" && published ? <Send className="adm-nudge-up" /> : <Save />}
            {pending ? "Kaydediliyor…" : label}
        </Button>
    );
}

/** Yeni yazı ve yazı düzenleme ekranlarının ortak editörü. */
export function PostEditor({
    mode,
    post,
    categories,
    tags,
}: {
    mode: "create" | "edit";
    post?: EditablePost;
    categories: { id: string; name: string }[];
    tags: TagOption[];
}) {
    const router = useRouter();
    const action = useMemo(() => (mode === "edit" && post ? updatePost.bind(null, post.id) : createPost), [mode, post]);
    const [state, formAction] = useActionState<FormState, FormData>(action, {});

    const [title, setTitle] = useState(post?.title ?? "");
    const [slug, setSlug] = useState(post?.slug ?? "");
    const [autoSlug, setAutoSlug] = useState(mode === "create");
    const [content, setContent] = useState(post?.content ?? "");
    const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
    const [categoryId, setCategoryId] = useState(post?.categoryId ?? "");
    const [selectedTags, setSelectedTags] = useState<TagOption[]>(post?.tags ?? []);
    const [published, setPublished] = useState(post?.published ?? false);
    const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
    const [detailCoverImage, setDetailCoverImage] = useState(post?.detailCoverImage ?? "");
    const [dirty, setDirty] = useState(false);

    // Sitede görüntüleme, kaydedilmiş sürüme göre yapılır
    const [saved, setSaved] = useState<{ slug: string; published: boolean } | null>(post ? { slug: post.slug, published: post.published } : null);
    const submitted = useRef<{ slug: string; published: boolean } | null>(null);
    const [createdOpen, setCreatedOpen] = useState(false);

    const [aiOpen, setAiOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const [imagePrompt, setImagePrompt] = useState("");
    const [imageTarget, setImageTarget] = useState<"cover" | "detail" | null>(null);

    const formRef = useRef<HTMLFormElement>(null);
    const errorRef = useRef<HTMLDivElement>(null);

    const change = <T,>(setter: (v: T) => void) => (v: T) => {
        setter(v);
        setDirty(true);
    };

    // Başlıktan otomatik adres
    useEffect(() => {
        if (autoSlug) setSlug(slugify(title));
    }, [title, autoSlug]);

    // Kaydetme sonucu
    useEffect(() => {
        if (state.error) {
            errorRef.current?.animate(
                [{ transform: "translateX(0)" }, { transform: "translateX(-8px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }],
                { duration: 380 },
            );
            return;
        }
        if (!state.success || !submitted.current) return;
        const result = submitted.current;
        setSaved(result);
        setDirty(false);
        if (mode === "create") {
            setCreatedOpen(true);
        } else {
            toast.success("Değişiklikler kaydedildi", {
                description: result.published ? "Yazı sitede güncellendi." : "Yazı taslak olarak saklanıyor.",
                action: result.published
                    ? { label: "Sitede görüntüle", onClick: () => window.open(`/blog/${result.slug}`, "_blank", "noopener") }
                    : undefined,
            });
            router.refresh();
        }
    }, [state, mode, router]);

    // Ctrl/⌘+S ile kaydet
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
                e.preventDefault();
                formRef.current?.requestSubmit();
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    const resetForm = () => {
        setTitle("");
        setSlug("");
        setAutoSlug(true);
        setContent("");
        setExcerpt("");
        setCategoryId("");
        setSelectedTags([]);
        setPublished(false);
        setCoverImage("");
        setDetailCoverImage("");
        setSaved(null);
        setDirty(false);
        setCreatedOpen(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const generatePost = async () => {
        if (!aiPrompt.trim()) return;
        setAiLoading(true);
        try {
            const res = await fetch("/api/admin/generate-post", {
                method: "POST",
                body: JSON.stringify({ prompt: aiPrompt, categories, tags }),
            });
            const data = await res.json();
            if (data.error) {
                toast.error(`AI hatası: ${data.error}`);
                return;
            }
            if (data.title) setTitle(data.title);
            if (data.slug) {
                setSlug(data.slug);
                setAutoSlug(false);
            }
            if (data.content) setContent(data.content);
            setExcerpt(data.excerpt || "");
            if (data.categoryId) {
                const match = categories.find(
                    (c) => c.id === data.categoryId || c.name.toLocaleLowerCase("tr-TR") === String(data.categoryId).toLocaleLowerCase("tr-TR"),
                );
                if (match) setCategoryId(match.id);
            }
            if (Array.isArray(data.tags)) {
                setSelectedTags(
                    data.tags.map((name: string) => tags.find((t) => t.name.toLocaleLowerCase("tr-TR") === name.toLocaleLowerCase("tr-TR")) ?? { id: name, name }),
                );
            }
            if (data.imagePrompt) setImagePrompt(data.imagePrompt);
            setDirty(true);
            setAiOpen(false);
            setAiPrompt("");
            toast.success("Taslak hazır", { description: "İçeriği gözden geçirip kaydedebilirsin." });
        } catch {
            toast.error("İşlem sırasında bir hata oluştu.");
        } finally {
            setAiLoading(false);
        }
    };

    const generateImage = async (target: "cover" | "detail") => {
        const prompt = (imagePrompt || title).replace(/[\n\r]+/g, " ").trim();
        if (!prompt) {
            toast.error("Görsel oluşturmak için önce bir başlık girmelisin.");
            return;
        }
        setImageTarget(target);
        try {
            const res = await fetch("/api/admin/generate-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });
            const data = await res.json();
            if (!res.ok || !data.url) {
                toast.error(data.error || "Görsel oluşturulamadı. Lütfen tekrar dene.");
                return;
            }
            (target === "cover" ? setCoverImage : setDetailCoverImage)(data.url);
            setDirty(true);
        } catch {
            toast.error("Görsel oluşturulurken bir hata oluştu.");
        } finally {
            setImageTarget(null);
        }
    };

    const viewHref = saved ? `/blog/${saved.slug}` : "#";
    const viewDisabledReason = !saved ? "Önce yazıyı kaydet" : !saved.published ? "Taslak yazılar sitede görünmez" : undefined;
    const dateFmt = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" });

    return (
        <>
        <form
            ref={formRef}
            action={formAction}
            onSubmit={() => {
                submitted.current = { slug, published };
            }}
            onInput={() => setDirty(true)}
            className="pb-10"
        >
            {/* ── Üst eylem çubuğu ─────────────────────── */}
            <div className="adm-header sticky top-[var(--adm-header-h)] z-20 -mx-4 mb-6 flex flex-wrap items-center gap-3 px-4 py-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8" data-scrolled>
                <Link href="/admin/posts" className="adm-btn adm-btn-secondary adm-btn-icon adm-tip group shrink-0" data-tip="Yazılara dön" data-tip-pos="bottom" aria-label="Yazılara dön">
                    <ArrowLeft className="transition-transform duration-300 group-hover:-translate-x-0.5" />
                </Link>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h1 className="truncate text-lg font-semibold tracking-tight adm-text">{mode === "create" ? "Yeni yazı" : "Yazıyı düzenle"}</h1>
                        {saved && (
                            <Badge tone={saved.published ? "success" : "warning"} dot>
                                {saved.published ? "Yayında" : "Taslak"}
                            </Badge>
                        )}
                    </div>
                    <p className="flex items-center gap-1.5 text-xs adm-text-3">
                        {dirty ? (
                            <>
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Kaydedilmemiş değişiklikler
                            </>
                        ) : saved ? (
                            <>
                                <Check className="h-3 w-3 text-emerald-500" /> Tüm değişiklikler kaydedildi
                            </>
                        ) : (
                            "Henüz kaydedilmedi"
                        )}
                        <span className="hidden sm:inline">· <kbd className="adm-kbd ml-1">Ctrl</kbd> <kbd className="adm-kbd">S</kbd></span>
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {mode === "create" && (
                        <Button variant="soft" onClick={() => setAiOpen(true)} className="[&:hover>svg]:rotate-12">
                            <Sparkles /> <span className="hidden sm:inline">AI Asistanı</span>
                        </Button>
                    )}
                    <ViewOnSite
                        href={viewHref}
                        disabled={!!viewDisabledReason}
                        disabledReason={viewDisabledReason}
                        label="Sitede görüntüle"
                        variant="secondary"
                        size="md"
                        tipPos="bottom"
                    />
                    <SaveButton mode={mode} published={published} />
                </div>
            </div>

            {state.error && (
                <div ref={errorRef} role="alert" className="adm-enter mb-6 flex items-start gap-2.5 rounded-xl border border-rose-500/25 bg-rose-500/[0.07] px-4 py-3 text-sm text-rose-600 dark:text-rose-300">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {state.error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
                {/* ── Ana sütun ─────────────────────────── */}
                <div className="min-w-0 space-y-6">
                    <div className="adm-card adm-enter p-5 sm:p-6">
                        <label htmlFor="post-title" className="sr-only">
                            Başlık
                        </label>
                        <input
                            id="post-title"
                            name="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="Yazının başlığı"
                            className="w-full bg-transparent text-2xl font-semibold tracking-tight outline-none placeholder:text-[var(--adm-text-3)] adm-text sm:text-[1.9rem]"
                        />
                        <div className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--adm-border)] bg-[var(--adm-surface-2)] py-1 pl-3 pr-1 transition-shadow focus-within:border-[var(--adm-accent)] focus-within:shadow-[0_0_0_4px_var(--adm-ring)]">
                            <Globe className="h-3.5 w-3.5 shrink-0 adm-text-3" />
                            <span className="adm-mono shrink-0 text-xs adm-text-3">/blog/</span>
                            <label htmlFor="post-slug" className="sr-only">
                                Adres (slug)
                            </label>
                            <input
                                id="post-slug"
                                name="slug"
                                value={slug}
                                onChange={(e) => {
                                    setSlug(e.target.value);
                                    setAutoSlug(false);
                                }}
                                required
                                placeholder="yazi-adresi"
                                className="adm-mono min-w-0 flex-1 bg-transparent py-1.5 text-xs outline-none adm-text"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setAutoSlug(true);
                                    setSlug(slugify(title));
                                    setDirty(true);
                                }}
                                className={cn(
                                    "adm-btn adm-btn-sm adm-tip h-7 shrink-0 rounded-lg px-2 text-xs",
                                    autoSlug ? "adm-btn-soft" : "adm-btn-ghost",
                                )}
                                data-tip={autoSlug ? "Adres başlıktan otomatik üretiliyor" : "Adresi başlıktan yeniden üret"}
                                data-tip-pos="left"
                            >
                                {autoSlug ? <Link2 /> : <Wand2 />}
                                <span className="hidden sm:inline">{autoSlug ? "Otomatik" : "Üret"}</span>
                            </button>
                        </div>
                    </div>

                    <div className="adm-enter" style={{ "--i": 1 } as React.CSSProperties}>
                        <MarkdownEditor
                            name="content"
                            value={content}
                            onChange={change(setContent)}
                            required
                            onImage={async (file) => `![${file.name.replace(/\.[^.]+$/, "")}](${await uploadImage(file)})`}
                            onGallery={async (files) => {
                                const urls: string[] = [];
                                for (const file of files) urls.push(await uploadImage(file));
                                return urls.length ? `\n<Gallery images="${urls.join(",")}" />\n` : null;
                            }}
                        />
                    </div>

                    <div className="adm-card adm-enter p-5 sm:p-6" style={{ "--i": 2 } as React.CSSProperties}>
                        <div className="mb-2 flex items-center justify-between">
                            <label htmlFor="post-excerpt" className="adm-label mb-0">
                                Kısa açıklama
                            </label>
                            <span className={cn("text-xs tabular-nums", excerpt.length > EXCERPT_LIMIT ? "text-amber-600 dark:text-amber-400" : "adm-text-3")}>
                                {excerpt.length} / {EXCERPT_LIMIT}
                            </span>
                        </div>
                        <textarea
                            id="post-excerpt"
                            name="excerpt"
                            rows={3}
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            placeholder="Arama motorları, paylaşım kartları ve blog listesi için kısa bir özet…"
                            className="adm-input resize-none"
                        />
                        <div className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--adm-surface-3)]">
                            <div
                                className={cn("h-full rounded-full transition-[width,background-color] duration-500", excerpt.length > EXCERPT_LIMIT ? "bg-amber-500" : "bg-[var(--adm-accent)]")}
                                style={{ width: `${Math.min(100, (excerpt.length / EXCERPT_LIMIT) * 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* ── Yan panel ─────────────────────────── */}
                <aside className="space-y-4">
                    <SideCard icon={Send} title="Yayın" index={1}>
                        <Switch
                            name="published"
                            checked={published}
                            onChange={change(setPublished)}
                            label={published ? "Yayında" : "Taslak"}
                            description={published ? "Kaydedince herkes görebilir" : "Yalnızca panelde görünür"}
                        />
                        <dl className="mt-4 space-y-2.5 border-t border-[var(--adm-border)] pt-4 text-xs">
                            <div className="flex items-center justify-between gap-2">
                                <dt className="flex items-center gap-1.5 adm-text-3">
                                    <Globe className="h-3.5 w-3.5" /> Adres
                                </dt>
                                <dd className="flex min-w-0 items-center gap-1">
                                    <span className="adm-mono truncate adm-text-2">/blog/{slug || "…"}</span>
                                    {saved?.published && <CopyButton value={`/blog/${saved.slug}`} className="h-6 w-6" />}
                                </dd>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <dt className="flex items-center gap-1.5 adm-text-3">
                                    <Clock className="h-3.5 w-3.5" /> Okuma süresi
                                </dt>
                                <dd className="adm-text-2">~{Math.max(1, Math.ceil((content.trim() ? content.trim().split(/\s+/).length : 0) / 200))} dk</dd>
                            </div>
                            {post && (
                                <>
                                    <div className="flex items-center justify-between gap-2">
                                        <dt className="flex items-center gap-1.5 adm-text-3">
                                            <CalendarClock className="h-3.5 w-3.5" /> Oluşturuldu
                                        </dt>
                                        <dd className="adm-text-2">{dateFmt.format(new Date(post.createdAt))}</dd>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <dt className="flex items-center gap-1.5 adm-text-3">
                                            <Save className="h-3.5 w-3.5" /> Güncellendi
                                        </dt>
                                        <dd className="adm-text-2">{dateFmt.format(new Date(post.updatedAt))}</dd>
                                    </div>
                                </>
                            )}
                        </dl>
                    </SideCard>

                    <SideCard icon={FolderTree} title="Kategori" index={2}>
                        <select name="categoryId" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="adm-input" aria-label="Kategori">
                            <option value="">Kategori seç</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <Link href="/admin/taxonomy" className="mt-2 inline-flex items-center gap-1 text-xs adm-text-3 transition-colors hover:text-[var(--adm-accent-text)]">
                            <Plus className="h-3 w-3" /> Kategorileri yönet
                        </Link>
                    </SideCard>

                    <SideCard icon={Tags} title="Etiketler" index={3}>
                        <TagInput allTags={tags} value={selectedTags} onChange={change(setSelectedTags)} />
                        <p className="adm-hint">Enter ile ekle · Backspace ile son etiketi sil</p>
                    </SideCard>

                    <SideCard icon={ImageIcon} title="Kapak görseli" index={4}>
                        <ImageDropzone
                            name="coverImage"
                            value={coverImage}
                            onChange={change(setCoverImage)}
                            onGenerate={() => generateImage("cover")}
                            generating={imageTarget === "cover"}
                        />
                    </SideCard>

                    <SideCard icon={ImageIcon} title="Detay sayfası kapağı" description="İsteğe bağlı · boşsa kapak görseli kullanılır" index={5}>
                        <ImageDropzone
                            name="detailCoverImage"
                            value={detailCoverImage}
                            onChange={change(setDetailCoverImage)}
                            onGenerate={() => generateImage("detail")}
                            generating={imageTarget === "detail"}
                        />
                    </SideCard>
                </aside>
            </div>
        </form>

            {/* ── AI asistanı ───────────────────────────── */}
            <Dialog
                open={aiOpen}
                onOpenChange={(open) => !aiLoading && setAiOpen(open)}
                title="AI Blog Asistanı"
                description="Konuyu bir cümleyle anlat; başlık, içerik, etiketler ve özet saniyeler içinde hazırlansın."
                width="36rem"
            >
                <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Örn: Geleceğin web teknolojileri ve yapay zekâ entegrasyonu hakkında bir yazı…"
                    rows={4}
                    disabled={aiLoading}
                    className="adm-input mt-5 resize-none text-[0.95rem]"
                    autoFocus
                />
                <div className="mt-5 flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setAiOpen(false)} disabled={aiLoading}>
                        Vazgeç
                    </Button>
                    <Button variant="primary" onClick={generatePost} disabled={aiLoading || !aiPrompt.trim()}>
                        {aiLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                        {aiLoading ? "Hazırlanıyor…" : "Yazıyı oluştur"}
                    </Button>
                </div>
            </Dialog>

            {/* ── Oluşturuldu ───────────────────────────── */}
            <Dialog
                open={createdOpen}
                onOpenChange={(open) => {
                    if (!open) router.push("/admin/posts");
                }}
                title={saved?.published ? "Yazın yayında!" : "Taslak kaydedildi"}
                width="28rem"
                hideTitle
            >
                <div className="flex flex-col items-center pt-2 text-center">
                    <div className="relative mb-5">
                        <span className="absolute inset-0 rounded-full" style={{ background: "var(--adm-accent-soft)", animation: "adm-ping 1.6s var(--adm-ease) 2" }} />
                        <span className="adm-pop-in relative flex h-16 w-16 items-center justify-center rounded-full text-white shadow-[0_12px_30px_-10px_rgb(99_102_241/0.8)]" style={{ background: "var(--adm-grad)" }}>
                            {saved?.published ? <PartyPopper className="h-7 w-7" /> : <Save className="h-7 w-7" />}
                        </span>
                    </div>
                    <p className="text-xl font-semibold tracking-tight adm-text">{saved?.published ? "Yazın yayında!" : "Taslak kaydedildi"}</p>
                    <p className="mt-1.5 max-w-xs text-sm adm-text-2">
                        {saved?.published ? "Okurların artık bu yazıyı sitede görebilir." : "Yayınlamaya hazır olduğunda durumunu “Yayında” yapman yeterli."}
                    </p>
                    <div className="mt-6 grid w-full gap-2">
                        {saved?.published ? (
                            <ViewOnSite href={`/blog/${saved.slug}`} label="Sitede görüntüle" variant="primary" size="lg" className="w-full" />
                        ) : (
                            <ViewOnSite href="#" disabled disabledReason="Taslak yazılar sitede görünmez" label="Sitede görüntüle" variant="secondary" size="lg" className="w-full" />
                        )}
                        <div className="grid grid-cols-2 gap-2">
                            <ButtonLink href="/admin/posts" variant="secondary">
                                Yazılara dön
                            </ButtonLink>
                            <Button variant="secondary" onClick={resetForm}>
                                <Plus /> Yeni yazı
                            </Button>
                        </div>
                    </div>
                </div>
            </Dialog>
        </>
    );
}

function SideCard({
    icon: Icon,
    title,
    description,
    index,
    children,
}: {
    icon: typeof Send;
    title: string;
    description?: string;
    index: number;
    children: React.ReactNode;
}) {
    return (
        <section className="adm-card adm-enter p-4 sm:p-5" style={{ "--i": index } as React.CSSProperties}>
            <header className="mb-3.5 flex items-center gap-2.5">
                <span className="adm-icon-tile h-7 w-7 rounded-lg">
                    <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                    <h2 className="text-sm font-semibold adm-text">{title}</h2>
                    {description && <p className="text-[0.7rem] adm-text-3">{description}</p>}
                </div>
            </header>
            {children}
        </section>
    );
}
