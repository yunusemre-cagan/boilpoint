import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { redirect } from "next/navigation";

/**
 * Server-side admin check for Server Actions.
 * Throws an error or redirects if the user is not an authorized admin.
 */
export async function checkAdmin() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== "admin") {
        throw new Error("Unauthorized: Admin access required.");
    }

    return session;
}

/**
 * Server-side admin check for API Routes.
 * Returns null if unauthorized, otherwise returns the session.
 */
export async function getAdminSession() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== "admin") {
        return null;
    }

    return session;
}
