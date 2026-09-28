import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding initial data for Obsidian Admin...");

    // 1. Admin User
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            name: "Admin User",
            email: adminEmail,
            password: hashedPassword,
            role: "admin",
        },
    });
    console.log("✓ Admin User created:", admin.email);

    // 2. Site Settings
    const settings = await prisma.siteSettings.findFirst();
    if (!settings) {
        await prisma.siteSettings.create({
            data: {
                siteTitle: "Obsidian Project",
                siteDescription: "Modern Web Application with Obsidian Admin Dashboard",
                heroTitle: "Build Something Extraordinary",
                heroSubtitle: "Powered by Next.js 15, Tailwind CSS and Obsidian Cockpit",
                socialLinks: JSON.stringify({
                    twitter: "https://twitter.com",
                    github: "https://github.com",
                    linkedin: "https://linkedin.com",
                }),
                contactTitle: "Get in Touch",
                contactText: "Feel free to reach out with any inquiries or feedback.",
            },
        });
        console.log("✓ Site settings seeded");
    }

    // 3. Categories & Tags
    const catTech = await prisma.category.upsert({
        where: { slug: "teknoloji" },
        update: {},
        create: { name: "Teknoloji", slug: "teknoloji" },
    });
    const catDesign = await prisma.category.upsert({
        where: { slug: "tasarim" },
        update: {},
        create: { name: "Tasarım", slug: "tasarim" },
    });

    const tagNext = await prisma.tag.upsert({
        where: { slug: "nextjs" },
        update: {},
        create: { name: "Next.js", slug: "nextjs" },
    });
    const tagReact = await prisma.tag.upsert({
        where: { slug: "react" },
        update: {},
        create: { name: "React", slug: "react" },
    });

    // 4. Sample Post
    const postSlug = "obsidian-admin-paneline-hos-geldiniz";
    const existingPost = await prisma.post.findUnique({ where: { slug: postSlug } });
    if (!existingPost) {
        await prisma.post.create({
            data: {
                title: "Obsidian Admin Paneline Hoş Geldiniz",
                slug: postSlug,
                excerpt: "Bu yazı, Obsidian admin panelinin sunduğu yetenekleri ve içerik yönetimini test etmeniz için oluşturulmuştur.",
                content: "# Hoş Geldiniz!\n\nObsidian, modern web projeleriniz için hazırlanmış güçlü, estetik ve zengin bir yönetim kokpitidir.\n\n## Özellikler\n- **Yapay Zeka Destekli Editör:** Markdown ve yapay zeka ile içerik üretimi.\n- **Gerçek Zamanlı Analitik:** Ziyaretçiler, akışlar, tıklama haritaları.\n- **Tam Moderasyon:** Yorumlar, ziyaretçi defteri ve iletişim mesajları.\n- **Kusursuz Koyu/Açık Tema:** Obsidian tasarım tokenları ile akıcı geçişler.",
                published: true,
                categoryId: catTech.id,
                readingTime: 2,
                views: 120,
                tags: {
                    create: [
                        { tagId: tagNext.id },
                        { tagId: tagReact.id }
                    ]
                }
            }
        });
        console.log("✓ Sample post seeded");
    }

    // 5. Sample Visitor Stats for Charts
    const now = new Date();
    for (let i = 14; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000);
        d.setUTCHours(0, 0, 0, 0);
        await prisma.visitorStats.upsert({
            where: { date: d },
            update: {},
            create: {
                date: d,
                pageViews: 150 + Math.floor(Math.random() * 200),
                uniqueVisitors: 45 + Math.floor(Math.random() * 80),
                totalVisitors: 60 + Math.floor(Math.random() * 100),
            }
        });
    }
    console.log("✓ 14 days of visitor stats seeded");

    console.log("\nSeeding completed successfully! Login with:");
    console.log("Email: " + adminEmail);
    console.log("Password: " + adminPassword);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
