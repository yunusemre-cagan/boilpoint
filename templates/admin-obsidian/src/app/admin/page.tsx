import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { tr } from "date-fns/locale";
import {
    ArrowRight,
    ArrowUpRight,
    BookHeart,
    CheckCheck,
    Eye,
    FileText,
    Flame,
    FolderTree,
    Briefcase,
    Hash,
    Mail,
    MessageSquareDot,
    PenLine,
    PencilLine,
    Sparkles,
    TrendingDown,
    TrendingUp,
    Users,
    MousePointerClick,
    Activity,
    CalendarDays,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { AnimatedNumber, ButtonAnchor, ButtonLink, Card, CardHeader, EmptyState, StatusBadge, ViewOnSite } from "@/components/admin/ui";
import { Sparkline } from "@/components/admin/dashboard/Sparkline";
import { TrafficChart, type TrafficPoint } from "@/components/admin/dashboard/TrafficChart";
import { ProgressRing } from "@/components/admin/dashboard/ProgressRing";
import { PublishingHeatmap } from "@/components/admin/dashboard/PublishingHeatmap";

export const dynamic = "force-dynamic";

const DAY = 86_400_000;
const TZ = "Europe/Istanbul";

function greetingFor(date: Date) {
    const hour = Number(new Intl.DateTimeFormat("tr-TR", { hour: "numeric", hourCycle: "h23", timeZone: TZ }).format(date));
    if (hour < 5) return "İyi geceler";
    if (hour < 12) return "Günaydın";
    if (hour < 18) return "İyi günler";
    return "İyi akşamlar";
}

function sum(values: number[]) {
    return values.reduce((a, b) => a + b, 0);
}

/** Önceki döneme göre yüzde değişim (önceki dönem boşsa null). */
function change(current: number, previous: number) {
    if (previous === 0) return current === 0 ? 0 : null;
    return Math.round(((current - previous) / previous) * 100);
}

function ago(date: Date) {
    return formatDistanceToNowStrict(date, { addSuffix: true, locale: tr });
}

export default async function AdminDashboard() {
    const now = new Date();
    const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const since = new Date(today - 29 * DAY);
    const heatmapSince = new Date(today - 7 * 27 * DAY);

    const [
        session,
        totalPosts,
        publishedPosts,
        viewsAggregate,
        unreadMessages,
        pendingGuestbook,
        pendingComments,
        categoryCount,
        tagCount,
        projectCount,
        statsRows,
        topPosts,
        recentPosts,
        latestComments,
        latestGuestbook,
        latestMessages,
        heatmapPosts,
    ] = await Promise.all([
        getServerSession(authOptions),
        prisma.post.count(),
        prisma.post.count({ where: { published: true } }),
        prisma.post.aggregate({ _sum: { views: true } }),
        prisma.contactMessage.count({ where: { isRead: false } }),
        prisma.guestbookEntry.count({ where: { status: "pending" } }),
        prisma.comment.count({ where: { status: "pending" } }),
        prisma.category.count(),
        prisma.tag.count(),
        prisma.project.count(),
        prisma.visitorStats.findMany({ where: { date: { gte: since } }, orderBy: { date: "asc" } }),
        prisma.post.findMany({
            where: { published: true },
            orderBy: { views: "desc" },
            take: 6,
            select: { id: true, title: true, views: true, slug: true },
        }),
        prisma.post.findMany({
            orderBy: { updatedAt: "desc" },
            take: 5,
            select: { id: true, title: true, slug: true, published: true, updatedAt: true, coverImage: true, category: { select: { name: true } } },
        }),
        prisma.comment.findMany({
            orderBy: { createdAt: "desc" },
            take: 6,
            select: { id: true, name: true, status: true, createdAt: true, post: { select: { title: true } } },
        }),
        prisma.guestbookEntry.findMany({ orderBy: { createdAt: "desc" }, take: 6, select: { id: true, name: true, status: true, createdAt: true } }),
        prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 6, select: { id: true, name: true, subject: true, isRead: true, createdAt: true } }),
        prisma.post.findMany({ where: { createdAt: { gte: heatmapSince } }, select: { createdAt: true } }),
    ]);

    // ── Günlük seri (eksik günler sıfır) ──
    const byDay = new Map(statsRows.map((row) => [new Date(row.date).toISOString().slice(0, 10), row]));
    const labelFmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone: "UTC" });
    const traffic: TrafficPoint[] = Array.from({ length: 30 }, (_, i) => {
        const day = new Date(since.getTime() + i * DAY);
        const key = day.toISOString().slice(0, 10);
        const row = byDay.get(key);
        return { key, label: labelFmt.format(day), pageViews: row?.pageViews ?? 0, uniqueVisitors: row?.uniqueVisitors ?? 0 };
    });

    const last14 = traffic.slice(-14);
    const visitorsNow = sum(last14.slice(7).map((d) => d.uniqueVisitors));
    const visitorsPrev = sum(last14.slice(0, 7).map((d) => d.uniqueVisitors));
    const viewsNow = sum(last14.slice(7).map((d) => d.pageViews));
    const viewsPrev = sum(last14.slice(0, 7).map((d) => d.pageViews));
    const todayVisitors = traffic[traffic.length - 1].uniqueVisitors;

    const totalViews = viewsAggregate._sum.views ?? 0;
    const drafts = totalPosts - publishedPosts;
    const pendingTotal = pendingComments + pendingGuestbook + unreadMessages;

    // ── Son etkinlikler (yorum, defter, mesaj) ──
    type ActivityItem = { id: string; icon: typeof Mail; tone: string; who: string; what: string; detail?: string; date: Date; href: string; pending: boolean };
    const activity: ActivityItem[] = [
        ...latestComments.map((c) => ({
            id: `c-${c.id}`,
            icon: MessageSquareDot,
            tone: "text-indigo-500 bg-indigo-500/10",
            who: c.name,
            what: "yorum yaptı",
            detail: c.post?.title,
            date: c.createdAt,
            href: "/admin/comments",
            pending: c.status === "pending",
        })),
        ...latestGuestbook.map((g) => ({
            id: `g-${g.id}`,
            icon: BookHeart,
            tone: "text-rose-500 bg-rose-500/10",
            who: g.name,
            what: "deftere yazdı",
            date: g.createdAt,
            href: "/admin/guestbook",
            pending: g.status === "pending",
        })),
        ...latestMessages.map((m) => ({
            id: `m-${m.id}`,
            icon: Mail,
            tone: "text-sky-500 bg-sky-500/10",
            who: m.name,
            what: "mesaj gönderdi",
            detail: m.subject ?? undefined,
            date: m.createdAt,
            href: "/admin/messages",
            pending: !m.isRead,
        })),
    ]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 6);

    const firstName = session?.user?.name?.split(" ").slice(0, 2).join(" ");
    const dateLabel = new Intl.DateTimeFormat("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TZ }).format(now);
    const maxViews = Math.max(1, ...topPosts.map((p) => p.views));

    const tasks = [
        { count: pendingComments, label: "yorum onay bekliyor", href: "/admin/comments?status=pending", icon: MessageSquareDot },
        { count: pendingGuestbook, label: "defter mesajı onay bekliyor", href: "/admin/guestbook?status=pending", icon: BookHeart },
        { count: unreadMessages, label: "okunmamış mesaj", href: "/admin/messages?status=unread", icon: Mail },
        { count: drafts, label: "taslak yazı", href: "/admin/posts?status=draft", icon: PencilLine },
    ];

    return (
        <div className="space-y-6">
            {/* ── Karşılama ─────────────────────────────── */}
            <section className="adm-card adm-enter relative overflow-hidden p-6 sm:p-8">
                <div aria-hidden className="pointer-events-none absolute inset-0 opacity-90" style={{ background: "var(--adm-grad-soft)" }} />
                <div
                    aria-hidden
                    className="adm-float pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full"
                    style={{ background: "radial-gradient(closest-side, rgb(139 92 246 / 0.22), transparent)" }}
                />
                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <p className="flex items-center gap-2 text-xs font-medium capitalize adm-text-3">
                            <CalendarDays className="h-3.5 w-3.5" /> {dateLabel}
                        </p>
                        <h1 className="mt-3 text-[1.75rem] font-semibold leading-tight tracking-tight adm-text sm:text-[2.1rem]">
                            {greetingFor(now)}
                            {firstName ? (
                                <>
                                    , <span className="adm-gradient-text">{firstName}</span>
                                </>
                            ) : null}
                        </h1>
                        <p className="mt-2 text-sm leading-relaxed adm-text-2 sm:text-[0.95rem]">
                            Bugün sitene <strong className="font-semibold adm-text">{todayVisitors.toLocaleString("tr-TR")}</strong> tekil ziyaretçi uğradı.{" "}
                            {pendingTotal > 0 ? (
                                <>
                                    Seni bekleyen <strong className="font-semibold adm-text">{pendingTotal}</strong> iş var.
                                </>
                            ) : (
                                "Bekleyen işin yok — her şey yolunda."
                            )}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <ButtonLink href="/admin/posts/new" variant="primary" className="adm-nudge">
                            <PenLine className="adm-nudge-rot" /> Yeni yazı
                        </ButtonLink>
                        <ButtonAnchor href="/" target="_blank" rel="noopener noreferrer" variant="secondary" className="adm-nudge">
                            Siteyi görüntüle <ArrowUpRight className="adm-nudge-up" />
                        </ButtonAnchor>
                    </div>
                </div>
            </section>

            {/* ── Göstergeler ───────────────────────────── */}
            <section aria-label="Özet göstergeler" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard
                    index={1}
                    icon={Users}
                    label="Tekil ziyaretçi"
                    sublabel="7 gün"
                    value={visitorsNow}
                    delta={change(visitorsNow, visitorsPrev)}
                    spark={last14.map((d) => d.uniqueVisitors)}
                    sparkColor="var(--chart-2)"
                />
                <KpiCard
                    index={2}
                    icon={MousePointerClick}
                    label="Sayfa görüntüleme"
                    sublabel="7 gün"
                    value={viewsNow}
                    delta={change(viewsNow, viewsPrev)}
                    spark={last14.map((d) => d.pageViews)}
                    sparkColor="var(--chart-1)"
                />
                <Card interactive enter={3} className="p-5">
                    <KpiLabel icon={Eye} label="Toplam okunma" hint="Tüm zamanlar" />
                    <div className="mt-3 flex items-end justify-between gap-3">
                        <p className="text-[1.9rem] font-semibold leading-none tracking-tight adm-text">
                            <AnimatedNumber value={totalViews} />
                        </p>
                        <span className="adm-icon-tile h-10 w-10 rounded-xl">
                            <Flame className="h-[1.1rem] w-[1.1rem]" />
                        </span>
                    </div>
                    <p className="mt-4 text-xs adm-text-3">
                        Yazı başına ortalama{" "}
                        <span className="font-semibold adm-text-2">{publishedPosts ? Math.round(totalViews / publishedPosts).toLocaleString("tr-TR") : 0}</span> okunma
                    </p>
                </Card>
                <Card interactive enter={4} className="p-5">
                    <KpiLabel icon={FileText} label="Yayındaki yazılar" />
                    <div className="mt-3 flex items-end justify-between gap-3">
                        <p className="text-[1.9rem] font-semibold leading-none tracking-tight adm-text">
                            <AnimatedNumber value={publishedPosts} />
                            <span className="ml-1 text-base font-medium adm-text-3">/ {totalPosts}</span>
                        </p>
                        <ProgressRing value={totalPosts ? publishedPosts / totalPosts : 0} label={`Yazıların %${totalPosts ? Math.round((publishedPosts / totalPosts) * 100) : 0} kadarı yayında`} />
                    </div>
                    <p className="mt-4 text-xs adm-text-3">
                        {drafts > 0 ? (
                            <Link href="/admin/posts?status=draft" className="group inline-flex items-center gap-1 transition-colors hover:text-[var(--adm-accent-text)]">
                                <span className="font-semibold adm-text-2 group-hover:text-inherit">{drafts}</span> taslak yayın bekliyor
                                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        ) : (
                            "Taslak yazın yok"
                        )}
                    </p>
                </Card>
            </section>

            {/* ── Trafik + bekleyen işler ───────────────── */}
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <Card enter={5} className="xl:col-span-2">
                    <TrafficChart data={traffic} />
                </Card>

                <Card enter={6} className="flex flex-col">
                    <CardHeader icon={CheckCheck} title="Seni bekleyenler" description={pendingTotal > 0 ? `${pendingTotal} iş onay bekliyor` : "Tüm işler tamam"} />
                    <div className="flex flex-1 flex-col p-3 pt-4">
                        {tasks.every((t) => t.count === 0) ? (
                            <EmptyState compact icon={Sparkles} title="Her şey yolunda" description="Onay bekleyen yorum, mesaj ya da taslak yok." />
                        ) : (
                            <ul className="space-y-1">
                                {tasks.map((task, i) => (
                                    <li key={task.href}>
                                        <Link
                                            href={task.href}
                                            className={cn(
                                                "adm-enter group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-[var(--adm-surface-2)]",
                                                task.count === 0 && "opacity-55",
                                            )}
                                            style={{ "--i": 7 + i } as React.CSSProperties}
                                        >
                                            <span
                                                className={cn(
                                                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
                                                    task.count > 0 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-[var(--adm-surface-2)] adm-text-3",
                                                )}
                                            >
                                                <task.icon className="h-4 w-4" />
                                            </span>
                                            <span className="flex-1 text-sm adm-text-2">
                                                <span className="mr-1 text-base font-semibold tabular-nums adm-text">{task.count}</span>
                                                {task.label}
                                            </span>
                                            <ArrowRight className="h-4 w-4 adm-text-3 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[var(--adm-accent)]" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="mt-auto grid grid-cols-3 gap-2 border-t border-[var(--adm-border)] px-2 pt-4">
                            <MiniStat icon={FolderTree} label="Kategori" value={categoryCount} href="/admin/taxonomy" />
                            <MiniStat icon={Hash} label="Etiket" value={tagCount} href="/admin/taxonomy" />
                            <MiniStat icon={Briefcase} label="Proje" value={projectCount} href="/admin/projects" />
                        </div>
                    </div>
                </Card>
            </section>

            {/* ── En çok okunanlar + etkinlik ───────────── */}
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
                <Card enter={7} className="xl:col-span-3">
                    <CardHeader
                        icon={Flame}
                        title="En çok okunanlar"
                        description="Tüm zamanlar · yayındaki yazılar"
                        action={
                            <ButtonLink href="/admin/posts?sort=views" variant="ghost" size="sm" className="adm-nudge">
                                Tümü <ArrowRight className="adm-nudge-x" />
                            </ButtonLink>
                        }
                    />
                    <div className="p-3 pt-4">
                        {topPosts.length === 0 ? (
                            <EmptyState compact icon={FileText} title="Henüz yayında yazı yok" description="İlk yazını yayınladığında burada görünecek." />
                        ) : (
                            <ol className="space-y-1">
                                {topPosts.map((post, i) => (
                                    <li key={post.id} className="adm-row group flex items-center gap-4 rounded-xl px-3 py-2.5 transition-colors hover:bg-[var(--adm-surface-2)]">
                                        <span
                                            className={cn(
                                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold tabular-nums",
                                                i === 0 ? "text-white shadow-[0_6px_14px_-6px_rgb(99_102_241/0.8)]" : "bg-[var(--adm-surface-2)] adm-text-2",
                                            )}
                                            style={i === 0 ? { background: "var(--adm-grad)" } : undefined}
                                        >
                                            {i + 1}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-baseline justify-between gap-3">
                                                <Link href={`/admin/posts/edit/${post.id}`} className="truncate text-sm font-medium adm-text transition-colors hover:text-[var(--adm-accent-text)]">
                                                    {post.title}
                                                </Link>
                                                <span className="shrink-0 text-xs font-semibold tabular-nums adm-text-2">{post.views.toLocaleString("tr-TR")}</span>
                                            </div>
                                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--adm-surface-3)]">
                                                <div
                                                    className="adm-grow-x h-full rounded-full"
                                                    style={{ width: `${(post.views / maxViews) * 100}%`, background: "var(--adm-accent)", "--i": i } as React.CSSProperties}
                                                />
                                            </div>
                                        </div>
                                        <div className="adm-row-actions">
                                            <ViewOnSite href={`/blog/${post.slug}`} tipPos="left" />
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </div>
                </Card>

                <Card enter={8} className="xl:col-span-2">
                    <CardHeader icon={Activity} title="Son etkinlikler" description="Yorumlar, defter ve mesajlar" />
                    <div className="p-3 pt-4">
                        {activity.length === 0 ? (
                            <EmptyState compact icon={Activity} title="Henüz etkinlik yok" />
                        ) : (
                            <ul className="relative space-y-1 before:absolute before:bottom-6 before:left-[1.85rem] before:top-6 before:w-px before:bg-[var(--adm-border)]">
                                {activity.map((item, i) => (
                                    <li key={item.id} className="adm-enter relative" style={{ "--i": 9 + i } as React.CSSProperties}>
                                        <Link href={item.href} className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[var(--adm-surface-2)]">
                                            <span className={cn("relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-[var(--adm-surface)] transition-transform duration-300 group-hover:scale-110", item.tone)}>
                                                <item.icon className="h-3.5 w-3.5" />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm adm-text-2">
                                                    <span className="font-semibold adm-text">{item.who}</span> {item.what}
                                                    {item.pending && <span className="ml-1.5 inline-block h-1.5 w-1.5 -translate-y-0.5 rounded-full bg-amber-500" title="Bekliyor" />}
                                                </p>
                                                {item.detail && <p className="truncate text-xs adm-text-3">{item.detail}</p>}
                                            </div>
                                            <span className="shrink-0 pt-0.5 text-[0.7rem] adm-text-3">{ago(item.date)}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </Card>
            </section>

            {/* ── Son düzenlenenler + yayın takvimi ──────── */}
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
                <Card enter={9} className="xl:col-span-3">
                    <CardHeader
                        icon={PencilLine}
                        title="Son düzenlenen yazılar"
                        action={
                            <ButtonLink href="/admin/posts" variant="ghost" size="sm" className="adm-nudge">
                                Tüm yazılar <ArrowRight className="adm-nudge-x" />
                            </ButtonLink>
                        }
                    />
                    <div className="p-3 pt-4">
                        {recentPosts.length === 0 ? (
                            <EmptyState
                                compact
                                icon={PenLine}
                                title="Henüz yazı yok"
                                action={
                                    <ButtonLink href="/admin/posts/new" variant="primary" size="sm">
                                        İlk yazını oluştur
                                    </ButtonLink>
                                }
                            />
                        ) : (
                            <ul className="space-y-1">
                                {recentPosts.map((post) => (
                                    <li key={post.id} className="adm-row group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[var(--adm-surface-2)]">
                                        <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-[var(--adm-surface-3)]">
                                            {post.coverImage ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={post.coverImage} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            ) : (
                                                <FileText className="absolute inset-0 m-auto h-4 w-4 adm-text-3" />
                                            )}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <Link href={`/admin/posts/edit/${post.id}`} className="block truncate text-sm font-medium adm-text transition-colors hover:text-[var(--adm-accent-text)]">
                                                {post.title}
                                            </Link>
                                            <p className="mt-0.5 truncate text-xs adm-text-3">
                                                {post.category?.name ?? "Kategorisiz"} · {ago(post.updatedAt)}
                                            </p>
                                        </div>
                                        <StatusBadge published={post.published} />
                                        <div className="adm-row-actions hidden items-center gap-0.5 sm:flex">
                                            <ViewOnSite href={`/blog/${post.slug}`} disabled={!post.published} tipPos="left" />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </Card>

                <Card enter={10} className="xl:col-span-2">
                    <CardHeader icon={CalendarDays} title="Yayın takvimi" description="Haftalara göre oluşturulan yazılar" />
                    <div className="p-5 pt-4 sm:p-6 sm:pt-4">
                        <PublishingHeatmap dates={heatmapPosts.map((p) => p.createdAt)} now={now} />
                    </div>
                </Card>
            </section>
        </div>
    );
}

function KpiCard({
    index,
    icon: Icon,
    label,
    sublabel,
    value,
    delta,
    spark,
    sparkColor,
}: {
    index: number;
    icon: typeof Users;
    label: string;
    sublabel: string;
    value: number;
    delta: number | null;
    spark: number[];
    sparkColor: string;
}) {
    const up = (delta ?? 0) >= 0;
    return (
        <Card interactive enter={index} className="p-5">
            <KpiLabel icon={Icon} label={label} hint={sublabel} />
            <div className="mt-3 flex items-end justify-between gap-3">
                <p className="text-[1.9rem] font-semibold leading-none tracking-tight adm-text">
                    <AnimatedNumber value={value} />
                </p>
                <Sparkline values={spark} color={sparkColor} label={`${label}: son 14 günün eğilimi`} width={104} height={38} />
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs adm-text-3">
                {delta === null ? (
                    <span>Önceki haftada veri yok</span>
                ) : (
                    <>
                        <span
                            className={cn(
                                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold",
                                up ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                            )}
                        >
                            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {up ? "+" : ""}
                            {delta}%
                        </span>
                        <span>önceki 7 güne göre</span>
                    </>
                )}
            </div>
        </Card>
    );
}

function KpiLabel({ icon: Icon, label, hint }: { icon: typeof Users; label: string; hint?: string }) {
    return (
        <div className="flex items-center justify-between gap-2">
            <p className="flex min-w-0 items-center gap-2 truncate text-[0.8125rem] font-medium adm-text-2">
                <Icon className="h-4 w-4 shrink-0 adm-text-3" /> {label}
            </p>
            {hint && <span className="shrink-0 rounded-md bg-[var(--adm-surface-2)] px-1.5 py-0.5 text-[0.68rem] font-medium adm-text-3">{hint}</span>}
        </div>
    );
}

function MiniStat({ icon: Icon, label, value, href }: { icon: typeof Hash; label: string; value: number; href: string }) {
    return (
        <Link href={href} className="group rounded-xl p-2 text-center transition-colors hover:bg-[var(--adm-surface-2)]">
            <Icon className="mx-auto h-4 w-4 adm-text-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:text-[var(--adm-accent)]" />
            <p className="mt-1.5 text-lg font-semibold leading-none tabular-nums adm-text">{value}</p>
            <p className="mt-1 text-[0.7rem] adm-text-3">{label}</p>
        </Link>
    );
}
