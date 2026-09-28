"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/admin";

export async function approveEntry(id: string) {
    await checkAdmin();
    if (id) {
        await prisma.guestbookEntry.update({ where: { id }, data: { status: "approved" } });
        revalidatePath("/admin/guestbook");
        revalidatePath("/ziyaretci-defteri");
    }
}

export async function rejectEntry(id: string) {
    await checkAdmin();
    if (id) {
        await prisma.guestbookEntry.update({ where: { id }, data: { status: "rejected" } });
        revalidatePath("/admin/guestbook");
    }
}

export async function deleteEntry(id: string) {
    await checkAdmin();
    if (id) {
        await prisma.guestbookEntry.delete({ where: { id } });
        revalidatePath("/admin/guestbook");
        revalidatePath("/ziyaretci-defteri");
    }
}
