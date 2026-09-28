import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { tr } from "date-fns/locale";
import type { Prisma } from "@prisma/client";
import { Eye, FileText, MessageSquare, PenLine, Plus, SearchX } from "lucide-react";
import prisma from "@/lib/prisma";
import { deletePost } from "@/app/admin/actions/post";
import { DeleteButton } from "@/components/admin/DeleteButton";
import {
    ButtonLink,
    EmptyState,
    ListNav,
    ListNavBody,
    ListProgress,
    PageHeader,
    Pagination,
    StatusBadge,
    Thumb,
    ViewOnSite,
} from "@/components/admin/ui";
import { PostsToolbar } from "@/components/admin/posts/PostsToolbar";
import { POST_SORTS, type PostSort, type PostStatus } from "@/components/admin/posts/constants";

export const dynamic = "force-dynamic";

const PER_PAGE_OPTIONS = [10, 20, 50];

const ORDER_BY: Record<PostSort, Prisma.PostOrderByWithRelationInput> = {
    new: { createdAt: "desc" },
    updated: { updatedAt: "desc" },
    old: { createdAt: "asc" },
    views: { views: "desc" },
    title: { title: "asc" },
};

type SearchParams = Promise<{ q?: string; status?: string; sort?: string; category?: string; page?: string; per?: string }>;

