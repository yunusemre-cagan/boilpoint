"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { checkAdmin } from "@/lib/admin";

const trMap: Record<string, string> = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
};

function generateTagSlug(name: string): string {
    let slug = name.replace(/[çğıöşüÇĞİÖŞÜ]/g, (m) => trMap[m])
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    
    if (!slug) {
        slug = "tag-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    }
    return slug;
}

export async function createPost(prevState: any, formData: FormData) {
    try {
        await checkAdmin();
        const title = formData.get("title") as string;
        const slug = formData.get("slug") as string;
        const excerpt = formData.get("excerpt") as string;
        const content = formData.get("content") as string;
        const coverImage = formData.get("coverImage") as string;
        const detailCoverImage = formData.get("detailCoverImage") as string;
        const categoryId = formData.get("categoryId") as string;
        const published = formData.get("published") === "true";
        const tags = formData.getAll("tags") as string[];

        if (!title || !slug || !content) {
            return { error: "Başlık, slug ve içerik zorunludur." };
        }

        // Check slug
        const existing = await prisma.post.findUnique({ where: { slug } });
        if (existing) return { error: "Bu URL (slug) zaten kullanılıyor." };

        // Calculate reading time (roughly 200 words per min)
        const words = content.trim().split(/\s+/).length;
        const readingTime = Math.max(1, Math.ceil(words / 200));

        const processedTags = await Promise.all(tags.map(async (t) => {
            // Check if it's an existing ID or a name
            const existing = await prisma.tag.findUnique({ where: { id: t } });
            if (existing) return { tagId: existing.id };

            // Create new tag if not exists
            const tagSlug = generateTagSlug(t);

            const newTag = await prisma.tag.upsert({
                where: { slug: tagSlug },
                update: {},
                create: { name: t, slug: tagSlug }
            });
            return { tagId: newTag.id };
        }));

        const uniqueTagIds = Array.from(new Set(processedTags.map(pt => pt.tagId)));
        const finalTags = uniqueTagIds.map(id => ({ tagId: id }));

        await prisma.post.create({
            data: {
                title, slug, excerpt, content, coverImage: coverImage || null, detailCoverImage: detailCoverImage || null, published, readingTime,
                categoryId: categoryId || null,
                tags: {
                    create: finalTags
                }
            }
        });

        revalidatePath("/admin/posts");
        revalidatePath("/blog");
        revalidatePath(`/blog/${slug}`);
        revalidatePath("/");
        (revalidateTag as any)("all-posts");
        (revalidateTag as any)("all-tags");

        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Yazı oluşturulamadı." };
    }
}

export async function updatePost(id: string, prevState: any, formData: FormData) {
    try {
        await checkAdmin();
        const title = formData.get("title") as string;
        const slug = formData.get("slug") as string;
        const excerpt = formData.get("excerpt") as string;
        const content = formData.get("content") as string;
        const coverImage = formData.get("coverImage") as string;
        const detailCoverImage = formData.get("detailCoverImage") as string;
        const categoryId = formData.get("categoryId") as string;
        const published = formData.get("published") === "true";
        const tags = formData.getAll("tags") as string[];

        if (!title || !slug || !content) {
            return { error: "Başlık, slug ve içerik zorunludur." };
        }

        const words = content.trim().split(/\s+/).length;
        const readingTime = Math.max(1, Math.ceil(words / 200));

        // Delete existing tags
        await prisma.postTag.deleteMany({ where: { postId: id } });

        const processedTags = await Promise.all(tags.map(async (t) => {
            const existing = await prisma.tag.findUnique({ where: { id: t } });
            if (existing) return { tagId: existing.id };

            const tagSlug = generateTagSlug(t);

            const newTag = await prisma.tag.upsert({
                where: { slug: tagSlug },
                update: {},
                create: { name: t, slug: tagSlug }
            });
            return { tagId: newTag.id };
        }));

        const uniqueTagIds = Array.from(new Set(processedTags.map(pt => pt.tagId)));
        const finalTags = uniqueTagIds.map(id => ({ tagId: id }));

        await prisma.post.update({
            where: { id },
            data: {
                title, slug, excerpt, content, coverImage: coverImage || null, detailCoverImage: detailCoverImage || null, published, readingTime,
                categoryId: categoryId || null,
                tags: {
                    create: finalTags
                }
            }
        });

        revalidatePath("/admin/posts");
        revalidatePath("/blog");
        revalidatePath(`/blog/${slug}`);
        revalidatePath("/");
        (revalidateTag as any)("all-posts");
        (revalidateTag as any)("all-tags");

        return { success: true };
    } catch (error: any) {
        console.error(error);
        if (error.code === 'P2002') return { error: "Yazı URL (slug) benzersiz olmalıdır." };
        return { error: "Yazı güncellenemedi." };
    }
}

export async function deletePost(id: string) {
    try {
        await checkAdmin();
        const post = await prisma.post.findUnique({ where: { id } });
        await prisma.post.delete({ where: { id } });

        revalidatePath("/admin/posts");
        revalidatePath("/blog");
        if (post) revalidatePath(`/blog/${post.slug}`);
        revalidatePath("/");
        (revalidateTag as any)("all-posts");
        (revalidateTag as any)("all-tags");

        return { success: true };
    } catch (error) {
        return { error: "Yazı silinemedi." };
    }
}
