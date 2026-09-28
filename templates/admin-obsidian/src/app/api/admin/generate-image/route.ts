import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";

export const maxDuration = 60;

export async function POST(req: Request) {
    const session = await getAdminSession();

    if (!session) {
        return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Görsel için prompt belirtilmedi." }, { status: 400 });
        }

        const apiKey = process.env.HUGGINGFACE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "HUGGINGFACE_API_KEY .env dosyasında bulunamadı." }, { status: 500 });
        }

        const { InferenceClient } = await import("@huggingface/inference");
        const client = new InferenceClient(apiKey);

        // Hugging Face Inference Providers üzerinden FLUX.1-schnell modeli ile görsel oluştur
        const imageRes = await client.textToImage({
            model: "black-forest-labs/FLUX.1-schnell",
            inputs: prompt.trim(),
            parameters: {
                width: 1280,
                height: 720,
            },
        });

        let imageBuffer: Buffer;
        if (typeof imageRes === "string") {
            if (imageRes.startsWith("data:")) {
                const base64Data = imageRes.split(",")[1];
                imageBuffer = Buffer.from(base64Data, "base64");
            } else {
                const fetchRes = await fetch(imageRes);
                imageBuffer = Buffer.from(await fetchRes.arrayBuffer());
            }
        } else {
            imageBuffer = Buffer.from(await (imageRes as Blob).arrayBuffer());
        }

        if (imageBuffer.length < 1000) {
            throw new Error("Oluşturulan görsel verisi geçersiz.");
        }

        // Cloudinary'ye yükle
        const cloudinary = (await import("@/lib/cloudinary")).default;

        const uploadResponse: any = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: process.env.CLOUDINARY_FOLDER || "obsidian-media",
                    resource_type: "image",
                    format: "jpg"
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary upload error:", error);
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );
            uploadStream.end(imageBuffer);
        });

        return NextResponse.json({ url: uploadResponse.secure_url });

    } catch (error: any) {
        console.error("Generate Image Error:", error);
        return NextResponse.json({
            error: `Görsel oluşturma hatası: ${error.message || "Bilinmeyen hata"}`,
        }, { status: 500 });
    }
}
