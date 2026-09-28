import { formatDistanceToNowStrict } from "date-fns";
import { tr } from "date-fns/locale";
import type { Prisma } from "@prisma/client";
import { Mail, MailCheck } from "lucide-react";
import prisma from "@/lib/prisma";
import { Badge, EmptyState, ListNav, ListNavBody, ListProgress, PageHeader, Pagination } from "@/components/admin/ui";
import { StatusTabs } from "@/components/admin/moderation/StatusTabs";
import { VisitorAvatar } from "@/components/admin/moderation/Avatar";
import { MessageActions } from "@/components/admin/moderation/MessageActions";

export const dynamic = "force-dynamic";

const PER_PAGE = 10;
type Filter = "all" | "unread" | "read";

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
    const params = await searchParams;
    const filter: Filter = params.status === "unread" || params.status === "read" ? params.status : "all";
    const where: Prisma.ContactMessageWhereInput = filter === "all" ? {} : { isRead: filter === "read" };

    const [all, unread, total] = await Promise.all([
        prisma.contactMessage.count(),
        prisma.contactMessage.count({ where: { isRead: false } }),
        prisma.contactMessage.count({ where }),
    ]);
    const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
    const page = Math.min(Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1), totalPages);
    const messages = await prisma.contactMessage.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE });

    return (
        <div className="space-y-6">
            <PageHeader icon={Mail} title="Gelen kutusu" description="İletişim formundan gelen mesajlar. Yanıtla düğmesi e-posta istemcini hazır bir yanıtla açar." />

            <ListNav className="adm-card adm-enter overflow-hidden">
                <ListProgress />
                <div className="p-4 sm:p-5">
                    <StatusTabs
                        value={filter}
                        defaultValue="all"
                        items={[
                            { value: "all", label: "Tümü", icon: "inbox", count: all },
                            { value: "unread", label: "Okunmamış", icon: "mail", count: unread },
                            { value: "read", label: "Okunmuş", icon: "mailOpen", count: all - unread },
                        ]}
                    />
                </div>
                <ListNavBody className="border-t border-[var(--adm-border)]">
                    {messages.length === 0 ? (
                        <EmptyState icon={MailCheck} title={filter === "unread" ? "Okunmamış mesaj yok" : "Gelen kutusu boş"} description={filter === "unread" ? "Harika, tüm mesajları okumuşsun." : undefined} />
                    ) : (
                        <ul className="adm-divide">
                            {messages.map((msg, i) => (
                                <li
                                    key={msg.id}
                                    className="adm-row adm-enter relative flex gap-4 p-4 transition-colors hover:bg-[var(--adm-accent-softer)] sm:p-5"
                                    style={{ "--i": i * 0.5 } as React.CSSProperties}
                                >
                                    {!msg.isRead && <span className="absolute inset-y-4 left-0 w-[3px] rounded-r-full" style={{ background: "var(--adm-grad)" }} aria-hidden />}
                                    <VisitorAvatar name={msg.name} />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className={msg.isRead ? "font-medium adm-text-2" : "font-semibold adm-text"}>{msg.name}</p>
                                                    {!msg.isRead && (
                                                        <Badge tone="accent" dot pulse>
                                                            Yeni
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs adm-text-3">
                                                    <a href={`mailto:${msg.email}`} className="hover:text-[var(--adm-accent-text)]">
                                                        {msg.email}
                                                    </a>
                                                    <span title={msg.createdAt.toLocaleString("tr-TR")}>{formatDistanceToNowStrict(msg.createdAt, { addSuffix: true, locale: tr })}</span>
                                                </p>
                                            </div>
                                            <MessageActions id={msg.id} isRead={msg.isRead} email={msg.email} subject={msg.subject} />
                                        </div>
                                        {msg.subject && <p className="mt-3 text-sm font-semibold adm-text">{msg.subject}</p>}
                                        <p className="mt-2 whitespace-pre-wrap rounded-xl rounded-tl-sm border border-[var(--adm-border)] bg-[var(--adm-surface-2)] px-4 py-3 text-sm leading-relaxed adm-text-2">{msg.message}</p>
                                    </div>
                                </li>
                            ))}
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
