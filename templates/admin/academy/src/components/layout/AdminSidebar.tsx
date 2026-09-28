"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  FileText,
  Zap,
  Users,
  GraduationCap,
  Tags,
  Image as ImageIcon,
  MessageSquare,
  BookHeart,
  Mail,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  ShieldCheck,
  LogOut,
  FolderOpen
} from "lucide-react";

export interface AdminUserProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
}

export interface AdminPendingCounts {
  comments?: number;
  messages?: number;
  guestbook?: number;
}

interface AdminSidebarProps {
  user?: AdminUserProps;
  pendingCounts?: AdminPendingCounts;
  onCloseMobile?: () => void;
  brandName?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  exact?: boolean;
  badge?: string | number | null;
  badgeColor?: "amber" | "rose" | "indigo";
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function AdminSidebar({
  user,
  pendingCounts,
  onCloseMobile,
  brandName = "Academy LMS",
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navGroups: NavGroup[] = [
    {
      title: "GENEL",
      items: [
        {
          href: "/admin",
          label: "Dashboard",
          icon: LayoutDashboard,
          exact: true,
        },
      ],
    },
    {
      title: "ÖĞRENCİ & EĞİTİM",
      items: [
        {
          href: "/admin/ogrenciler",
          label: "Öğrenciler",
          icon: Users,
        },
        {
          href: "/admin/quizler",
          label: "Quizler & Denemeler",
          icon: GraduationCap,
        },
        {
          href: "/admin/sorular",
          label: "Soru Bankası",
          icon: Zap,
        },
      ],
    },
    {
      title: "İÇERİK YÖNETİMİ",
      items: [
        {
          href: "/admin/yazilar",
          label: "Yazılar & Notlar",
          icon: FileText,
        },
        {
          href: "/admin/kategoriler",
          label: "Kategoriler",
          icon: Tags,
        },
        {
          href: "/admin/medya",
          label: "Medya Kütüphanesi",
          icon: ImageIcon,
        },
      ],
    },
    {
      title: "ETKİLEŞİM & MODERASYON",
      items: [
        {
          href: "/admin/yorumlar",
          label: "Yorumlar",
          icon: MessageSquare,
          badge: pendingCounts?.comments ? pendingCounts.comments : null,
          badgeColor: "amber",
        },
        {
          href: "/admin/ziyaretci-defteri",
          label: "Ziyaretçi Defteri",
          icon: BookHeart,
          badge: pendingCounts?.guestbook ? pendingCounts.guestbook : null,
          badgeColor: "amber",
        },
        {
          href: "/admin/mesajlar",
          label: "İletişim Mesajları",
          icon: Mail,
          badge: pendingCounts?.messages ? pendingCounts.messages : null,
          badgeColor: "rose",
        },
      ],
    },
  ];

  return (
    <aside className="flex h-full w-full lg:w-72 flex-col border-r border-indigo-100/80 dark:border-slate-800/90 bg-white dark:bg-[#0a0f1d] transition-colors">
      {/* Üst Logo & Başlık */}
      <div className="flex h-20 items-center justify-between border-b border-indigo-100/80 dark:border-slate-800/90 px-6 shrink-0">
        <Link
          href="/admin"
          onClick={onCloseMobile}
          className="flex items-center gap-3 group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-black shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform shrink-0">
            A
          </div>
          <div>
            <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{brandName}</span>
              <Sparkles size={13} className="text-amber-400 animate-pulse" />
            </div>
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <span>Eğitim Kokpiti</span>
              <span className="text-[10px] text-amber-500">🎓</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Profil Mini Kartı */}
      <div className="p-3 m-3 rounded-2xl border border-indigo-100 dark:border-slate-800 bg-indigo-50/40 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-full border-2 border-indigo-400 dark:border-indigo-500 shrink-0 bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-sm font-black text-indigo-700 dark:text-indigo-300">
            {user?.name ? user.name[0].toUpperCase() : "E"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {user?.name || "Eğitmen / Yönetici"}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {user?.email || "admin@academy.com"}
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            Yönetici
          </span>
        </div>
      </div>

      {/* Menü Linkleri */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {group.title}
            </div>
            {group.items.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname?.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={17} className={isActive ? "text-white" : "text-slate-400 dark:text-slate-400"} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        item.badgeColor === "amber"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : item.badgeColor === "rose"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Alt Footer & Tema Değiştirici */}
      <div className="border-t border-indigo-100/80 dark:border-slate-800/90 p-4 shrink-0 space-y-3">
        {mounted && (
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
            <button
              onClick={() => setTheme("light")}
              className={`flex-1 py-1.5 flex justify-center items-center rounded-lg text-xs transition-colors ${
                theme === "light"
                  ? "bg-white text-indigo-600 shadow-sm font-bold"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              aria-label="Açık Tema"
            >
              <Sun size={14} />
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex-1 py-1.5 flex justify-center items-center rounded-lg text-xs transition-colors ${
                theme === "dark"
                  ? "bg-slate-800 text-indigo-400 shadow-sm font-bold"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              aria-label="Koyu Tema"
            >
              <Moon size={14} />
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`flex-1 py-1.5 flex justify-center items-center rounded-lg text-xs transition-colors ${
                theme === "system"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              aria-label="Sistem Teması"
            >
              <Monitor size={14} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
