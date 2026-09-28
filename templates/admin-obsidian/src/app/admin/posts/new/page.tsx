import prisma from "@/lib/prisma";
import { PostEditor } from "@/components/admin/posts/PostEditor";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
    const [categories, tags] = await Promise.all([
        prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
        prisma.tag.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    ]);

    return <PostEditor mode="create" categories={categories} tags={tags} />;
}
