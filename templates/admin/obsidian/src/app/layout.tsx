import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import NextAuthProvider from "@/components/NextAuthProvider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Obsidian Admin Dashboard",
  description: "Next.js 15+ Obsidian Admin Dashboard Template",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <NextAuthProvider>
            {children}
            <Toaster position="top-right" richColors />
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
