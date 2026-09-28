"use client";

import { useState } from "react";
import { AdminSidebar, AdminUserProps, AdminPendingCounts } from "./AdminSidebar";
import { X, Menu } from "lucide-react";

interface AdminLayoutClientProps {
  user: AdminUserProps;
  pendingCounts?: AdminPendingCounts;
  children: React.ReactNode;
}

export function AdminLayoutClient({
  user,
  pendingCounts,
  children,
}: AdminLayoutClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="fixed inset-0 h-[100dvh] flex overflow-hidden bg-slate-50/60 dark:bg-[#080c15] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Sabit Sol Masaüstü Sidebar */}
      <div className="hidden lg:flex shrink-0">
        <AdminSidebar user={user} pendingCounts={pendingCounts} />
      </div>

      {/* Mobil Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex h-full w-[85vw] max-w-xs flex-col overflow-y-auto bg-white dark:bg-[#0b101d] animate-in slide-in-from-left duration-200 shadow-2xl z-10 border-r border-indigo-100/70 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-5 right-4 rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Menüyü Kapat"
            >
              <X size={20} />
            </button>
            <AdminSidebar
              user={user}
              pendingCounts={pendingCounts}
              onCloseMobile={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Sağ Ana İçerik */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobil Üst Bar */}
        <header className="lg:hidden flex h-16 items-center justify-between border-b border-indigo-100/80 dark:border-slate-800/90 bg-white/90 dark:bg-[#0a0f1d]/90 backdrop-blur-md px-4 shrink-0 z-20">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Menüyü Aç"
          >
            <Menu size={22} />
          </button>
          <div className="font-extrabold text-sm text-slate-900 dark:text-white">
            Academy LMS
          </div>
          <div className="w-8" />
        </header>

        {/* Ana Sayfa Kaydırılabilir Alan */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
