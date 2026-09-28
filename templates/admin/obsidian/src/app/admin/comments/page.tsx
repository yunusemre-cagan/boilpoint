import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { tr } from "date-fns/locale";
import type { Prisma } from "@prisma/client";
import { ArrowUpRight, MessageSquareDot } from "lucide-react";
import prisma from "@/lib/prisma";
import { approveComment, deleteComment, rejectComment } from "@/app/admin/actions/comments";
import { Badge, EmptyState, ListNav, ListNavBody, ListProgress, PageHeader, Pagination } from "@/components/admin/ui";
import { ModerationActions } from "@/components/admin/moderation/ModerationActions";
import { StatusTabs } from "@/components/admin/moderation/StatusTabs";
import { VisitorAvatar } from "@/components/admin/moderation/Avatar";
import { MODERATION_STATUSES, STATUS_BADGE, type ModerationStatus } from "@/components/admin/moderation/constants";

export const dynamic = "force-dynamic";

const PER_PAGE = 10;
const STATUSES = MODERATION_STATUSES;
type Status = ModerationStatus;


export default async function CommentsModerationPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
    const params = await searchParams;
    const status: Status = STATUSES.includes(params.status as Status) ? (params.status as Status) : "all";
    const where: Prisma.CommentWhereInput = status === "all" ? {} : { status };

    const [grouped, total] = await Promise.all([prisma.comment.groupBy({ by: ["status"], _count: true }), prisma.comment.count({ where })]);
    const count = (s: string) => grouped.find((g) => g.status === s)?._count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
    const page = Math.min(Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1), totalPages);

    const comments = await prisma.comment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PER_PAGE,
        take: PER_PAGE,
        include: { post: { select: { title: true, slug: true, published: true } } },
    });

    return (
        <div className="space-y-6">
            <PageHeader icon={MessageSquareDot} title="Blog yorumları" description="Yazılarına gelen yorumları onayla, reddet ya da kaldır. Onaylanan yorumlar sitede görünür." />

            <ListNav className="adm-card adm-enter overflow-hidden">
                <ListProgress />
                <div className="p-4 sm:p-5">
                    <StatusTabs
                        value={status}
                        defaultValue="all"
                        items={[
                            { value: "all", label: "Tümü", icon: "inbox", count: grouped.reduce((s, g) => s + g._count, 0) },
                            { value: "pending", label: "Bekleyen", icon: "pending", count: count("pending") },
                            { value: "approved", label: "Onaylı", icon: "approved", count: count("approved") },
                            { value: "rejected", label: "Reddedilen", icon: "rejected", count: count("rejected") },
                        ]}
                    />
                </div>
                <ListNavBody className="border-t border-[var(--adm-border)]">
                    {comments.length === 0 ? (
                        <EmptyState icon={MessageSquareDot} title={status === "pending" ? "Bekleyen yorum yok" : "Yorum bulunamadı"} description={status === "pending" ? "Tüm yorumları incelemişsin." : undefined} />
                    ) : (
                        <ul className="adm-divide">
                            {comments.map((comment, i) => {
                                const badge = STATUS_BADGE[comment.status] ?? STATUS_BADGE.pending;
                                return (
                                    <li key={comment.id} className="adm-row adm-enter relative flex gap-4 p-4 transition-colors hover:bg-[var(--adm-accent-softer)] sm:p-5" style={{ "--i": i * 0.5 } as React.CSSProperties}>
                                        {comment.status === "pending" && <span className="absolute inset-y-4 left-0 w-[3px] rounded-r-full bg-amber-500" aria-hidden />}
                                        <VisitorAvatar name={comment.name} src={comment.avatar} />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="font-semibold adm-text">{comment.name}</p>
                                                        <Badge tone={badge.tone} dot pulse={comment.status === "pending"}>
                                                            {badge.label}
                                                        </Badge>
                                                    </div>
                                                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs adm-text-3">
                                                        {comment.email && <a href={`mailto:${comment.email}`} className="hover:text-[var(--adm-accent-text)]">{comment.email}</a>}
                                                        <span title={comment.createdAt.toLocaleString("tr-TR")}>{formatDistanceToNowStrict(comment.createdAt, { addSuffix: true, locale: tr })}</span>
                                                    </p>
                                                </div>
                                                <ModerationActions id={comment.id} status={comment.status} approve={approveComment} reject={rejectComment} remove={deleteComment} />
                                            </div>
                                            <p className="mt-3 whitespace-pre-wrap rounded-xl rounded-tl-sm border border-[var(--adm-border)] bg-[var(--adm-surface-2)] px-4 py-3 text-sm leading-relaxed adm-text-2">{comment.content}</p>
                                            {comment.post && (
                                                <Link
                                                    href={comment.post.published ? `/blog/${comment.post.slug}` : `/admin/posts?q=${encodeURIComponent(comment.post.title)}`}
                                                    target={comment.post.published ? "_blank" : undefined}
                                                    className="adm-nudge mt-2 inline-flex items-center gap-1 text-xs adm-text-3 transition-colors hover:text-[var(--adm-accent-text)]"
                                                >
                                                    Yazı: <span className="font-medium adm-text-2">{comment.post.title}</span> <ArrowUpRight className="adm-nudge-up h-3 w-3 transition-transform" />
                                                </Link>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </ListNavBody>
                <div className="border-t border-[var(--adm-border)] px-4 py-3 sm:px-5">
                    <Pagination page={page} totalPages={totalPages} total={total} pageSize={PER_PAGE} itemLabel="yorum" />
                </div>
            </ListNav>
        </div>
    );
}
