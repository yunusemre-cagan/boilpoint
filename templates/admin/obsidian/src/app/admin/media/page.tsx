import { readdir, stat } from "fs/promises";
import path from "path";
import { AlertTriangle, HardDrive, Image as ImageIcon, SearchX } from "lucide-react";
import { ButtonLink, EmptyState, ListNav, ListNavBody, ListProgress, PageHeader, Pagination } from "@/components/admin/ui";
import { MediaGrid } from "@/components/admin/media/MediaGrid";
import { MediaToolbar } from "@/components/admin/media/MediaToolbar";
import { MEDIA_SORTS, formatBytes, type MediaItem, type MediaSort, type MediaSource } from "@/components/admin/media/constants";

export const dynamic = "force-dynamic";

const PER_PAGE_OPTIONS = [24, 48, 96];
const CLOUDINARY_PREFIX = process.env.CLOUDINARY_FOLDER ? `${process.env.CLOUDINARY_FOLDER}/` : "obsidian-media/";

type CloudinaryResource = {
    public_id: string;
    secure_url: string;
    bytes: number;
    created_at: string;
    width?: number;
    height?: number;
    format?: string;
};

async function listLocalFiles(): Promise<MediaItem[]> {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    try {
        const names = (await readdir(uploadDir)).filter((name) => !name.startsWith("."));
        const files = await Promise.all(
            names.map(async (name) => {
                const info = await stat(path.join(uploadDir, name));
                if (!info.isFile()) return null;
                const item: MediaItem = {
                    id: name,
                    name,
                    url: `/uploads/${name}`,
                    size: info.size,
                    date: info.mtime.toISOString(),
                    type: "local",
                    format: path.extname(name).slice(1) || undefined,
                };
                return item;
            }),
        );
        return files.filter((f): f is MediaItem => f !== null);
    } catch {
        return []; // klasör yoksa yerel dosya da yok
    }
}

/**
 * Cloudinary klasöründeki tüm görselleri sayfa sayfa (500'erli) çeker.
 * Sıralama ve sayfalama tüm dizin üzerinden sunucuda yapılır; istemciye
 * yalnızca görüntülenen sayfa gönderilir.
 */
async function listCloudinary(): Promise<{ items: MediaItem[]; failed: boolean }> {
    try {
        const cloudinary = (await import("@/lib/cloudinary")).default;
        const items: MediaItem[] = [];
        let cursor: string | undefined;
        let guard = 0;
        do {
            const result = await cloudinary.api.resources({
                type: "upload",
                prefix: CLOUDINARY_PREFIX,
                max_results: 500,
                ...(cursor ? { next_cursor: cursor } : {}),
            });
            for (const resource of (result.resources ?? []) as CloudinaryResource[]) {
                items.push({
                    id: resource.public_id,
                    name: resource.public_id.split("/").pop() || resource.public_id,
                    url: resource.secure_url,
                    size: resource.bytes,
                    date: new Date(resource.created_at).toISOString(),
                    type: "cloudinary",
                    width: resource.width,
                    height: resource.height,
                    format: resource.format,
                });
            }
            cursor = result.next_cursor;
        } while (cursor && ++guard < 20);
        return { items, failed: false };
    } catch (error) {
        console.error("Cloudinary fetch failed:", error);
        return { items: [], failed: true };
    }
}

type SearchParams = Promise<{ q?: string; source?: string; sort?: string; page?: string; per?: string }>;

export default async function MediaGalleryPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const q = params.q?.trim().toLocaleLowerCase("tr-TR") ?? "";
    const source: MediaSource = params.source === "cloudinary" || params.source === "local" ? params.source : "all";
    const sort: MediaSort = params.sort && params.sort in MEDIA_SORTS ? (params.sort as MediaSort) : "new";
    const perPage = PER_PAGE_OPTIONS.includes(Number(params.per)) ? Number(params.per) : PER_PAGE_OPTIONS[0];

    const [local, cloud] = await Promise.all([listLocalFiles(), listCloudinary()]);
    const everything = [...cloud.items, ...local];
    const searched = q ? everything.filter((f) => f.name.toLocaleLowerCase("tr-TR").includes(q)) : everything;
    const counts = {
        all: searched.length,
        cloudinary: searched.filter((f) => f.type === "cloudinary").length,
        local: searched.filter((f) => f.type === "local").length,
    };
    const filtered = source === "all" ? searched : searched.filter((f) => f.type === source);

    const sorters: Record<MediaSort, (a: MediaItem, b: MediaItem) => number> = {
        new: (a, b) => b.date.localeCompare(a.date),
        old: (a, b) => a.date.localeCompare(b.date),
        size: (a, b) => b.size - a.size,
        name: (a, b) => a.name.localeCompare(b.name, "tr-TR"),
    };
    filtered.sort(sorters[sort]);

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const page = Math.min(Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1), totalPages);
    const pageItems = filtered.slice((page - 1) * perPage, page * perPage);
    const totalSize = everything.reduce((sum, f) => sum + f.size, 0);

    return (
        <div className="space-y-6">
            <PageHeader
                icon={ImageIcon}
                title="Medya kütüphanesi"
                description="Yazılarda ve projelerde kullandığın tüm görseller. Önizlemek için bir görsele tıkla."
                actions={
                    <div className="flex items-center gap-3 rounded-xl border border-[var(--adm-border)] bg-[var(--adm-surface)] px-4 py-2 text-xs shadow-[var(--adm-shadow-xs)]">
                        <HardDrive className="h-4 w-4 text-[var(--adm-accent)]" />
                        <span className="adm-text-3">
                            <span className="font-semibold adm-text">{everything.length.toLocaleString("tr-TR")}</span> dosya ·{" "}
                            <span className="font-semibold adm-text">{formatBytes(totalSize)}</span>
                        </span>
                    </div>
                }
            />

            {cloud.failed && (
                <div role="status" className="adm-enter flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/[0.07] px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>Cloudinary’ye şu an ulaşılamadı; yalnızca sunucudaki yerel dosyalar gösteriliyor.</p>
                </div>
            )}

            <ListNav className="adm-card adm-enter overflow-hidden">
                <ListProgress />
                <MediaToolbar source={source} sort={sort} counts={counts} />
                <ListNavBody className="border-t border-[var(--adm-border)]">
                    {pageItems.length === 0 ? (
                        q || source !== "all" ? (
                            <EmptyState
                                icon={SearchX}
                                title="Eşleşen görsel yok"
                                description="Aramayı ya da kaynak filtresini değiştirmeyi dene."
                                action={
                                    <ButtonLink href="/admin/media" variant="secondary" size="sm">
                                        Filtreleri temizle
                                    </ButtonLink>
                                }
                            />
                        ) : (
                            <EmptyState icon={ImageIcon} title="Henüz görsel yok" description="Yazı ve proje editörlerinden yüklediğin görseller burada listelenir." />
                        )
                    ) : (
                        <MediaGrid items={pageItems} />
                    )}
                </ListNavBody>
                <div className="border-t border-[var(--adm-border)] px-4 py-3 sm:px-5">
                    <Pagination page={page} totalPages={totalPages} total={total} pageSize={perPage} sizeOptions={PER_PAGE_OPTIONS} itemLabel="görsel" />
                </div>
            </ListNav>
        </div>
    );
}
