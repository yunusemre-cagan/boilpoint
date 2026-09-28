import { formatDistanceToNowStrict } from "date-fns";
import { tr } from "date-fns/locale";
import type { Prisma } from "@prisma/client";
import { BookHeart } from "lucide-react";
import prisma from "@/lib/prisma";
import { approveEntry, deleteEntry, rejectEntry } from "@/app/admin/actions/guestbook";
import { Badge, EmptyState, ListNav, ListNavBody, ListProgress, PageHeader, Pagination } from "@/components/admin/ui";
import { ModerationActions } from "@/components/admin/moderation/ModerationActions";
import { StatusTabs } from "@/components/admin/moderation/StatusTabs";
import { VisitorAvatar } from "@/components/admin/moderation/Avatar";
import { MODERATION_STATUSES, STATUS_BADGE, type ModerationStatus } from "@/components/admin/moderation/constants";

export const dynamic = "force-dynamic";

const PER_PAGE = 10;
const STATUSES = MODERATION_STATUSES;
type Status = ModerationStatus;


export default async function GuestbookModerationPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
    const params = await searchParams;
    const status: Status = STATUSES.includes(params.status as Status) ? (params.status as Status) : "all";
    const where: Prisma.GuestbookEntryWhereInput = status === "all" ? {} : { status };

    const [grouped, total] = await Promise.all([prisma.guestbookEntry.groupBy({ by: ["status"], _count: true }), prisma.guestbookEntry.count({ where })]);
    const count = (s: string) => grouped.find((g) => g.status === s)?._count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
    const page = Math.min(Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1), totalPages);

    const entries = await prisma.guestbookEntry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PER_PAGE,
        take: PER_PAGE,
    });

    return (
        <div className="space-y-6">
            <PageHeader icon={BookHeart} title="Ziyaretçi defteri" description="Deftere bırakılan mesajları onayla ya da reddet. Onaylananlar ziyaretçi defteri sayfasında görünür." />

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
                    {entries.length === 0 ? (
                        <EmptyState icon={BookHeart} title={status === "pending" ? "Bekleyen mesaj yok" : "Mesaj bulunamadı"} description={status === "pending" ? "Tüm defter mesajlarını incelemişsin." : undefined} />
                    ) : (
                        <ul className="adm-divide">
                            {entries.map((comment, i) => {
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
                                                <ModerationActions id={comment.id} status={comment.status} approve={approveEntry} reject={rejectEntry} remove={deleteEntry} />
                                            </div>
                                            <p className="mt-3 whitespace-pre-wrap rounded-xl rounded-tl-sm border border-[var(--adm-border)] bg-[var(--adm-surface-2)] px-4 py-3 text-sm leading-relaxed adm-text-2">{comment.message}</p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </ListNavBody>
                <div className="border-t border-[var(--adm-border)] px-4 py-3 sm:px-5">
                    <Pagination page={page} totalPages={totalPages} total={total} pageSize={PER_PAGE} itemLabel="mesaj" />
                </div>
            </ListNav>
        </div>
    );
}
