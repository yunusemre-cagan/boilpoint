"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    AlertCircle,
    ArrowLeft,
    ArrowUpRight,
    Check,
    ChevronDown,
    ExternalLink,
    FileText,
    Github,
    Globe,
    ImageIcon,
    Layers,
    Link2,
    Loader2,
    Palette,
    Save,
    Send,
    Smartphone,
    Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/admin/ui/Badge";
import { Button } from "@/components/admin/ui/Button";
import { Switch } from "@/components/admin/ui/Switch";
import { ViewOnSite } from "@/components/admin/ui/ViewOnSite";
import { ImageDropzone } from "@/components/admin/editor/ImageDropzone";
import { MarkdownEditor } from "@/components/admin/editor/MarkdownEditor";
import { uploadImage } from "@/components/admin/editor/upload";

type ProjectState = { error?: string; success?: boolean };
const initialState: ProjectState = {};

const COLOR_OPTIONS = [
    { label: "Mavi", value: "from-blue-500/20 to-cyan-500/5", swatch: "from-blue-500 to-cyan-400" },
    { label: "Mor", value: "from-purple-500/20 to-pink-500/5", swatch: "from-purple-500 to-pink-400" },
    { label: "Turuncu", value: "from-amber-500/20 to-orange-500/5", swatch: "from-amber-500 to-orange-400" },
    { label: "Yeşil", value: "from-emerald-500/20 to-teal-500/5", swatch: "from-emerald-500 to-teal-400" },
    { label: "Kırmızı", value: "from-red-500/20 to-rose-500/5", swatch: "from-red-500 to-rose-400" },
    { label: "İndigo", value: "from-indigo-500/20 to-violet-500/5", swatch: "from-indigo-500 to-violet-400" },
];

const STATUS_OPTIONS = ["Aktif", "Tamamlandı", "Devam Ediyor", "Durduruldu"];

const DOCUMENTS = [
    { name: "privacyPolicy", label: "Gizlilik Sözleşmesi", path: "gizlilik-sozlesmesi" },
    { name: "termsOfUse", label: "Kullanım Koşulları", path: "kullanim-kosullari" },
    { name: "privacyPolicyEn", label: "Privacy Policy (İngilizce)", path: "privacy-policy" },
    { name: "termsOfUseEn", label: "Terms of Use (İngilizce)", path: "terms-of-use" },
] as const;

function generateSlug(title: string): string {
    const trMap: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u" };
    return title
        .replace(/[çğıöşüÇĞİÖŞÜ]/g, (m) => trMap[m])
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}

