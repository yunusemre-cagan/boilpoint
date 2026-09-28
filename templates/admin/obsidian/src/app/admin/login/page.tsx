"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    BarChart3,
    Check,
    Eye,
    EyeOff,
    Loader2,
    Lock,
    Mail,
    MessageSquareDot,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminThemeToggle } from "@/components/admin/shell/ThemeToggle";

const loginSchema = z.object({
    email: z.string().email("Geçerli bir e-posta adresi giriniz"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const YEAR = new Date().getFullYear();

/** Oturum açıldıktan sonra dönülecek admin adresi (yalnızca aynı site içindeki /admin yolları). */
function callbackTarget() {
    const raw = new URLSearchParams(window.location.search).get("callbackUrl");
    if (!raw) return "/admin";
    try {
        const url = new URL(raw, window.location.origin);
        if (url.origin === window.location.origin && url.pathname.startsWith("/admin") && !url.pathname.startsWith("/admin/login")) {
            return url.pathname + url.search;
        }
    } catch {
        /* geçersiz adres: varsayılana dön */
    }
    return "/admin";
}

export default function AdminLogin() {
    const router = useRouter();
    const [error, setError] = useState<{ message: string; id: number } | null>(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [capsLock, setCapsLock] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const shake = () => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        cardRef.current?.animate(
            [
                { transform: "translateX(0)" },
                { transform: "translateX(-9px)" },
                { transform: "translateX(8px)" },
                { transform: "translateX(-5px)" },
                { transform: "translateX(3px)" },
                { transform: "translateX(0)" },
            ],
            { duration: 460, easing: "ease-out" },
        );
    };

    // Her başarısız denemede kart titrer
    useEffect(() => {
        if (error) shake();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error?.id]);

    const onSubmit = async (data: LoginFormValues) => {
        setError(null);
        const result = await signIn("credentials", {
            email: data.email,
            password: data.password,
            redirect: false,
        });

        if (result?.error) {
            const message = /too many/i.test(result.error)
                ? "Çok fazla deneme yaptın. Lütfen bir dakika sonra tekrar dene."
                : "E-posta veya şifre hatalı.";
            setError((prev) => ({ message, id: (prev?.id ?? 0) + 1 }));
            return;
        }

        setSuccess(true);
        router.push(callbackTarget());
        router.refresh();
    };

    const passwordField = register("password");
    const busy = isSubmitting || success;

    return (
        <div className="relative grid min-h-screen lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]">
            {/* ── Marka paneli ───────────────────────────── */}
            <aside className="adm-login-brand m-3 hidden flex-col justify-between rounded-[1.75rem] p-10 lg:flex xl:p-12">
                <div className="adm-aurora adm-aurora-1" aria-hidden />
                <div className="adm-aurora adm-aurora-2" aria-hidden />
                <div className="adm-aurora adm-aurora-3" aria-hidden />
                <div className="adm-grid-lines" aria-hidden />

                <div className="adm-enter flex items-center gap-3">
                    <Image src="/logo.png" alt="Boilpoint Obsidian" width={120} height={45} priority className="h-auto w-[92px]" />
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-white/80">
                        Panel
                    </span>
                </div>

                {/* Süsleme: havada süzülen küçük panel parçaları */}
                <div className="relative mx-auto my-10 h-[300px] w-full max-w-[460px]" aria-hidden>
                    <div className="adm-glass-dark adm-float absolute left-0 top-6 w-[62%] rounded-2xl p-4" style={{ animationDelay: "-1s" }}>
                        <div className="mb-2 flex items-center justify-between">
                            <span className="flex items-center gap-2 text-xs font-medium text-white/75">
                                <BarChart3 className="h-3.5 w-3.5 text-sky-300" /> Ziyaretçi trendi
                            </span>
                            <span className="flex gap-1">
                                <span className="h-1.5 w-6 rounded-full bg-white/15" />
                                <span className="h-1.5 w-3 rounded-full bg-white/10" />
                            </span>
                        </div>
                        <svg viewBox="0 0 200 56" className="mt-2 h-14 w-full" fill="none">
                            <defs>
                                <linearGradient id="login-spark" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#818cf8" stopOpacity="0.35" />
                                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path d="M0 44 L22 38 L44 41 L66 30 L88 33 L110 22 L132 26 L154 14 L176 18 L200 6 L200 56 L0 56 Z" fill="url(#login-spark)" />
                            <path
                                d="M0 44 L22 38 L44 41 L66 30 L88 33 L110 22 L132 26 L154 14 L176 18 L200 6"
                                stroke="#a5b4fc"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="adm-draw"
                                style={{ "--len": 240 } as React.CSSProperties}
                            />
                        </svg>
                    </div>

                    <div className="adm-glass-dark adm-float absolute right-0 top-0 w-[48%] rounded-2xl p-4" style={{ animationDelay: "-3s" }}>
                        <div className="flex items-start gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-400/20 text-violet-200">
                                <MessageSquareDot className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold">Yeni yorum</p>
                                <span className="mt-2 block h-1.5 w-full rounded-full bg-white/15" />
                                <span className="mt-1.5 block h-1.5 w-2/3 rounded-full bg-white/10" />
                            </div>
                        </div>
                    </div>

                    <div className="adm-glass-dark adm-float absolute bottom-2 right-[8%] w-[54%] rounded-2xl p-4" style={{ animationDelay: "-5s" }}>
                        <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "var(--adm-grad)" }}>
                                <Sparkles className="h-4 w-4 text-white" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold">Yeni yazı</p>
                                <p className="mt-1 flex items-center gap-1.5 text-[0.65rem] text-emerald-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Yayında
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="adm-enter space-y-4" style={{ "--i": 2 } as React.CSSProperties}>
                    <h2 className="max-w-md text-[2rem] font-semibold leading-[1.15] tracking-tight">
                        Yazıların, istatistiklerin ve topluluğun{" "}
                        <span className="bg-gradient-to-r from-sky-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent">tek bir yerde.</span>
                    </h2>
                    <p className="max-w-sm text-sm leading-relaxed text-white/55">
                        İçerik üret, ziyaretçilerini takip et, analizleri incele ve moderasyonu yönet — hepsi tek bir yerde.
                    </p>
                    <div className="flex items-center gap-2 pt-4 text-xs text-white/40">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Güvenli oturum · © {YEAR} Boilpoint Obsidian</span>
                    </div>
                </div>
            </aside>

            {/* ── Form ───────────────────────────────────── */}
            <section className="relative flex min-h-screen flex-col px-5 py-5 sm:px-10">
                <div className="adm-login-mobile-glow lg:hidden" aria-hidden />

                <div className="flex items-center justify-between">
                    <Link href="/" className="adm-btn adm-btn-ghost adm-btn-sm group -ml-2">
                        <ArrowLeft className="transition-transform duration-300 group-hover:-translate-x-0.5" />
                        Siteye dön
                    </Link>
                    <AdminThemeToggle />
                </div>

                <div className="flex flex-1 items-center justify-center py-10">
                    <div ref={cardRef} className="w-full max-w-[380px]">
                        <div className="adm-enter mb-8 lg:hidden">
                            <Image src="/logo.png" alt="Boilpoint Obsidian" width={120} height={45} priority className="h-auto w-[84px]" />
                        </div>

                        <div className="adm-enter" style={{ "--i": 1 } as React.CSSProperties}>
                            <span className="adm-icon-tile mb-5 h-12 w-12 rounded-2xl">
                                <Lock className="h-5 w-5" />
                            </span>
                            <h1 className="text-[1.75rem] font-semibold tracking-tight adm-text">Tekrar hoş geldin</h1>
                            <p className="mt-1.5 text-sm adm-text-2">Yönetim paneline devam etmek için giriş yap.</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
                            {error && (
                                <div
                                    key={error.id}
                                    role="alert"
                                    className="adm-enter flex items-start gap-2.5 rounded-xl border border-rose-500/25 bg-rose-500/[0.08] px-3.5 py-3 text-sm text-rose-600 dark:text-rose-300"
                                >
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>{error.message}</span>
                                </div>
                            )}

                            <div className="adm-enter" style={{ "--i": 2 } as React.CSSProperties}>
                                <label htmlFor="email" className="adm-label">
                                    E-posta
                                </label>
                                <div className="adm-field-icon">
                                    <Mail />
                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="username email"
                                        autoFocus
                                        placeholder="admin@example.com"
                                        aria-invalid={errors.email ? true : undefined}
                                        readOnly={busy}
                                        className="adm-input h-12 rounded-xl"
                                        {...register("email")}
                                    />
                                </div>
                                {errors.email && <p className="adm-enter mt-1.5 text-xs text-rose-500">{errors.email.message}</p>}
                            </div>

                            <div className="adm-enter" style={{ "--i": 3 } as React.CSSProperties}>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="adm-label">
                                        Şifre
                                    </label>
                                    {capsLock && (
                                        <span className="adm-pop-in mb-1.5 inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[0.68rem] font-semibold text-amber-600 dark:text-amber-400">
                                            Caps Lock açık
                                        </span>
                                    )}
                                </div>
                                <div className="adm-field-icon">
                                    <Lock />
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        aria-invalid={errors.password ? true : undefined}
                                        readOnly={busy}
                                        className="adm-input h-12 rounded-xl pr-12"
                                        {...passwordField}
                                        onKeyUp={(e) => setCapsLock(e.getModifierState("CapsLock"))}
                                        onKeyDown={(e) => setCapsLock(e.getModifierState("CapsLock"))}
                                        onBlur={(e) => {
                                            setCapsLock(false);
                                            passwordField.onBlur(e);
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                                        aria-pressed={showPassword}
                                        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg adm-text-3 transition-colors hover:bg-[var(--adm-surface-2)] hover:text-[var(--adm-text)]"
                                    >
                                        <Eye
                                            className={cn(
                                                "absolute h-4 w-4 transition-all duration-300",
                                                showPassword ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100",
                                            )}
                                        />
                                        <EyeOff
                                            className={cn(
                                                "absolute h-4 w-4 transition-all duration-300",
                                                showPassword ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0",
                                            )}
                                        />
                                    </button>
                                </div>
                                {errors.password && <p className="adm-enter mt-1.5 text-xs text-rose-500">{errors.password.message}</p>}
                            </div>

                            <div className="adm-enter pt-1" style={{ "--i": 4 } as React.CSSProperties}>
                                <button
                                    type="submit"
                                    disabled={busy}
                                    className={cn(
                                        "adm-btn adm-btn-lg adm-nudge group w-full rounded-xl",
                                        success ? "adm-btn-success !opacity-100" : "adm-btn-primary disabled:!opacity-90",
                                    )}
                                >
                                    {success ? (
                                        <>
                                            <Check className="adm-pop-in" /> Yönlendiriliyor…
                                        </>
                                    ) : isSubmitting ? (
                                        <>
                                            <Loader2 className="animate-spin" /> Giriş yapılıyor…
                                        </>
                                    ) : (
                                        <>
                                            Giriş yap <ArrowRight className="adm-nudge-x" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        <p
                            className="adm-enter mt-8 flex items-center justify-center gap-1.5 text-xs adm-text-3"
                            style={{ "--i": 5 } as React.CSSProperties}
                        >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Yalnızca yetkili yöneticiler erişebilir.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
