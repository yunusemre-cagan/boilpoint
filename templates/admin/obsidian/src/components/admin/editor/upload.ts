/** /api/upload uç noktasına görsel yükler; başarısız olursa açıklayıcı bir hata fırlatır. */
export async function uploadImage(file: File): Promise<string> {
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body });
    let data: { url?: string; error?: string } = {};
    try {
        data = await res.json();
    } catch {
        /* JSON olmayan yanıt */
    }
    if (!res.ok || !data.url) throw new Error(data.error || "Yükleme başarısız oldu.");
    return data.url;
}

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