function SubmitButton({ label }: { label: string }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" variant="primary" disabled={pending} className="min-w-[9rem]">
            {pending ? <Loader2 className="animate-spin" /> : <Save />}
            {pending ? "Kaydediliyor…" : label}
        </Button>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProjectForm({ defaultValues = null, action }: { defaultValues?: any; action: (prevState: ProjectState, formData: FormData) => Promise<ProjectState> }) {
    const router = useRouter();
    const [state, formAction] = useActionState(action, initialState);
    const editing = !!defaultValues;

    const [title, setTitle] = useState<string>(defaultValues?.title || "");
    const [slug, setSlug] = useState<string>(defaultValues?.slug || "");
    const [isSlugEdited, setIsSlugEdited] = useState(!!defaultValues?.slug);
    const [content, setContent] = useState<string>(defaultValues?.content || "");
    const [published, setPublished] = useState<boolean>(defaultValues?.published !== false);
    const [color, setColor] = useState<string>(defaultValues?.color || COLOR_OPTIONS[0].value);
    const [coverImage, setCoverImage] = useState<string>(defaultValues?.coverImage || "");
    const [detailCoverImage, setDetailCoverImage] = useState<string>(defaultValues?.detailCoverImage || "");
    const [logoUrl, setLogoUrl] = useState<string>(defaultValues?.logoUrl || "");
    const [docsOpen, setDocsOpen] = useState<boolean>(DOCUMENTS.some((d) => !!defaultValues?.[d.name]));

    useEffect(() => {
        if (state.success) {
            toast.success(editing ? "Proje güncellendi" : "Proje oluşturuldu");
            router.push("/admin/projects");
        }
    }, [state.success, editing, router]);

    useEffect(() => {
        if (!isSlugEdited && title) setSlug(generateSlug(title));
    }, [title, isSlugEdited]);

    let tags = "";
    try {
        tags = defaultValues?.tags ? JSON.parse(defaultValues.tags).join(", ") : "";
    } catch {
        /* geçersiz JSON */
    }

    const savedSlug: string | undefined = defaultValues?.slug;
    const viewReason = !savedSlug ? "Önce projeyi kaydet" : defaultValues?.published === false ? "Gizli projeler sitede görünmez" : undefined;

    return (
        <form action={formAction} className="pb-10">
            {/* Üst eylem çubuğu */}
            <div className="adm-header sticky top-[var(--adm-header-h)] z-20 -mx-4 mb-6 flex flex-wrap items-center gap-3 px-4 py-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8" data-scrolled>
                <Link href="/admin/projects" className="adm-btn adm-btn-secondary adm-btn-icon adm-tip group shrink-0" data-tip="Projelere dön" data-tip-pos="bottom" aria-label="Projelere dön">
                    <ArrowLeft className="transition-transform duration-300 group-hover:-translate-x-0.5" />
                </Link>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h1 className="truncate text-lg font-semibold tracking-tight adm-text">{editing ? "Projeyi düzenle" : "Yeni proje"}</h1>
                        {editing && (
                            <Badge tone={defaultValues.published ? "success" : "neutral"} dot>
                                {defaultValues.published ? "Yayında" : "Gizli"}
                            </Badge>
                        )}
                    </div>
                    <p className="truncate text-xs adm-text-3">{editing ? defaultValues.title : "/projeler sayfasına yeni bir proje ekle"}</p>
                </div>
                <div className="flex items-center gap-2">
                    {editing && <ViewOnSite href={`/projeler/${savedSlug}`} disabled={!!viewReason} disabledReason={viewReason} label="Sitede görüntüle" variant="secondary" size="md" tipPos="bottom" />}
                    <SubmitButton label={editing ? "Kaydet" : "Projeyi oluştur"} />
                </div>
            </div>

            {state.error && (
                <div role="alert" className="adm-enter mb-6 flex items-start gap-2.5 rounded-xl border border-rose-500/25 bg-rose-500/[0.07] px-4 py-3 text-sm text-rose-600 dark:text-rose-300">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {state.error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
                <div className="min-w-0 space-y-6">
                    <div className="adm-card adm-enter space-y-4 p-5 sm:p-6">
                        <input
                            name="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            aria-label="Proje adı"
                            placeholder="Proje adı"
                            className="w-full bg-transparent text-2xl font-semibold tracking-tight outline-none placeholder:text-[var(--adm-text-3)] adm-text sm:text-[1.9rem]"
                        />
                        <div className="flex items-center gap-2 rounded-xl border border-[var(--adm-border)] bg-[var(--adm-surface-2)] py-1 pl-3 pr-1 transition-shadow focus-within:border-[var(--adm-accent)] focus-within:shadow-[0_0_0_4px_var(--adm-ring)]">
                            <Globe className="h-3.5 w-3.5 shrink-0 adm-text-3" />
                            <span className="adm-mono shrink-0 text-xs adm-text-3">/projeler/</span>
                            <input
                                name="slug"
                                value={slug}
                                onChange={(e) => {
                                    setSlug(e.target.value);
                                    setIsSlugEdited(true);
                                }}
                                aria-label="Adres (slug)"
                                placeholder="proje-adi"
                                className="adm-mono min-w-0 flex-1 bg-transparent py-1.5 text-xs outline-none adm-text"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSlugEdited(false);
                                    setSlug(generateSlug(title));
                                }}
                                className={cn("adm-btn adm-btn-sm h-7 shrink-0 rounded-lg px-2 text-xs", isSlugEdited ? "adm-btn-ghost" : "adm-btn-soft")}
                            >
                                {isSlugEdited ? <Wand2 /> : <Link2 />}
                                <span className="hidden sm:inline">{isSlugEdited ? "Üret" : "Otomatik"}</span>
                            </button>
                        </div>
                        <div>
                            <label htmlFor="project-description" className="adm-label">
                                Kısa açıklama
                            </label>
                            <textarea
                                id="project-description"
                                name="description"
                                required
                                rows={3}
                                defaultValue={defaultValues?.description || ""}
                                placeholder="Projeyi kısaca tanımla (kart ve liste görünümünde kullanılır)…"
                                className="adm-input resize-none"
                            />
                        </div>
                    </div>

                    <div className="adm-enter" style={{ "--i": 1 } as React.CSSProperties}>
                        <MarkdownEditor
                            name="content"
                            label="Detay içeriği"
                            value={content}
                            onChange={setContent}
                            extended
                            placeholder="Projeni detaylı anlat. Markdown formatını kullanabilirsin…"
                            onImage={async (file) => {
                                const url = await uploadImage(file);
                                const alt = file.name.replace(/\.[^.]+$/, "");
                                const width = window.prompt("Resim genişliği (örn: 500, 100%; boş bırakabilirsin):", "");
                                return width
                                    ? `\n<img src="${url}" alt="${alt}" width="${width}" className="rounded-2xl shadow-lg my-8" />\n`
                                    : `\n<img src="${url}" alt="${alt}" className="rounded-2xl shadow-lg my-8" />\n`;
                            }}
                            onGallery={async (files) => {
                                const urls: string[] = [];
                                for (const file of files) urls.push(await uploadImage(file));
                                return urls.length ? `\n<Gallery images="${urls.join(",")}" />\n` : null;
                            }}
                        />
                    </div>

                    {/* Mobil uygulama belgeleri */}
                    <div className="adm-card adm-enter overflow-hidden" style={{ "--i": 2 } as React.CSSProperties}>
                        <button type="button" onClick={() => setDocsOpen((o) => !o)} className="flex w-full items-center gap-3 p-5 text-left sm:p-6" aria-expanded={docsOpen}>
                            <span className="adm-icon-tile h-9 w-9 rounded-[0.7rem]">
                                <Smartphone className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-sm font-semibold adm-text">Mobil uygulama belgeleri</span>
                                <span className="block text-xs adm-text-3">İsteğe bağlı · projeye özel mobil web sayfalarında gösterilir, Markdown desteklenir</span>
                            </span>
                            <ChevronDown className={cn("h-4 w-4 shrink-0 adm-text-3 transition-transform duration-300", docsOpen && "rotate-180")} />
                        </button>
                        <div className={cn("grid transition-[grid-template-rows] duration-500 [transition-timing-function:var(--adm-ease)]", docsOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                            <div className="overflow-hidden">
                                <div className="grid gap-5 border-t border-[var(--adm-border)] p-5 sm:p-6 lg:grid-cols-2">
                                    {DOCUMENTS.map((doc) => (
                                        <div key={doc.name}>
                                            <div className="mb-1.5 flex items-center justify-between">
                                                <label htmlFor={`doc-${doc.name}`} className="adm-label mb-0">
                                                    {doc.label}
                                                </label>
                                                {slug && (
                                                    <a href={`/projeler/${slug}/${doc.path}`} target="_blank" rel="noopener noreferrer" className="adm-nudge inline-flex items-center gap-1 text-xs adm-accent-text hover:underline">
                                                        Sayfaya git <ArrowUpRight className="adm-nudge-up h-3 w-3 transition-transform" />
                                                    </a>
                                                )}
                                            </div>
                                            <textarea
                                                id={`doc-${doc.name}`}
                                                name={doc.name}
                                                rows={8}
                                                defaultValue={defaultValues?.[doc.name] || ""}
                                                placeholder={`${doc.label} metni (Markdown)…`}
                                                className="adm-input adm-mono text-xs"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <aside className="space-y-4">
                    <SideCard icon={Send} title="Yayın" index={1}>
                        <Switch name="published" checked={published} onChange={setPublished} label={published ? "Yayında" : "Gizli"} description={published ? "/projeler sayfasında listelenir" : "Yalnızca panelde görünür"} />
                        <label htmlFor="project-status" className="adm-label mt-4">
                            Proje durumu
                        </label>
                        <select id="project-status" name="status" defaultValue={defaultValues?.status || "Aktif"} className="adm-input">
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s}>{s}</option>
                            ))}
                        </select>
                    </SideCard>

                    <SideCard icon={Layers} title="Teknolojiler" index={2}>
                        <input type="text" name="tags" defaultValue={tags} placeholder="React, Next.js, TypeScript" className="adm-input" aria-label="Teknolojiler" />
                        <p className="adm-hint">Virgülle ayır</p>
                    </SideCard>

                    <SideCard icon={Link2} title="Bağlantılar" index={3}>
                        <div className="space-y-3">
                            {[
                                { name: "githubUrl", icon: Github, placeholder: "https://github.com/…", label: "GitHub" },
                                { name: "liveUrl", icon: Globe, placeholder: "https://…", label: "Canlı demo" },
                                { name: "link", icon: ExternalLink, placeholder: "İsteğe bağlı", label: "Alternatif harici bağlantı" },
                            ].map((field) => (
                                <div key={field.name} className="adm-field-icon">
                                    <field.icon />
                                    <input type="text" name={field.name} defaultValue={defaultValues?.[field.name] || ""} placeholder={field.placeholder} aria-label={field.label} className="adm-input adm-mono text-xs" />
                                </div>
                            ))}
                        </div>
                    </SideCard>

                    <SideCard icon={Palette} title="Kart görünümü" index={4}>
                        <input type="hidden" name="color" value={color} />
                        <div role="radiogroup" aria-label="Kart rengi" className="grid grid-cols-6 gap-2">
                            {COLOR_OPTIONS.map((option) => {
                                const active = option.value === color;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        role="radio"
                                        aria-checked={active}
                                        aria-label={option.label}
                                        data-tip={option.label}
                                        onClick={() => setColor(option.value)}
                                        className={cn(
                                            "adm-tip relative flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br transition-transform duration-300 [transition-timing-function:var(--adm-spring)] hover:scale-110",
                                            option.swatch,
                                            active && "scale-105 ring-2 ring-[var(--adm-accent)] ring-offset-2 ring-offset-[var(--adm-surface)]",
                                        )}
                                    >
                                        {active && <Check className="adm-pop-in h-4 w-4 text-white" />}
                                    </button>
                                );
                            })}
                        </div>
                        <label htmlFor="project-order" className="adm-label mt-4">
                            Sıra <span className="font-normal adm-text-3">(küçük olan önce)</span>
                        </label>
                        <input id="project-order" type="number" name="order" min="0" defaultValue={defaultValues?.order ?? 0} className="adm-input" />
                    </SideCard>

                    <SideCard icon={ImageIcon} title="Proje logosu" description="İsteğe bağlı · kare" index={5}>
                        <div className="mx-auto max-w-[9rem]">
                            <ImageDropzone name="logoUrl" value={logoUrl} onChange={setLogoUrl} aspect="square" contain hint="Kare logo" />
                        </div>
                    </SideCard>

                    <SideCard icon={ImageIcon} title="Kart görseli" description="Sabit 2:1 oran" index={6}>
                        <ImageDropzone name="coverImage" value={coverImage} onChange={setCoverImage} aspect="wide" />
                    </SideCard>

                    <SideCard icon={FileText} title="Detay sayfası kapağı" description="Boşsa kart görseli kullanılır" index={7}>
                        <ImageDropzone name="detailCoverImage" value={detailCoverImage} onChange={setDetailCoverImage} contain />
                    </SideCard>
                </aside>
            </div>
        </form>
    );
}

function SideCard({ icon: Icon, title, description, index, children }: { icon: typeof Send; title: string; description?: string; index: number; children: React.ReactNode }) {
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
