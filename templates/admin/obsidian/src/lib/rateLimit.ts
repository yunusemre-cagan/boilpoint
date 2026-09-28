import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";
import prisma from "./prisma";

/**
 * Sliding-window rate limiter.
 * Prefers Vercel KV (Redis) for performance.
 * Falls back to Prisma (DB) if KV is not configured.
 */
export function createRateLimiter(
    prefix: string,
    limit: number = 5,
    window: `${number} ${"s" | "m" | "h" | "d"}` = "60 s"
) {
    // Check if KV is configured
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        return new Ratelimit({
            redis: kv,
            limiter: Ratelimit.slidingWindow(limit, window),
            prefix: `ratelimit:${prefix}`,
            analytics: true,
        });
    }

    // Prisma Fallback Limiter (Simplified sliding window)
    return {
        limit: async (identifier: string) => {
            const key = `ratelimit:${prefix}:${identifier}`;
            const now = new Date();

            // Convert window string to ms (simplified)
            const windowParts = window.split(" ");
            const value = parseInt(windowParts[0]);
            const unit = windowParts[1] as "s" | "m" | "h" | "d";
            const msMap = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
            const windowMs = value * msMap[unit];

            try {
                const record = await (prisma as any).rateLimit.findUnique({ where: { key } });

                if (!record || now > record.resetAt) {
                    await (prisma as any).rateLimit.upsert({
                        where: { key },
                        update: { count: 1, resetAt: new Date(now.getTime() + windowMs) },
                        create: { key, count: 1, resetAt: new Date(now.getTime() + windowMs) },
                    });
                    return { success: true, remaining: limit - 1, reset: now.getTime() + windowMs };
                }

                if (record.count >= limit) {
                    return { success: false, remaining: 0, reset: record.resetAt.getTime() };
                }

                await (prisma as any).rateLimit.update({
                    where: { key },
                    data: { count: { increment: 1 } },
                });

                return { success: true, remaining: limit - record.count - 1, reset: record.resetAt.getTime() };
            } catch (error) {
                console.error("Rate limit fallback error:", error);
                return { success: true, remaining: 1, reset: Date.now() }; // Fail open but log
            }
        }
    };
}

/** İstek başlıklarından istemci IP adresini çıkarır */
export function getClientIp(req: Request): string {
    return (
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "unknown"
    );
}

const memoryBuckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Hafif, bellek içi sabit pencereli sınırlayıcı.
 * Sunucusuz ortamda her örnek kendi sayacını tutar; yani kesin bir sınır değil,
 * veritabanına ek sorgu atmadan kötüye kullanımı frenleyen ucuz bir ilk savunma.
 * Yüksek hacimli uç noktalar (analitik) için uygundur; kritik sınırlar için
 * createRateLimiter kullanın.
 */
export function rateLimit(key: string, options: { limit: number; windowMs?: number }) {
    const windowMs = options.windowMs ?? 60_000;
    const now = Date.now();

    // Haritanın sınırsız büyümesini engelle
    if (memoryBuckets.size > 10_000) {
        for (const [k, bucket] of memoryBuckets) {
            if (bucket.resetAt <= now) memoryBuckets.delete(k);
        }
    }

    const bucket = memoryBuckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
        memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
        return { success: true, remaining: options.limit - 1, resetAt: now + windowMs };
    }

    if (bucket.count >= options.limit) {
        return { success: false, remaining: 0, resetAt: bucket.resetAt };
    }

    bucket.count++;
    return { success: true, remaining: options.limit - bucket.count, resetAt: bucket.resetAt };
}

/**
 * IP adresini anonimleştirir (KVKK): IPv4'te son okteti, IPv6'da son 80 biti sıfırlar.
 * Kaba konum/ağ bilgisi korunur, kişiyi tekil olarak tanımlamaz.
 */
export function anonymizeIp(ip: string | null | undefined): string | null {
    if (!ip || ip === "unknown") return null;
    if (ip.includes(".") && !ip.includes(":")) {
        const parts = ip.split(".");
        if (parts.length !== 4) return null;
        parts[3] = "0";
        return parts.join(".");
    }
    if (ip.includes(":")) {
        const groups = ip.split(":").filter(Boolean).slice(0, 3);
        return `${groups.join(":")}::`;
    }
    return null;
}
