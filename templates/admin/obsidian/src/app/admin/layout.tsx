import { ReactNode } from "react";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AdminLayoutWrapper } from "@/components/admin/AdminLayoutWrapper";
import { SIDEBAR_COOKIE, parseSidebarMode, type AdminCounts } from "@/components/admin/shell/nav";
import "./admin.css";

/** Kenar çubuğu rozetleri için bekleyen iş sayıları (yalnızca yönetici oturumunda okunur). */
async function getPendingCounts(): Promise<AdminCounts> {
    try {
        const [comments, guestbook, messages] = await Promise.all([
            prisma.comment.count({ where: { status: "pending" } }),
            prisma.guestbookEntry.count({ where: { status: "pending" } }),
            prisma.contactMessage.count({ where: { isRead: false } }),
        ]);
        return { comments, guestbook, messages };
    } catch {
        return { comments: 0, guestbook: 0, messages: 0 };
    }
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const [cookieStore, session] = await Promise.all([cookies(), getServerSession(authOptions)]);
    const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";
    const counts = isAdmin ? await getPendingCounts() : { comments: 0, guestbook: 0, messages: 0 };

    return (
        <AdminLayoutWrapper
            initialSidebarMode={parseSidebarMode(cookieStore.get(SIDEBAR_COOKIE)?.value)}
            counts={counts}
            user={{ name: session?.user?.name ?? null, email: session?.user?.email ?? null }}
        >
            {children}
        </AdminLayoutWrapper>
    );
}
