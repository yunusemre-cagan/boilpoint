import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { PostEditor } from "@/components/admin/posts/PostEditor";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [post, categories, tags] = await Promise.all([
        prisma.post.findUnique({
            where: { id },
            include: { tags: { include: { tag: { select: { id: true, name: true } } } } },
        }),
        prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
        prisma.tag.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    ]);

    if (!post) notFound();

    return (
        <PostEditor
            key={post.id}
            mode="edit"
            post={{
                id: post.id,
                title: post.title,
                slug: post.slug,
                excerpt: post.excerpt,
                content: post.content,
                coverImage: post.coverImage,
                detailCoverImage: post.detailCoverImage,
                categoryId: post.categoryId,
                published: post.published,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
                tags: post.tags.map((t) => t.tag),
            }}
            categories={categories}
            tags={tags}
        />
    );
}
