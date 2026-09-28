"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateSettings } from "@/app/admin/actions/settings";
import { useState } from "react";
import { Loader2, Save, Plus, X, ChevronUp, ChevronDown } from "lucide-react";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
        >
            {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Kaydet</>}
        </button>
    );
}

export function SettingsForm({ settings, socialLinks }: any) {
    const [state, formAction] = useActionState(updateSettings, { error: "", success: false, message: "" });

    return (
        <form action={formAction} className="space-y-8">
            {state.error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-sm">
                    {state.error}
                </div>
            )}
            {state.success && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-xl text-green-700 dark:text-green-400 text-sm">
                    {state.message}
                </div>
            )}

            <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">Genel Bilgiler (SEO)</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site Başlığı</label>
                        <input
                            type="text"
                            name="siteTitle"
                            defaultValue={settings.siteTitle}
                            required
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-blue-500 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta Açıklaması</label>
                        <textarea
                            name="siteDescription"
                            defaultValue={settings.siteDescription}
                            rows={3}
                            required
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-blue-500 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SEO Anahtar Kelimeleri</label>
                        <input
                            type="text"
                            name="seoKeywords"
                            defaultValue={settings.seoKeywords || ""}
                            placeholder="yazılım, geliştirici, react, next.js"
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-blue-500 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">Anahtar kelimeleri virgülle ayırarak yazın.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Favicon URL</label>
                        <input
                            type="text"
                            name="faviconUrl"
                            defaultValue={settings.faviconUrl || ""}
                            placeholder="/favicon.ico"
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-blue-500 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Global OpenGraph (OG) Görsel URL'si</label>
                        <input
                            type="text"
                            name="ogImageUrl"
                            defaultValue={settings.ogImageUrl || ""}
                            placeholder="https://example.com/og-image.jpg"
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-blue-500 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">Sayfalarınız sosyal medyada (X, LinkedIn vb.) paylaşıldığında varsayılan olarak bu görsel görünecektir.</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">Ana Sayfa Hero Alanı</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hero Başlık</label>
                        <input
                            type="text"
                            name="heroTitle"
                            defaultValue={settings.heroTitle}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-blue-500 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hero Alt Başlık</label>
                        <textarea
                            name="heroSubtitle"
                            defaultValue={settings.heroSubtitle}
                            rows={2}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-blue-500 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">Sosyal Medya Linkleri</h2>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-xl text-blue-700 dark:text-blue-300 text-sm">
                    <p className="font-medium mb-1">ℹ️ Sosyal medya hesapları &quot;Hakkımda&quot; sayfasından yönetilmektedir.</p>
                    <p className="text-blue-600 dark:text-blue-400">Footer, İletişim ve Hakkımda sayfalarındaki sosyal medya ikonları otomatik olarak oradan çekilir.</p>
                    <a href="/admin/about" className="inline-flex items-center gap-1 mt-2 text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                        Hakkımda Sayfasına Git →
                    </a>
                </div>
            </div>


            <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">İletişim Sayfası Ayarları</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">İletişim Başlığı</label>
                        <input
                            type="text"
                            name="contactTitle"
                            defaultValue={settings.contactTitle || "Bir Fikriniz mi Var?"}
                            placeholder="Örn: Bir Fikriniz mi Var? Birlikte İnşa Edelim."
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-blue-500 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">İletişim Alt Metni / Açıklama</label>
                        <textarea
                            name="contactText"
                            defaultValue={settings.contactText || ""}
                            rows={3}
                            placeholder="Örn: Projeler, danışmanlık veya sadece yazılım üzerine sohbet etmek için mesaj bırakın..."
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-transparent focus:border-blue-500 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">Not: Konum, e-posta ve sosyal medya bilgileri "Hakkımda" sayfasından otomatik alınacaktır.</p>
                    </div>
                </div>
            </div>


            <div className="flex items-center justify-end pt-6 border-t border-gray-100 dark:border-gray-800">
                <SubmitButton />
            </div>
        </form>
    );
}
