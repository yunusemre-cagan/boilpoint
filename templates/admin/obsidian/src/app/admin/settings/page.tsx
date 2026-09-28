"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { AlertTriangle, Check, Eye, EyeOff, KeyRound, Loader2, Monitor, Moon, Palette, Settings, ShieldCheck, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { useAdminUI } from "@/components/admin/shell/AdminUIContext";
import { SIDEBAR_MODE_OPTIONS, SidebarModePreview } from "@/components/admin/shell/SidebarModeControl";

/** Şifre gücü: 0–4 */
function strength(password: string) {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
    return score;
}
const STRENGTH = [
    { label: "Çok zayıf", color: "bg-rose-500" },
    { label: "Zayıf", color: "bg-orange-500" },
    { label: "Orta", color: "bg-amber-500" },
    { label: "İyi", color: "bg-emerald-500" },
    { label: "Güçlü", color: "bg-emerald-600" },
];

function PasswordField({ id, label, value, onChange, autoComplete }: { id: string; label: string; value: string; onChange: (v: string) => void; autoComplete: string }) {
    const [show, setShow] = useState(false);
    return (
        <div>
            <label htmlFor={id} className="adm-label">
                {label}
            </label>
            <div className="adm-field-icon">
                <KeyRound />
                <input id={id} type={show ? "text" : "password"} required value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} placeholder="••••••••" className="adm-input pr-11" />
                <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? "Şifreyi gizle" : "Şifreyi göster"}
                    className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg adm-text-3 transition-colors hover:bg-[var(--adm-surface-2)] hover:text-[var(--adm-text)]"
                >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
        </div>
    );
}

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const { sidebarMode, setSidebarMode } = useAdminUI();
    const { theme, setTheme } = useTheme();
    // Tema tercihi yalnızca tarayıcıda bilinir; sunucu çizimiyle uyuşsun diye yüklendikten sonra işaretlenir
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const score = strength(passwords.newPassword);
    const mismatch = passwords.confirmPassword.length > 0 && passwords.newPassword !== passwords.confirmPassword;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("Yeni şifreler eşleşmiyor");
            return;
        }
        if (passwords.newPassword.length < 8) {
            toast.error("Yeni şifre en az 8 karakter olmalıdır");
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Şifre başarıyla değiştirildi. Yeniden giriş yapmalısın.");
                setTimeout(() => signOut({ callbackUrl: "/admin/login" }), 2000);
            } else {
                toast.error(data.error || "Şifre değiştirilemedi");
            }
        } catch {
            toast.error("Bir hata oluştu");
        } finally {
            setIsLoading(false);
        }
    };

    const setThemeSmooth = (value: string) => {
        document.documentElement.classList.add("theme-transitioning");
        setTheme(value);
        setTimeout(() => document.documentElement.classList.remove("theme-transitioning"), 400);
    };

    return (
        <div className="space-y-6">
            <PageHeader icon={Settings} title="Ayarlar" description="Panelin görünümünü kişiselleştir ve hesap güvenliğini yönet." />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {/* Görünüm */}
                <section className="adm-card adm-enter p-6" style={{ "--i": 1 } as React.CSSProperties}>
                    <header className="mb-6 flex items-center gap-3">
                        <span className="adm-icon-tile">
                            <Palette className="h-[1.1rem] w-[1.1rem]" />
                        </span>
                        <div>
                            <h2 className="font-semibold tracking-tight adm-text">Görünüm</h2>
                            <p className="text-xs adm-text-3">Tercihlerin bu tarayıcıda saklanır.</p>
                        </div>
                    </header>

                    <p className="adm-label">Kenar çubuğu</p>
                    <div role="radiogroup" aria-label="Kenar çubuğu modu" className="grid gap-3 sm:grid-cols-3">
                        {SIDEBAR_MODE_OPTIONS.map((option) => {
                            const active = sidebarMode === option.value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="radio"
                                    aria-checked={active}
                                    onClick={() => setSidebarMode(option.value)}
                                    className={cn(
                                        "group relative flex flex-col items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-300",
                                        active
                                            ? "border-[var(--adm-accent)] bg-[var(--adm-accent-softer)] shadow-[0_0_0_4px_var(--adm-accent-softer)]"
                                            : "border-[var(--adm-border-strong)] hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--adm-accent)_40%,var(--adm-border-strong))]",
                                    )}
                                >
                                    <span className="scale-125 origin-top-left transition-transform duration-300 group-hover:scale-[1.3]">
                                        <SidebarModePreview mode={option.value} active={active} />
                                    </span>
                                    <span className="mt-3">
                                        <span className="flex items-center gap-1.5 text-sm font-semibold adm-text">
                                            <option.icon className="h-3.5 w-3.5 adm-text-3" /> {option.label}
                                        </span>
                                        <span className="mt-0.5 block text-xs adm-text-3">{option.description}</span>
                                    </span>
                                    {active && (
                                        <span className="adm-pop-in absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full text-white" style={{ background: "var(--adm-grad)" }}>
                                            <Check className="h-3 w-3" />
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <p className="adm-label mt-6">Tema</p>
                    <div role="radiogroup" aria-label="Tema" className="grid grid-cols-3 gap-3">
                        {[
                            { value: "light", label: "Aydınlık", icon: Sun },
                            { value: "dark", label: "Karanlık", icon: Moon },
                            { value: "system", label: "Sistem", icon: Monitor },
                        ].map((option) => {
                            const active = mounted && theme === option.value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="radio"
                                    aria-checked={active}
                                    onClick={() => setThemeSmooth(option.value)}
                                    className={cn(
                                        "flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-all duration-300",
                                        active ? "border-[var(--adm-accent)] bg-[var(--adm-accent-softer)] adm-text" : "border-[var(--adm-border-strong)] adm-text-2 hover:bg-[var(--adm-surface-2)]",
                                    )}
                                >
                                    <option.icon className={cn("h-4 w-4 transition-transform duration-500", active && "rotate-[360deg] text-[var(--adm-accent)]")} />
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Güvenlik */}
                <section className="adm-card adm-enter p-6" style={{ "--i": 2 } as React.CSSProperties}>
                    <header className="mb-6 flex items-center gap-3">
                        <span className="adm-icon-tile">
                            <ShieldCheck className="h-[1.1rem] w-[1.1rem]" />
                        </span>
                        <div>
                            <h2 className="font-semibold tracking-tight adm-text">Güvenlik</h2>
                            <p className="text-xs adm-text-3">Yönetici şifreni güncelle.</p>
                        </div>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <PasswordField id="current" label="Mevcut şifre" autoComplete="current-password" value={passwords.currentPassword} onChange={(v) => setPasswords({ ...passwords, currentPassword: v })} />
                        <div className="grid gap-4 sm:grid-cols-2">
                            <PasswordField id="new" label="Yeni şifre" autoComplete="new-password" value={passwords.newPassword} onChange={(v) => setPasswords({ ...passwords, newPassword: v })} />
                            <PasswordField id="confirm" label="Yeni şifre (tekrar)" autoComplete="new-password" value={passwords.confirmPassword} onChange={(v) => setPasswords({ ...passwords, confirmPassword: v })} />
                        </div>
                        {passwords.newPassword && (
                            <div className="adm-enter">
                                <div className="flex gap-1.5">
                                    {[0, 1, 2, 3].map((i) => (
                                        <span key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors duration-500", i < score ? STRENGTH[score].color : "bg-[var(--adm-surface-3)]")} />
                                    ))}
                                </div>
                                <p className="mt-1.5 flex justify-between text-xs adm-text-3">
                                    <span>
                                        Şifre gücü: <span className="font-semibold adm-text-2">{STRENGTH[score].label}</span>
                                    </span>
                                    {mismatch && <span className="text-rose-500">Şifreler eşleşmiyor</span>}
                                </p>
                            </div>
                        )}
                        <button type="submit" disabled={isLoading} className="adm-btn adm-btn-primary adm-btn-lg w-full">
                            {isLoading ? <Loader2 className="animate-spin" /> : <KeyRound />}
                            {isLoading ? "Güncelleniyor…" : "Şifreyi güncelle"}
                        </button>
                    </form>

                    <div className="mt-5 flex gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] p-3.5">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                        <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-300/90">Güvenliğin için şifre değişikliğinden sonra oturumun kapatılır; yeni şifrenle tekrar giriş yapman gerekir.</p>
                    </div>
                </section>
            </div>
        </div>
    );
}
