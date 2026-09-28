import { ProjectForm } from "../ProjectForm";
import { createProject } from "@/app/admin/actions/project";

export default function NewProjectPage() {
    return <ProjectForm action={createProject} />;
}
