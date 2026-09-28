"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/admin";

type ProjectState = { error?: string; success?: boolean };

function generateSlug(title: string): string {
    const trMap: Record<string, string> = {
        'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
        'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
    };
    return title
        .replace(/[çğıöşüÇĞİÖŞÜ]/g, (m) => trMap[m])
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

export async function createProject(_prevState: ProjectState, formData: FormData): Promise<ProjectState> {
    try {
        await checkAdmin();
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const content = formData.get("content") as string || null;
        const coverImage = formData.get("coverImage") as string || null;
        const detailCoverImage = formData.get("detailCoverImage") as string || null;
        const logoUrl = formData.get("logoUrl") as string || null;
        const githubUrl = formData.get("githubUrl") as string || null;
        const liveUrl = formData.get("liveUrl") as string || null;
        const link = formData.get("link") as string || null;
        const isExternal = formData.get("isExternal") === "true";
        const status = formData.get("status") as string;
        const color = formData.get("color") as string;
        const order = parseInt(formData.get("order") as string) || 0;
        const published = formData.get("published") === "true";
        const tagsRaw = formData.get("tags") as string;
        const slugOverride = formData.get("slug") as string;
        const privacyPolicy = formData.get("privacyPolicy") as string || null;
        const termsOfUse = formData.get("termsOfUse") as string || null;
        const privacyPolicyEn = formData.get("privacyPolicyEn") as string || null;
        const termsOfUseEn = formData.get("termsOfUseEn") as string || null;

        if (!title || !description) {
            return { error: "Başlık ve açıklama zorunludur." };
        }

        const tags = tagsRaw
            ? JSON.stringify(tagsRaw.split(",").map((t) => t.trim()).filter(Boolean))
            : "[]";

        // Unique slug üret
        const baseSlug = slugOverride?.trim() || generateSlug(title);
        let slug = baseSlug;
        let counter = 1;
        while (await prisma.project.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter++}`;
        }

        await prisma.project.create({
            data: {
                title, slug, description, content, coverImage, detailCoverImage, logoUrl,
                link, githubUrl, liveUrl, isExternal,
                status, color, order, published, tags,
                privacyPolicy, termsOfUse, privacyPolicyEn, termsOfUseEn
            },
        });

        const { revalidateTag } = await import("next/cache");
        revalidatePath("/admin/projects");
        revalidatePath("/projeler");
        revalidatePath(`/projeler/${slug}`);
        revalidatePath("/");
        try { (revalidateTag as any)("all-posts"); } catch (e) { }
        try { (revalidateTag as any)("all-tags"); } catch (e) { }

        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Proje oluşturulamadı." };
    }
}

export async function updateProject(id: string, _prevState: ProjectState, formData: FormData): Promise<ProjectState> {
    try {
        await checkAdmin();
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const content = formData.get("content") as string || null;
        const coverImage = formData.get("coverImage") as string || null;
        const detailCoverImage = formData.get("detailCoverImage") as string || null;
        const logoUrl = formData.get("logoUrl") as string || null;
        const githubUrl = formData.get("githubUrl") as string || null;
        const liveUrl = formData.get("liveUrl") as string || null;
        const link = formData.get("link") as string || null;
        const isExternal = formData.get("isExternal") === "true";
        const status = formData.get("status") as string;
        const color = formData.get("color") as string;
        const order = parseInt(formData.get("order") as string) || 0;
        const published = formData.get("published") === "true";
        const tagsRaw = formData.get("tags") as string;
        const slugOverride = formData.get("slug") as string;
        const privacyPolicy = formData.get("privacyPolicy") as string || null;
        const termsOfUse = formData.get("termsOfUse") as string || null;
        const privacyPolicyEn = formData.get("privacyPolicyEn") as string || null;
        const termsOfUseEn = formData.get("termsOfUseEn") as string || null;

        if (!title || !description) {
            return { error: "Başlık ve açıklama zorunludur." };
        }

        const tags = tagsRaw
            ? JSON.stringify(tagsRaw.split(",").map((t) => t.trim()).filter(Boolean))
            : "[]";

        // Slug güncelle (çakışma kontrolü)
        const existing = await prisma.project.findUnique({ where: { id } });
        let slug = existing?.slug || generateSlug(title);
        if (slugOverride?.trim() && slugOverride.trim() !== slug) {
            const newSlug = slugOverride.trim();
            const conflict = await prisma.project.findUnique({ where: { slug: newSlug } });
            if (!conflict || conflict.id === id) {
                slug = newSlug;
            } else {
                return { error: "Bu slug başka bir proje tarafından kullanılıyor." };
            }
        }

        // Slug yoksa otomatik ata
        if (!slug) slug = generateSlug(title);

        await prisma.project.update({
            where: { id },
            data: {
                title, slug, description, content, coverImage, detailCoverImage, logoUrl,
                link, githubUrl, liveUrl, isExternal,
                status, color, order, published, tags,
                privacyPolicy, termsOfUse, privacyPolicyEn, termsOfUseEn
            },
        });

        const { revalidateTag } = await import("next/cache");
        revalidatePath("/admin/projects");
        revalidatePath("/projeler");
        revalidatePath(`/projeler/${slug}`);
        revalidatePath("/");
        try { (revalidateTag as any)("all-posts"); } catch (e) { }
        try { (revalidateTag as any)("all-tags"); } catch (e) { }

        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Proje güncellenemedi." };
    }
}

export async function deleteProject(id: string) {
    try {
        await checkAdmin();
        const project = await prisma.project.findUnique({ where: { id } });
        await prisma.project.delete({ where: { id } });

        const { revalidateTag } = await import("next/cache");
        revalidatePath("/admin/projects");
        revalidatePath("/projeler");
        if (project?.slug) revalidatePath(`/projeler/${project.slug}`);
        revalidatePath("/");
        try { (revalidateTag as any)("all-posts"); } catch (e) { }
        try { (revalidateTag as any)("all-tags"); } catch (e) { }

        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Proje silinemedi." };
    }
}
