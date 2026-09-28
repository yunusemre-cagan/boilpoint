import {
    BarChart3,
    BookHeart,
    Briefcase,
    FileText,
    FolderTree,
    Image as ImageIcon,
    LayoutDashboard,
    Mail,
    MessageSquareDot,
    Settings,
    User as UserIcon,
    type LucideIcon,
} from "lucide-react";

export type CountKey = "comments" | "guestbook" | "messages";
export type AdminCounts = Record<CountKey, number>;

export type NavItem = {
    name: string;
    href: string;
    icon: LucideIcon;
    badge?: CountKey;
    /** Komut paletinde eşleşmeye yardımcı ek kelimeler */
    keywords?: string;
};

export type NavSection = { title: string; items: NavItem[] };

export const NAV_SECTIONS: NavSection[] = [
    {
        title: "Genel",
        items: [
            { name: "Dashboard", href: "/admin", icon: LayoutDashboard, keywords: "genel bakış ana sayfa panel" },
            { name: "İstatistikler", href: "/admin/analytics", icon: BarChart3, keywords: "analitik ziyaretçi trafik" },
        ],
    },
    {
        title: "İçerik",
        items: [
            { name: "Yazılar", href: "/admin/posts", icon: FileText, keywords: "blog makale" },
            { name: "Projeler", href: "/admin/projects", icon: Briefcase, keywords: "portfolyo" },
            { name: "Medya", href: "/admin/media", icon: ImageIcon, keywords: "görsel resim kütüphane" },
            { name: "Kategori & Etiket", href: "/admin/taxonomy", icon: FolderTree, keywords: "kategoriler etiketler taksonomi" },
            { name: "Hakkımda", href: "/admin/about", icon: UserIcon, keywords: "profil biyografi" },
        ],
    },
    {
        title: "Etkileşim",
        items: [
            { name: "Yorumlar", href: "/admin/comments", icon: MessageSquareDot, badge: "comments", keywords: "blog yorumları moderasyon" },
            { name: "Ziyaretçi Defteri", href: "/admin/guestbook", icon: BookHeart, badge: "guestbook", keywords: "defter onay" },
            { name: "Mesajlar", href: "/admin/messages", icon: Mail, badge: "messages", keywords: "gelen kutusu iletişim" },
        ],
    },
    {
        title: "Sistem",
        items: [{ name: "Ayarlar", href: "/admin/settings", icon: Settings, keywords: "şifre güvenlik görünüm tema" }],
    },
];

export const NAV_ITEMS = NAV_SECTIONS.flatMap((section) => section.items);

export function isNavActive(pathname: string, href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
}

const SEGMENT_TITLES: Record<string, string> = {
    posts: "Yazılar",
    new: "Yeni",
    edit: "Düzenle",
    projects: "Projeler",
    media: "Medya",
    taxonomy: "Kategori & Etiket",
    about: "Hakkımda",
    comments: "Yorumlar",
    guestbook: "Ziyaretçi Defteri",
    messages: "Mesajlar",
    analytics: "İstatistikler",
    flow: "Kullanıcı Akışı",
    heatmap: "Tıklama Haritası",
    events: "Eventler",
    settings: "Ayarlar",
};

/** /admin/posts/edit/abc → [{Yazılar, /admin/posts}, {Düzenle, …}] */
export function breadcrumbsFor(pathname: string) {
    const parts = pathname.split("/").filter(Boolean).slice(1);
    const crumbs: { label: string; href: string }[] = [];
    let href = "/admin";
    for (const part of parts) {
        href += `/${part}`;
        const label = SEGMENT_TITLES[part];
        if (label) crumbs.push({ label, href });
    }
    return crumbs;
}

export const SIDEBAR_MODES = ["expanded", "hover", "collapsed"] as const;
export type SidebarMode = (typeof SIDEBAR_MODES)[number];
export const SIDEBAR_COOKIE = "adm_sidebar";

export function parseSidebarMode(value: string | undefined): SidebarMode {
    return SIDEBAR_MODES.includes(value as SidebarMode) ? (value as SidebarMode) : "expanded";
}
