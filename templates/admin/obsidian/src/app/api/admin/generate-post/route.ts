import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    const session = await getAdminSession();

    if (!session) {
        return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    try {
        const { prompt, categories, tags } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Konu belirtilmedi" }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "API Key (GEMINI_API_KEY) .env dosyasında bulunamadı." }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

        const systemPrompt = `Sen profesyonel bir blog yazarı ve teknoloji uzmanısın. Kullanıcının verdiği konuya göre modern, etkileyici ve SEO uyumlu bir blog yazısı oluşturmalısın.
        
İstenen Format:
Lütfen sadece geçerli bir JSON objesi döndür. JSON yapısı şu şekilde olmalıdır:
{
  "title": "Yazı Başlığı",
  "content": "Markdown formatında detaylı yazı içeriği (en az 500 kelime, başlıklar, listeler ve kod blokları içerebilir)",
  "excerpt": "Yazının kısa özeti (SEO için)",
  "slug": "yazi-basligi-slug-formati",
  "categoryId": "İçeriğe en uygun kategori ID'si (Verilen kategorilerden seç)",
  "tags": ["etiket1", "etiket2", "etiket3"],
  "imagePrompt": "Yazı içeriğiyle uyumlu, fotorealistik, yüksek kaliteli ve estetik bir kapak fotoğrafı için İngilizce detaylı görsel betimlemesi oluştur. Gereksiz dolgu kelimelerden kaçın ama kaliteyi artıracak detayları (lighting, style, etc.) ekle."
}

Kullanılabilir Kategoriler:
${categories.map((c: any) => `${c.id}: ${c.name}`).join("\n")}

Kullanılabilir Etiketler (Öncelikli kullan, gerekirse yenilerini ekle):
${tags.map((t: any) => t.name).join(", ")}

Konu: ${prompt}`;

        try {
            const result = await model.generateContent(systemPrompt);
            const response = await result.response;
            const text = response.text();

            // JSON ayıklama
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : text;

            try {
                const data = JSON.parse(jsonStr);
                return NextResponse.json(data);
            } catch (parseError) {
                console.error("JSON Parse Error:", text);
                return NextResponse.json({ error: "AI geçersiz bir yanıt döndürdü.", raw: text }, { status: 500 });
            }
        } catch (callError: any) {
            console.error("Gemini Details:", {
                message: callError.message,
                stack: callError.stack,
                status: callError.status,
                url: callError.response?.url
            });
            throw callError;
        }

    } catch (error: any) {
        console.error("AI Generation Error:", error);
        // Hata detayını kullanıcıya daha açıklayıcı verelim
        return NextResponse.json({
            error: "Model bağlantı hatası. Lütfen model isminin doğruluğunu veya bölge kısıtlamasını kontrol edin.",
            details: error.message
        }, { status: 500 });
    }
}
