"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/admin";

type FormState = { error: string; success: boolean; message: string };

export async function updateSettings(_prevState: FormState, formData: FormData): Promise<FormState> {
    try {
        await checkAdmin();

        const siteTitle = formData.get("siteTitle") as string;
        const siteDescription = formData.get("siteDescription") as string;
        const heroTitle = formData.get("heroTitle") as string;
        const heroSubtitle = formData.get("heroSubtitle") as string;
        const seoKeywords = formData.get("seoKeywords") as string;
        const ogImageUrl = formData.get("ogImageUrl") as string;
        const faviconUrl = formData.get("faviconUrl") as string;
        const contactTitle = formData.get("contactTitle") as string;
        const contactText = formData.get("contactText") as string;

        // Process dynamic social links
        const socialLinksData: Record<string, string> = {};
        const socialKeys = ["twitter", "github", "linkedin", "instagram"];

        socialKeys.forEach(platform => {
            const val = formData.get(`social_${platform}`) as string;
            if (val) socialLinksData[platform] = val;
        });

        const socialLinks = JSON.stringify(socialLinksData);
        const settings = await prisma.siteSettings.findFirst();

        const data = { siteTitle, siteDescription, heroTitle, heroSubtitle, socialLinks, seoKeywords, ogImageUrl, faviconUrl, contactTitle, contactText };

        if (settings) {
            await prisma.siteSettings.update({
                where: { id: settings.id },
                data
            });
        } else {
            await prisma.siteSettings.create({
                data
            });
        }

        revalidatePath("/admin/settings");
        revalidatePath("/");
        return { success: true, message: "Ayarlar başarıyla kaydedildi!", error: "" };
    } catch (error) {
        console.error(error);
        return { error: "Ayarlar güncellenemedi.", success: false, message: "" };
    }
}
