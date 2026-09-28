"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/admin";

export async function deleteMessage(id: string) {
    await checkAdmin();
    if (id) {
        await prisma.contactMessage.delete({ where: { id } });
        revalidatePath("/admin/messages");
    }
}

export async function markAsRead(id: string) {
    await checkAdmin();
    if (id) {
        await prisma.contactMessage.update({ where: { id }, data: { isRead: true } });
        revalidatePath("/admin/messages");
        revalidatePath("/admin");
    }
}
