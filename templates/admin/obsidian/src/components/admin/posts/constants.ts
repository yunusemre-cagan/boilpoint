export const POST_SORTS = {
    new: "En yeni",
    updated: "Son düzenlenen",
    old: "En eski",
    views: "En çok okunan",
    title: "Başlık (A–Z)",
} as const;

export type PostSort = keyof typeof POST_SORTS;
export type PostStatus = "all" | "published" | "draft";
