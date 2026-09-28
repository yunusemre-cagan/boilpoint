import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        GithubProvider({
            clientId: (process.env.GITHUB_ID as string)?.trim(),
            clientSecret: (process.env.GITHUB_SECRET as string)?.trim(),
        }),
        GoogleProvider({
            clientId: (process.env.GOOGLE_CLIENT_ID as string)?.trim(),
            clientSecret: (process.env.GOOGLE_CLIENT_SECRET as string)?.trim(),
        }),
        CredentialsProvider({
            name: "Admin Login",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "admin@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing email or password");
                }

                // Brute-force protection: Rate limit login attempts by IP
                const { createRateLimiter } = await import("./rateLimit");
                const ip = req?.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown-login";
                const limiter = createRateLimiter("login-brute-force", 5, "60 s");
                const limit = await limiter.limit(ip);

                if (!limit.success) {
                    throw new Error("Too many login attempts. Please try again later.");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user || !user.password) {
                    throw new Error("Invalid credentials");
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    throw new Error("Invalid credentials");
                }

                if (user.role !== "admin") {
                    throw new Error("Access denied: You are not an admin.");
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                };
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 8 * 60 * 60, // 8 saat — gün sonunda oturum otomatik kapanır
    },
    cookies: {
        sessionToken: {
            name: process.env.NODE_ENV === "production"
                ? "__Secure-next-auth.session-token"
                : "next-auth.session-token",
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = user.id;
                token.picture = (user as any).image || null;
                token.iat = Math.floor(Date.now() / 1000);
            }

            // Token yarı ömrü (4 saat) geçtiyse yeniden doğrulama iste
            const TOKEN_HALF_LIFE = 4 * 60 * 60; // 4 saat (saniye)
            const tokenAge = Math.floor(Date.now() / 1000) - (token.iat as number || 0);
            if (tokenAge > TOKEN_HALF_LIFE) {
                // Token'ı yenile — yeni iat ata
                token.iat = Math.floor(Date.now() / 1000);
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
            }
            return session;
        }
    },
    // Not: pages.signIn burada tanımlı DEĞİL — middleware.ts kendi ayarıyla
    // admin rotalarını korur. Global tanım OAuth akışını bozuyordu.
    secret: process.env.NEXTAUTH_SECRET,
};
