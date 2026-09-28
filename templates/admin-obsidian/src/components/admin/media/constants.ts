export const MEDIA_SORTS = {
    new: "En yeni",
    old: "En eski",
    size: "En büyük",
    name: "Ada göre (A–Z)",
} as const;

export type MediaSort = keyof typeof MEDIA_SORTS;
export type MediaSource = "all" | "cloudinary" | "local";

export type MediaItem = {
    id: string;
    name: string;
    url: string;
    size: number;
    /** ISO tarih (istemciye düz metin olarak aktarılır) */
    date: string;
    type: "local" | "cloudinary";
    width?: number;
    height?: number;
    format?: string;
};

export function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} KB`;
    return `${(bytes / (1024 * 1024)).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} MB`;
}
