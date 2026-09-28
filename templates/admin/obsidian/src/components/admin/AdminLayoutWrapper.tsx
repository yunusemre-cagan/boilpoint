"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { AdminUIProvider, useAdminUI, type AdminUser } from "@/components/admin/shell/AdminUIContext";
import { AdminSidebar } from "@/components/admin/shell/Sidebar";
import { AdminHeader } from "@/components/admin/shell/Header";
import { MobileNav } from "@/components/admin/shell/MobileNav";
import { AdminCommandPalette } from "@/components/admin/shell/CommandPalette";
import type { AdminCounts, SidebarMode } from "@/components/admin/shell/nav";

export function AdminLayoutWrapper({
    children,
    initialSidebarMode,
    counts,
    user,
}: {
    children: ReactNode;
    initialSidebarMode: SidebarMode;
    counts: AdminCounts;
    user: AdminUser;
}) {
    const pathname = usePathname();

    if (pathname === "/admin/login") {
        // Giriş sayfası admin kabuğu olmadan render edilir; <main> landmark'ı burada verilir.
        return <main className="adm">{children}</main>;
    }

    return (
        <AdminUIProvider initialSidebarMode={initialSidebarMode} counts={counts} user={user}>
            <ShellFrame>{children}</ShellFrame>
        </AdminUIProvider>
    );
}

function ShellFrame({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { sidebarMode } = useAdminUI();
    return (
        <div className="adm adm-shell relative" data-sidebar={sidebarMode}>
            <div className="adm-backdrop" aria-hidden />
            <AdminSidebar />
            <MobileNav />
            <AdminCommandPalette />
            <div className="adm-main relative z-[1] flex min-h-screen flex-col">
                <AdminHeader />
                <main id="main-content" className="flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-8">
                    {/* Her sayfa geçişinde içerik yumuşakça belirir (arama/sayfalama değişimlerinde değil) */}
                    <div key={pathname} className="adm-page-enter mx-auto w-full max-w-[88rem]">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
