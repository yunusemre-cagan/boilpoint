import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { createRateLimiter, getClientIp } from "@/lib/rateLimit";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
    // Yalnızca admin yükleyebilir (OAuth ile yorum için giriş yapan ziyaretçiler değil)
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
    }

    // Rate limiting: dakikada max 10 upload
    const limiter = createRateLimiter("upload", 10, "60 s");
    const limit = await limiter.limit(getClientIp(req));
    if (!limit.success) {
        return NextResponse.json(
            { error: "Çok fazla istek. Lütfen bir dakika bekleyin." },
            { status: 429 }
        );
    }

    try {
        // Cloudinary config kontrolü
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            console.error("Cloudinary environment variables are missing!");
            return NextResponse.json({ error: "Sunucu yapılandırma hatası: Cloudinary ayarları eksik." }, { status: 500 });
        }

        const formData = await req.formData();
        const file = formData.get("file");

        if (!(file instanceof File)) {
            return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
        }

        // Tip kontrolü
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: `Desteklenmeyen dosya tipi (${file.type}). Yalnızca JPG, PNG, WebP ve GIF yüklenebilir.` },
                { status: 400 }
            );
        }

        // Boyut kontrolü
        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: `Dosya boyutu 5 MB'ı geçemez. Seçilen dosya: ${(file.size / (1024 * 1024)).toFixed(2)} MB` },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Cloudinary upload
        const cloudinary = (await import("@/lib/cloudinary")).default;

        const uploadResponse = await new Promise<{ secure_url: string }>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: process.env.CLOUDINARY_FOLDER || "obsidian-media",
                    resource_type: "image",
                },
                (error, result) => {
                    if (error || !result) {
                        console.error("Cloudinary stream upload error:", error);
                        reject(error ?? new Error("Cloudinary boş yanıt döndürdü."));
                    }
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        return NextResponse.json({ url: uploadResponse.secure_url });
    } catch (error) {
        console.error("Upload route error:", error);
        const errorMessage = error instanceof Error ? error.message : "Bilinmeyen sunucu hatası";
        return NextResponse.json({
            error: `Dosya yüklenemedi. Detay: ${errorMessage}`
        }, { status: 500 });
    }
}
