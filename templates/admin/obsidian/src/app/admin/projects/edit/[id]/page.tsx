import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProjectForm } from "../../ProjectForm";
import { updateProject } from "@/app/admin/actions/project";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) notFound();

    const updateProjectWithId = updateProject.bind(null, project.id);

    return <ProjectForm key={project.id} defaultValues={project} action={updateProjectWithId} />;
}
