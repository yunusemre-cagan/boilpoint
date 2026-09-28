"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/admin";

export async function deleteMedia(id: string) {
    await checkAdmin();
    if (!id) return;

    try {
        // If it looks like a Cloudinary ID (contains our prefix)
        if (id.startsWith('obsidian-media/')) {
            const cloudinary = (await import("@/lib/cloudinary")).default;
            await cloudinary.uploader.destroy(id);
        } else {
            // Local file
            const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
            const filePath = path.join(UPLOADS_DIR, path.basename(id));

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    } catch (error) {
        console.error("Delete media failed:", error);
    }

    revalidatePath("/admin/media");
}
