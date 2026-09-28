"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/admin";

type FormState = { error: string; success: boolean; message: string };

function simpleSlugify(text: string) {
    const trMap: Record<string, string> = {
        'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
        'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
    };
    return text
        .replace(/[çğıöşüÇĞİÖŞÜ]/g, match => trMap[match])
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

export async function createCategory(_prevState: FormState, formData: FormData): Promise<FormState> {
    await checkAdmin();
    const name = formData.get("name") as string;
    if (!name || name.trim().length < 2) return { error: "En az 2 karakter girmelisiniz.", success: false, message: "" };

    const slug = simpleSlugify(name);

    try {
        await prisma.category.create({ data: { name, slug } });
        revalidatePath("/admin/categories");
        return { success: true, message: "Kategori eklendi!", error: "" };
    } catch (error: unknown) {
        const prismaError = error as { code?: string };
        if (prismaError.code === 'P2002') return { error: "Bu kategori zaten mevcut.", success: false, message: "" };
        return { error: "Bir hata oluştu.", success: false, message: "" };
    }
}

export async function deleteCategory(id: string) {
    try {
        await checkAdmin();
        await prisma.category.delete({ where: { id } });
        revalidatePath("/admin/categories");
        return { success: true };
    } catch (error) {
        return { error: "Kategori silinemedi. (Yazıya bağlı olabilir)" };
    }
}

export async function createTag(_prevState: FormState, formData: FormData): Promise<FormState> {
    await checkAdmin();
    const name = formData.get("name") as string;
    if (!name || name.trim().length < 2) return { error: "En az 2 karakter girmelisiniz.", success: false, message: "" };

    const slug = simpleSlugify(name);

    try {
        await prisma.tag.create({ data: { name, slug } });
        revalidatePath("/admin/tags");
        return { success: true, message: "Etiket eklendi!", error: "" };
    } catch (error: unknown) {
        const prismaError = error as { code?: string };
        if (prismaError.code === 'P2002') return { error: "Bu etiket zaten mevcut.", success: false, message: "" };
        return { error: "Bir hata oluştu.", success: false, message: "" };
    }
}

export async function deleteTag(id: string) {
    try {
        await checkAdmin();
        await prisma.tag.delete({ where: { id } });
        revalidatePath("/admin/tags");
        return { success: true };
    } catch (error) {
        return { error: "Etiket silinemedi." };
    }
}