export default async function PostsPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const q = params.q?.trim() ?? "";
    const status: PostStatus = params.status === "published" || params.status === "draft" ? params.status : "all";
    const sort: PostSort = params.sort && params.sort in POST_SORTS ? (params.sort as PostSort) : "new";
    const category = params.category ?? "";
    const perPage = PER_PAGE_OPTIONS.includes(Number(params.per)) ? Number(params.per) : PER_PAGE_OPTIONS[0];

    // Arama ve kategori filtresi; durum sekmeleri bunun üzerine uygulanır ki sekme sayıları doğru olsun
    const base: Prisma.PostWhereInput = {
        AND: [
            q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }] } : {},
            category === "none" ? { categoryId: null } : category ? { categoryId: category } : {},
        ],
    };
    const where: Prisma.PostWhereInput = status === "all" ? base : { AND: [base, { published: status === "published" }] };

    const [allCount, publishedCount, total, categories] = await Promise.all([
        prisma.post.count({ where: base }),
        prisma.post.count({ where: { AND: [base, { published: true }] } }),
        prisma.post.count({ where }),
        prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const page = Math.min(Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1), totalPages);

    const posts = await prisma.post.findMany({
        where,
        orderBy: [ORDER_BY[sort], { id: "asc" }],
        skip: (page - 1) * perPage,
        take: perPage,
        select: {
            id: true,
            title: true,
            slug: true,
            published: true,
            views: true,
            createdAt: true,
            updatedAt: true,
            coverImage: true,
            readingTime: true,
            category: { select: { name: true } },
            _count: { select: { comments: true } },
        },
    });

    const filtered = Boolean(q || category || status !== "all");
    const dateFmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Istanbul" });

    return (
        <div className="space-y-6">
            <PageHeader
                icon={FileText}
                title="Yazılar"
                description={`Blogundaki ${allCount.toLocaleString("tr-TR")} yazıyı yönet, düzenle ve sitede nasıl göründüğüne bak.`}
                actions={
                    <ButtonLink href="/admin/posts/new" variant="primary" className="adm-nudge">
                        <Plus className="adm-nudge-rot" /> Yeni yazı
                    </ButtonLink>
                }
            />

            <ListNav className="adm-card adm-enter overflow-hidden">
                <ListProgress />
                <PostsToolbar
                    status={status}
                    sort={sort}
                    category={category}
                    categories={categories}
                    counts={{ all: allCount, published: publishedCount, draft: allCount - publishedCount }}
                />

                <ListNavBody className="border-t border-[var(--adm-border)]">
                    {posts.length === 0 ? (
                        filtered ? (
                            <EmptyState
                                icon={SearchX}
                                title="Eşleşen yazı bulunamadı"
                                description="Arama terimini ya da filtreleri değiştirmeyi dene."
                                action={
                                    <ButtonLink href="/admin/posts" variant="secondary" size="sm">
                                        Filtreleri temizle
                                    </ButtonLink>
                                }
                            />
                        ) : (
                            <EmptyState
                                icon={PenLine}
                                title="Henüz yazı yok"
                                description="İlk blog yazını oluşturarak başla."
                                action={
                                    <ButtonLink href="/admin/posts/new" variant="primary" size="sm">
                                        <Plus /> Yeni yazı
                                    </ButtonLink>
                                }
                            />
                        )
                    ) : (
                        <>
                            {/* Masaüstü: tablo */}
                            <div className="hidden overflow-x-auto md:block">
                                <table className="adm-table">
                                    <thead>
                                        <tr>
                                            <th className="pl-5">Yazı</th>
                                            <th>Kategori</th>
                                            <th>Durum</th>
                                            <th className="text-right">Okunma</th>
                                            <th>Tarih</th>
                                            <th className="pr-5 text-right">
                                                <span className="sr-only">İşlemler</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {posts.map((post, i) => (
                                            <tr key={post.id} className="group adm-enter" style={{ "--i": i * 0.6 } as React.CSSProperties}>
                                                <td className="pl-5">
                                                    <div className="flex min-w-[18rem] items-center gap-3.5">
                                                        <Thumb src={post.coverImage} width={112} height={80} className="h-10 w-14 shrink-0 rounded-lg" imgClassName="transition-transform duration-500 group-hover:scale-110" fallback={<FileText className="h-4 w-4" />} />
                                                        <div className="min-w-0">
                                                            <Link
                                                                href={`/admin/posts/edit/${post.id}`}
                                                                className="line-clamp-1 font-medium adm-text transition-colors hover:text-[var(--adm-accent-text)]"
                                                            >
                                                                {post.title}
                                                            </Link>
                                                            <p className="mt-0.5 flex items-center gap-2 truncate text-xs adm-text-3">
                                                                <span className="adm-mono truncate text-[0.7rem]">/blog/{post.slug}</span>
                                                                {post._count.comments > 0 && (
                                                                    <span className="inline-flex shrink-0 items-center gap-1">
                                                                        <MessageSquare className="h-3 w-3" /> {post._count.comments}
                                                                    </span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    {post.category ? (
                                                        <span className="inline-flex whitespace-nowrap rounded-md bg-[var(--adm-surface-2)] px-2 py-1 text-xs font-medium adm-text-2">{post.category.name}</span>
                                                    ) : (
                                                        <span className="text-xs adm-text-3">—</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <StatusBadge published={post.published} />
                                                </td>
                                                <td className="text-right">
                                                    <span className="inline-flex items-center gap-1.5 tabular-nums adm-text-2">
                                                        <Eye className="h-3.5 w-3.5 adm-text-3" />
                                                        {post.views.toLocaleString("tr-TR")}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap">
                                                    <p className="text-sm adm-text-2">{dateFmt.format(post.createdAt)}</p>
                                                    <p className="text-xs adm-text-3" title={`Son düzenleme: ${dateFmt.format(post.updatedAt)}`}>
                                                        {formatDistanceToNowStrict(post.createdAt, { addSuffix: true, locale: tr })}
                                                    </p>
                                                </td>
                                                <td className="pr-5">
                                                    <div className="adm-row-actions flex items-center justify-end gap-0.5">
                                                        <ViewOnSite href={`/blog/${post.slug}`} disabled={!post.published} />
                                                        <Link
                                                            href={`/admin/posts/edit/${post.id}`}
                                                            className="adm-btn adm-btn-ghost adm-btn-sm adm-btn-icon adm-tip"
                                                            data-tip="Düzenle"
                                                            aria-label="Düzenle"
                                                        >
                                                            <PenLine />
                                                        </Link>
                                                        <DeleteButton id={post.id} action={deletePost} title="Yazıyı sil" successMessage="Yazı silindi" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobil: kartlar */}
                            <ul className="adm-divide md:hidden">
                                {posts.map((post) => (
                                    <li key={post.id} className="flex gap-3 p-4">
                                        <Thumb src={post.coverImage} width={144} height={144} className="h-16 w-16 shrink-0 rounded-xl" fallback={<FileText className="h-4 w-4" />} />
                                        <div className="min-w-0 flex-1">
                                            <Link href={`/admin/posts/edit/${post.id}`} className="line-clamp-2 text-sm font-medium adm-text">
                                                {post.title}
                                            </Link>
                                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs adm-text-3">
                                                <StatusBadge published={post.published} />
                                                <span className="inline-flex items-center gap-1">
                                                    <Eye className="h-3 w-3" /> {post.views.toLocaleString("tr-TR")}
                                                </span>
                                                <span>{dateFmt.format(post.createdAt)}</span>
                                            </div>
                                            <div className="-ml-2 mt-2 flex items-center gap-0.5">
                                                <ViewOnSite href={`/blog/${post.slug}`} disabled={!post.published} label="Görüntüle" />
                                                <Link href={`/admin/posts/edit/${post.id}`} className="adm-btn adm-btn-ghost adm-btn-sm">
                                                    <PenLine /> Düzenle
                                                </Link>
                                                <DeleteButton id={post.id} action={deletePost} title="Yazıyı sil" successMessage="Yazı silindi" />
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </ListNavBody>

                <div className="border-t border-[var(--adm-border)] px-4 py-3 sm:px-5">
                    <Pagination page={page} totalPages={totalPages} total={total} pageSize={perPage} sizeOptions={PER_PAGE_OPTIONS} itemLabel="yazı" />
                </div>
            </ListNav>
        </div>
    );
}
