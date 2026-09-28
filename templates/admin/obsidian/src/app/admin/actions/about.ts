"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { checkAdmin } from "@/lib/admin";

export async function getAboutData() {
    return await prisma.about.findFirst({
        include: {
            technologies: true,
            interests: true,
            socialAccounts: { orderBy: { order: 'asc' } },
            experiences: { orderBy: { order: 'asc' } },
            educations: { orderBy: { order: 'asc' } },
        },
    });
}

export async function updateAbout(prevState: any, formData: FormData) {
    await checkAdmin();

    const name = formData.get("name") as string;
    const jobTitle = formData.get("jobTitle") as string;
    const location = formData.get("location") as string;
    const email = formData.get("email") as string;
    const bio = formData.get("bio") as string;

    let avatarUrl = formData.get("avatarUrl") as string || null;
    const avatarFile = formData.get("avatarFile") as File | null;

    // Handle File Upload if present
    if (avatarFile && avatarFile.size > 0 && avatarFile.name !== "undefined") {
        try {
            const { v2: cloudinary } = await import("cloudinary");
            const arrayBuffer = await avatarFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Configure Cloudinary (it uses global config if already set, but we can be explicit or just rely on the lib)
            // Since we have src/lib/cloudinary.ts, it's better to use it if it exports a configured instance.
            // However, looking at previous steps, we setup config via env vars.

            const uploadResponse = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: (process.env.CLOUDINARY_FOLDER || "obsidian-media") + "/avatars",
                        resource_type: "auto",
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(buffer);
            }) as any;

            if (uploadResponse.secure_url) {
                avatarUrl = uploadResponse.secure_url;
            }
        } catch (error) {
            console.error("Avatar upload to Cloudinary failed:", error);
        }
    }

    // Technologies and Interests are passed as JSON strings or multiple fields
    const technologiesJson = formData.get("technologies") as string;
    const interestsJson = formData.get("interests") as string;

    const technologies = JSON.parse(technologiesJson || "[]");
    const interests = JSON.parse(interestsJson || "[]");
    const socialAccounts = JSON.parse(formData.get("socialAccounts") as string || "[]").map((s: any) => {
        let url = (s.url || "").trim();
        if (url && !url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("mailto:")) {
            url = `https://${url}`;
        }
        return { ...s, url };
    });
    const experiences = JSON.parse(formData.get("experiences") as string || "[]");
    const educations = JSON.parse(formData.get("educations") as string || "[]");
    const stats = formData.get("stats") as string || null;

    try {
        const existing = await prisma.about.findFirst();

        if (existing) {
            await prisma.$transaction([
                // Update basic info
                prisma.about.update({
                    where: { id: existing.id },
                    data: { name, jobTitle, location, email, bio, avatarUrl, stats }
                }),
                // Simple approach: delete and recreate nested lists
                prisma.technology.deleteMany({ where: { aboutId: existing.id } }),
                prisma.interest.deleteMany({ where: { aboutId: existing.id } }),
                prisma.socialAccount.deleteMany({ where: { aboutId: existing.id } }),
                prisma.experience.deleteMany({ where: { aboutId: existing.id } }),
                prisma.education.deleteMany({ where: { aboutId: existing.id } }),
                prisma.technology.createMany({
                    data: technologies.map((t: any) => ({ name: t.name, aboutId: existing.id }))
                }),
                prisma.interest.createMany({
                    data: interests.map((i: any) => ({
                        title: i.title,
                        description: i.description,
                        icon: i.icon,
                        color: i.color,
                        bg: i.bg,
                        aboutId: existing.id
                    }))
                }),
                prisma.socialAccount.createMany({
                    data: socialAccounts.map((s: any, index: number) => ({
                        platform: s.platform,
                        url: s.url,
                        isActive: s.isActive ?? true,
                        showOnAbout: s.showOnAbout ?? true,
                        order: index,
                        aboutId: existing.id
                    }))
                }),
                prisma.experience.createMany({
                    data: experiences.map((e: any, index: number) => ({
                        company: e.company,
                        position: e.position,
                        period: e.period,
                        description: e.description,
                        current: e.current ?? false,
                        order: index,
                        aboutId: existing.id
                    }))
                }),
                prisma.education.createMany({
                    data: educations.map((e: any, index: number) => ({
                        school: e.school,
                        degree: e.degree,
                        period: e.period,
                        description: e.description || "",
                        order: index,
                        aboutId: existing.id
                    }))
                })
            ]);
        } else {
            await prisma.about.create({
                data: {
                    name, jobTitle, location, email, bio, avatarUrl, stats,
                    technologies: {
                        create: technologies.map((t: any) => ({ name: t.name }))
                    },
                    interests: {
                        create: interests.map((i: any) => ({
                            title: i.title,
                            description: i.description,
                            icon: i.icon,
                            color: i.color,
                            bg: i.bg,
                        }))
                    },
                    socialAccounts: {
                        create: socialAccounts.map((s: any, index: number) => ({
                            platform: s.platform,
                            url: s.url,
                            isActive: s.isActive ?? true,
                            showOnAbout: s.showOnAbout ?? true,
                            order: index,
                        }))
                    },
                    experiences: {
                        create: experiences.map((e: any, index: number) => ({
                            company: e.company,
                            position: e.position,
                            period: e.period,
                            description: e.description,
                            current: e.current ?? false,
                            order: index,
                        }))
                    },
                    educations: {
                        create: educations.map((e: any, index: number) => ({
                            school: e.school,
                            degree: e.degree,
                            period: e.period,
                            description: e.description || "",
                            order: index,
                        }))
                    }
                }
            });
        }

        revalidatePath("/");
        revalidatePath("/hakkimda");
        revalidatePath("/admin/about");
        try { (revalidateTag as any)("all-posts"); } catch (e) { }
        return { success: true };
    } catch (error) {
        console.error("Failed to update about info:", error);
        return { error: "Güncelleme sırasında bir hata oluştu." };
    }
}
