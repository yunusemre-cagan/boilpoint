import Link from "next/link";
import { Briefcase, Github, Globe, PenLine, Plus } from "lucide-react";
import prisma from "@/lib/prisma";
import { deleteProject } from "@/app/admin/actions/project";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Badge, ButtonLink, EmptyState, PageHeader, Thumb, ViewOnSite } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, "success" | "info" | "warning" | "danger"> = {
    Aktif: "success",
    Tamamlandı: "info",
    "Devam Ediyor": "warning",
    Durduruldu: "danger",
};

export default async function AdminProjectsPage() {
    const projects = await prisma.project.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
    const published = projects.filter((p) => p.published).length;

    return (
        <div className="space-y-6">
            <PageHeader
                icon={Briefcase}
                title="Projeler"
                description={`${projects.length} proje · ${published} tanesi /projeler sayfasında görünüyor. Kartlar "Sıra" değerine göre dizilir.`}
                actions={
                    <ButtonLink href="/admin/projects/new" variant="primary" className="adm-nudge">
                        <Plus className="adm-nudge-rot" /> Yeni proje
                    </ButtonLink>
                }
            />

            {projects.length === 0 ? (
                <div className="adm-card">
                    <EmptyState
                        icon={Briefcase}
                        title="Henüz proje eklenmemiş"
                        description="Portfolyonu oluşturmak için ilk projeni ekle."
                        action={
                            <ButtonLink href="/admin/projects/new" variant="primary" size="sm">
                                <Plus /> İlk projeyi ekle
                            </ButtonLink>
                        }
                    />
                </div>
            ) : (
                <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
                    {projects.map((project, i) => {
                        let tags: string[] = [];
                        try {
                            tags = JSON.parse(project.tags);
                        } catch {
                            /* boş */
                        }
                        return (
                            <li key={project.id} className="adm-card adm-card-interactive adm-enter group flex flex-col overflow-hidden" style={{ "--i": i } as React.CSSProperties}>
                                <div className={`relative isolate h-32 overflow-hidden bg-gradient-to-br ${project.color}`}>
                                    {project.coverImage && (
                                        <Thumb src={project.coverImage} width={800} height={260} className="absolute inset-0 h-full w-full bg-transparent" imgClassName="transition-transform duration-700 group-hover:scale-105" />
                                    )}
                                    <div className="adm-grid-lines opacity-40" aria-hidden />
                                    <div className="absolute left-4 top-4 flex items-center gap-2">
                                        {project.published ? (
                                            <Badge tone={STATUS_TONE[project.status] ?? "success"} dot className="bg-white/90 dark:bg-zinc-900/90">
                                                {project.status}
                                            </Badge>
                                        ) : (
                                            <Badge tone="neutral" className="bg-white/90 dark:bg-zinc-900/90">
                                                Gizli
                                            </Badge>
                                        )}
                                    </div>
                                    <span className="absolute right-4 top-4 rounded-md bg-black/40 px-1.5 py-0.5 text-[0.65rem] font-semibold tabular-nums text-white">#{project.order}</span>
                                </div>
                                <div className="flex flex-1 flex-col p-5 pt-0">
                                    <div className="-mt-7 mb-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border-4 border-[var(--adm-surface)] bg-[var(--adm-surface-2)] text-lg font-bold shadow-[var(--adm-shadow-sm)] adm-text-2">
                                        {project.logoUrl ? <Thumb src={project.logoUrl} width={112} height={112} className="h-full w-full" /> : project.title.charAt(0)}
                                    </div>
                                    <Link href={`/admin/projects/edit/${project.id}`} className="font-semibold tracking-tight adm-text transition-colors hover:text-[var(--adm-accent-text)]">
                                        {project.title}
                                    </Link>
                                    <p className="mt-1 line-clamp-2 text-sm adm-text-3">{project.description}</p>
                                    {tags.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            {tags.slice(0, 5).map((tag) => (
                                                <span key={tag} className="rounded-md bg-[var(--adm-surface-2)] px-2 py-0.5 text-[0.7rem] font-medium adm-text-2">
                                                    {tag}
                                                </span>
                                            ))}
                                            {tags.length > 5 && <span className="px-1 text-[0.7rem] adm-text-3">+{tags.length - 5}</span>}
                                        </div>
                                    )}
                                    <div className="min-h-4 flex-1" />
                                    <div className="flex items-center gap-1 border-t border-[var(--adm-border)] pt-3">
                                        <ButtonLink href={`/admin/projects/edit/${project.id}`} variant="ghost" size="sm" className="-ml-2">
                                            <PenLine /> Düzenle
                                        </ButtonLink>
                                        <div className="ml-auto flex items-center gap-0.5">
                                            {project.githubUrl && (
                                                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-ghost adm-btn-sm adm-btn-icon adm-tip" data-tip="GitHub" aria-label="GitHub">
                                                    <Github />
                                                </a>
                                            )}
                                            {project.liveUrl && (
                                                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-ghost adm-btn-sm adm-btn-icon adm-tip" data-tip="Canlı demo" aria-label="Canlı demo">
                                                    <Globe />
                                                </a>
                                            )}
                                            {project.slug && (
                                                <ViewOnSite href={`/projeler/${project.slug}`} disabled={!project.published} disabledReason="Gizli projeler sitede görünmez" />
                                            )}
                                            <DeleteButton id={project.id} action={deleteProject} title="Projeyi sil" successMessage="Proje silindi" />
                                        </div>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
