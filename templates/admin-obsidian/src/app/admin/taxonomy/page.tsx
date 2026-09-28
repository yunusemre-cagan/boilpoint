import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { ArrowUpRight, FileText, FolderTree, Hash, SearchX, Tags } from "lucide-react";
import prisma from "@/lib/prisma";
import { deleteCategory, deleteTag } from "@/app/admin/actions/taxonomy";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { EmptyState, ListNav, ListNavBody, ListProgress, PageHeader, Pagination, SearchField } from "@/components/admin/ui";
import { TaxonomyCreateForm } from "@/components/admin/taxonomy/TaxonomyCreateForm";

export const dynamic = "force-dynamic";

const PER_PANEL = 10;

type SearchParams = Promise<{ cq?: string; cpage?: string; tq?: string; tpage?: string }>;

function pageOf(raw: string | undefined, total: number) {
    const totalPages = Math.max(1, Math.ceil(total / PER_PANEL));
    return { page: Math.min(Math.max(1, Number.parseInt(raw ?? "1", 10) || 1), totalPages), totalPages };
}

export default async function TaxonomyPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const cq = params.cq?.trim() ?? "";
    const tq = params.tq?.trim() ?? "";

    const categoryWhere: Prisma.CategoryWhereInput = cq ? { name: { contains: cq, mode: "insensitive" } } : {};
    const tagWhere: Prisma.TagWhereInput = tq ? { name: { contains: tq, mode: "insensitive" } } : {};

    const [categoryTotal, tagTotal, categoryAll, tagAll, topCategory, topTag] = await Promise.all([
        prisma.category.count({ where: categoryWhere }),
        prisma.tag.count({ where: tagWhere }),
        prisma.category.count(),
        prisma.tag.count(),
        prisma.category.findFirst({ orderBy: { posts: { _count: "desc" } }, select: { _count: { select: { posts: true } } } }),
        prisma.tag.findFirst({ orderBy: { posts: { _count: "desc" } }, select: { _count: { select: { posts: true } } } }),
    ]);

    const categoryPage = pageOf(params.cpage, categoryTotal);
    const tagPage = pageOf(params.tpage, tagTotal);

    const [categories, tags] = await Promise.all([
        prisma.category.findMany({
            where: categoryWhere,
            orderBy: { name: "asc" },
            skip: (categoryPage.page - 1) * PER_PANEL,
            take: PER_PANEL,
            include: { _count: { select: { posts: true } } },
        }),
        prisma.tag.findMany({
            where: tagWhere,
            orderBy: { name: "asc" },
            skip: (tagPage.page - 1) * PER_PANEL,
            take: PER_PANEL,
            include: { _count: { select: { posts: true } } },
        }),
    ]);

    return (
        <div className="space-y-6">
            <PageHeader
                icon={FolderTree}
                title="Kategori & Etiket"
                description="Yazılarını düzenlemek için kategorileri ve etiketleri tek yerden yönet. Kategoriler geniş konuları, etiketler ayrıntıları anlatır."
            />

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
                <TaxonomyPanel
                    kind="category"
                    icon={FolderTree}
                    title="Kategoriler"
                    description="Her yazı tek bir kategoriye bağlanır."
                    all={categoryAll}
                    total={categoryTotal}
                    query={cq}
                    queryParam="cq"
                    pageParam="cpage"
                    page={categoryPage.page}
                    totalPages={categoryPage.totalPages}
                    max={topCategory?._count.posts ?? 0}
                    items={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, count: c._count.posts }))}
                    onDelete={deleteCategory}
                    enter={1}
                />
                <TaxonomyPanel
                    kind="tag"
                    icon={Tags}
                    title="Etiketler"
                    description="Bir yazıya istediğin kadar etiket ekleyebilirsin."
                    all={tagAll}
                    total={tagTotal}
                    query={tq}
                    queryParam="tq"
                    pageParam="tpage"
                    page={tagPage.page}
                    totalPages={tagPage.totalPages}
                    max={topTag?._count.posts ?? 0}
                    items={tags.map((t) => ({ id: t.id, name: t.name, slug: t.slug, count: t._count.posts }))}
                    onDelete={deleteTag}
                    enter={2}
                />
            </div>
        </div>
    );
}

