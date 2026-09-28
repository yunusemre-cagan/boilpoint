export const STATUS_BADGE: Record<string, { tone: "warning" | "success" | "danger"; label: string }> = {
    pending: { tone: "warning", label: "Onay bekliyor" },
    approved: { tone: "success", label: "Yayında" },
    rejected: { tone: "danger", label: "Reddedildi" },
};

export const MODERATION_STATUSES = ["all", "pending", "approved", "rejected"] as const;
export type ModerationStatus = (typeof MODERATION_STATUSES)[number];
