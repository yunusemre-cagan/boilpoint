import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "Academy LMS — Modern Eğitim & Öğrenci Yönetim Kokpiti",
  description: "Next.js 15, Tailwind CSS, Recharts ve Prisma ile hazırlanmış eğitim ve quiz yönetim paneli.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