function TaxonomyPanel({
    kind,
    icon: Icon,
    title,
    description,
    all,
    total,
    query,
    queryParam,
    pageParam,
    page,
    totalPages,
    max,
    items,
    onDelete,
    enter,
}: {
    kind: "category" | "tag";
    icon: typeof Tags;
    title: string;
    description: string;
    all: number;
    total: number;
    query: string;
    queryParam: string;
    pageParam: string;
    page: number;
    totalPages: number;
    max: number;
    items: { id: string; name: string; slug: string; count: number }[];
    onDelete: (id: string) => Promise<unknown>;
    enter: number;
}) {
    const noun = kind === "category" ? "kategori" : "etiket";
    return (
        <ListNav className="adm-card adm-enter flex flex-col overflow-hidden">
            <ListProgress />
            <div className="space-y-4 p-5 sm:p-6" style={{ "--i": enter } as React.CSSProperties}>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="adm-icon-tile">
                            <Icon className="h-[1.1rem] w-[1.1rem]" />
                        </span>
                        <div>
                            <h2 className="flex items-center gap-2 font-semibold tracking-tight adm-text">
                                {title}
                                <span className="rounded-full bg-[var(--adm-surface-3)] px-2 py-0.5 text-[0.7rem] font-semibold tabular-nums adm-text-2">{all}</span>
                            </h2>
                            <p className="text-xs adm-text-3">{description}</p>
                        </div>
                    </div>
                </div>
                <TaxonomyCreateForm kind={kind} />
                <SearchField param={queryParam} pageParam={pageParam} placeholder={`${title} içinde ara…`} shortcut={false} />
            </div>

            <ListNavBody className="min-h-[18rem] flex-1 border-t border-[var(--adm-border)]">
                {items.length === 0 ? (
                    query ? (
                        <EmptyState compact icon={SearchX} title={`“${query}” ile eşleşen ${noun} yok`} />
                    ) : (
                        <EmptyState compact icon={Icon} title={`Henüz ${noun} yok`} description={`Yukarıdan ilk ${noun}i ekleyebilirsin.`} />
                    )
                ) : (
                    <ul className="adm-divide">
                        {items.map((item, i) => (
                            <li
                                key={item.id}
                                className="adm-row adm-enter group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[var(--adm-accent-softer)] sm:px-6"
                                style={{ "--i": i * 0.5 } as React.CSSProperties}
                            >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--adm-surface-2)] adm-text-3 transition-colors group-hover:bg-[var(--adm-accent-soft)] group-hover:text-[var(--adm-accent)]">
                                    {kind === "category" ? <FolderTree className="h-3.5 w-3.5" /> : <Hash className="h-3.5 w-3.5" />}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-baseline justify-between gap-3">
                                        <p className="truncate text-sm font-medium adm-text">{item.name}</p>
                                        <span className="inline-flex shrink-0 items-center gap-1 text-xs tabular-nums adm-text-3">
                                            <FileText className="h-3 w-3" /> {item.count} yazı
                                        </span>
                                    </div>
                                    <div className="mt-1.5 flex items-center gap-3">
                                        <span className="adm-mono w-28 shrink-0 truncate text-[0.68rem] adm-text-3 sm:w-36">{item.slug}</span>
                                        <span className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--adm-surface-3)]">
                                            <span
                                                className="adm-grow-x block h-full rounded-full bg-[var(--adm-accent)]"
                                                style={{ width: `${max ? (item.count / max) * 100 : 0}%`, "--i": i } as React.CSSProperties}
                                            />
                                        </span>
                                    </div>
                                </div>
                                <div className="adm-row-actions flex shrink-0 items-center gap-0.5">
                                    {kind === "category" && (
                                        <Link
                                            href={`/admin/posts?category=${item.id}`}
                                            className="adm-btn adm-btn-ghost adm-btn-sm adm-btn-icon adm-tip adm-nudge"
                                            data-tip="Yazıları gör"
                                            aria-label={`${item.name} yazılarını gör`}
                                        >
                                            <ArrowUpRight className="adm-nudge-up" />
                                        </Link>
                                    )}
                                    <DeleteButton id={item.id} action={onDelete} title={`${item.name} sil`} successMessage={`${item.name} silindi`} />
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </ListNavBody>

            <div className="border-t border-[var(--adm-border)] px-5 py-3 sm:px-6">
                <Pagination compact page={page} totalPages={totalPages} total={total} pageSize={PER_PANEL} param={pageParam} itemLabel={noun} />
            </div>
        </ListNav>
    );
}
