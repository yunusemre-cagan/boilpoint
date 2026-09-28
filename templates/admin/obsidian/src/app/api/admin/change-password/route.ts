import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ error: "Yeni şifre en az 8 karakter olmalıdır" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user?.email as string }
        });

        if (!user || !user.password) {
            return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ error: "Mevcut şifre hatalı" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        return NextResponse.json({ success: true, message: "Şifre başarıyla güncellendi" });

    } catch (error) {
        console.error("Şifre değiştirme hatası:", error);
        return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
    }
}
