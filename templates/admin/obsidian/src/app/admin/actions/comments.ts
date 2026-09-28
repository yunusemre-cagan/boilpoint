"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/admin";

export async function approveComment(id: string) {
    try {
        await checkAdmin();
        await prisma.comment.update({
            where: { id },
            data: { status: "approved" },
        });

        const post = await prisma.comment.findUnique({
            where: { id },
            include: { post: true }
        });

        if (post?.post?.slug) {
            revalidatePath(`/blog/${post.post.slug}`);
        }
        revalidatePath("/admin/comments");
        return { success: true };
    } catch (error) {
        console.error("Failed to approve comment:", error);
        return { success: false, error: "Onaylama işlemi başarısız oldu." };
    }
}

export async function rejectComment(id: string) {
    try {
        await checkAdmin();
        await prisma.comment.update({
            where: { id },
            data: { status: "rejected" },
        });

        const post = await prisma.comment.findUnique({
            where: { id },
            include: { post: true }
        });

        if (post?.post?.slug) {
            revalidatePath(`/blog/${post.post.slug}`);
        }
        revalidatePath("/admin/comments");
        return { success: true };
    } catch (error) {
        console.error("Failed to reject comment:", error);
        return { success: false, error: "Reddetme işlemi başarısız oldu." };
    }
}

export async function deleteComment(id: string) {
    try {
        await checkAdmin();
        const post = await prisma.comment.findUnique({
            where: { id },
            include: { post: true }
        });

        await prisma.comment.delete({
            where: { id },
        });

        if (post?.post?.slug) {
            revalidatePath(`/blog/${post.post.slug}`);
        }
        revalidatePath("/admin/comments");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete comment:", error);
        return { success: false, error: "Silme işlemi başarısız oldu." };
    }
}
