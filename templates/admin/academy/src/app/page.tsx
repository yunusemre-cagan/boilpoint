import { AdminLayoutClient } from "@/components/layout/AdminLayoutClient";
import { TrafficChart } from "@/components/admin/TrafficChart";
import { ReferrerTable } from "@/components/admin/ReferrerTable";
import {
  FileText,
  Eye,
  Users,
  GraduationCap,
  MessageSquare,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Plus,
  Zap,
  BookHeart,
  ChevronRight,
  CheckCircle2,
  Clock
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  // Örnek Kokpit Metrikleri
  const stats = [
    {
      title: "Toplam Yazı & Not",
      value: "48",
      sub: "6 kategori altında aktif",
      icon: FileText,
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Aylık Görüntülenme",
      value: "38.450",
      sub: "+%18 geçen aya göre",
      icon: Eye,
      color: "from-indigo-500 to-violet-600",
    },
    {
      title: "Kayıtlı Öğrenci",
      value: "842",
      sub: "5, 6, 7 ve 8. Sınıf",
      icon: Users,
      color: "from-violet-500 to-purple-600",
    },
    {
      title: "Çözülen Deneme",
      value: "3.290",
      sub: "Ortalama Başarı: %78",
      icon: GraduationCap,
      color: "from-emerald-500 to-teal-600",
    },
  ];

  const trafficData = [
    { date: "01 Eyl", views: 820 },
    { date: "05 Eyl", views: 980 },
    { date: "10 Eyl", views: 1250 },
    { date: "15 Eyl", views: 1420 },
    { date: "20 Eyl", views: 1680 },
    { date: "25 Eyl", views: 1950 },
    { date: "30 Eyl", views: 2240 },
  ];

  const referrerData = [
    { referrer: "google.com", count: 18450 },
    { referrer: "direct", count: 12200 },
    { referrer: "instagram.com", count: 4800 },
    { referrer: "youtube.com", count: 2100 },
    { referrer: "twitter.com", count: 900 },
  ];

  const pendingComments = [
    {
      id: "c1",
      author: "Zeynep K.",
      post: "LGS Hazırlık Sürecinde Etkili Tekrar",
      content: "Hocam 3. maddedeki zaman yönetimi taktiği çok işime yaradı, teşekkürler!",
      time: "10 dk önce",
    },
    {
      id: "c2",
      author: "Ali D.",
      post: "Hücre Bölünmesi ve Kalıtım Özeti",
      content: "Mayoz 1 ve Mayoz 2 evrelerini gösteren ek şema ekleyebilir misiniz?",
      time: "45 dk önce",
    },
  ];

  return (
    <AdminLayoutClient
      user={{ name: "Eğitmen / Yönetici", email: "admin@academy.com", role: "ADMIN" }}
      pendingCounts={{ comments: 2, messages: 1, guestbook: 0 }}
    >
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Karşılama Bannerı */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-600/15">
          <div>
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles size={14} className="text-amber-300" />
              <span>Akademi Yönetim Kokpiti</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              Hoş Geldiniz, Eğitmenim 👋
            </h1>
            <p className="text-indigo-100 text-xs sm:text-sm mt-1">
              Bugün platformda 124 yeni öğrenci aktivitesi ve 2 onay bekleyen yorum var.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-indigo-700 hover:bg-indigo-50 shadow-md transition-all">
              + Yeni Quiz Ekle
            </button>
          </div>
        </div>

        {/* 4 Ana Metrik Kartı */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="p-5 rounded-2xl border border-indigo-100/80 dark:border-slate-800/90 bg-white dark:bg-[#0a0f1d] shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {s.title}
                  </div>
                  <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${s.color} text-white shadow-sm`}>
                    <Icon size={18} />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {s.value}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  {s.sub}
                </div>
              </div>
            );
          })}
        </div>

        {/* Trafik Grafiği & Kaynak Dağılımı */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-3xl border border-indigo-100/80 dark:border-slate-800/90 bg-white dark:bg-[#0a0f1d] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Ziyaretçi & Deneme Trafiği
                </h3>
                <p className="text-xs text-slate-400">Son 30 günlük sayfa ve deneme aktivitesi</p>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-full">
                Son 30 Gün
              </span>
            </div>
            <TrafficChart data={trafficData} />
          </div>

          <div className="p-6 rounded-3xl border border-indigo-100/80 dark:border-slate-800/90 bg-white dark:bg-[#0a0f1d] shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Trafik Kaynakları
            </h3>
            <p className="text-xs text-slate-400 mb-5">Öğrencilerin platforma ulaştığı kanallar</p>
            <ReferrerTable data={referrerData} />
          </div>
        </div>

        {/* Onay Bekleyen Yorumlar */}
        <div className="p-6 rounded-3xl border border-indigo-100/80 dark:border-slate-800/90 bg-white dark:bg-[#0a0f1d] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="text-amber-500 w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Onay Bekleyen Öğrenci Yorumları
              </h3>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 px-2.5 py-1 rounded-full">
              {pendingComments.length} Bekleyen
            </span>
          </div>

          <div className="space-y-3">
            {pendingComments.map((c) => (
              <div
                key={c.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{c.author}</span>
                    <span className="text-[10px] text-slate-400">• {c.post}</span>
                    <span className="text-[10px] text-slate-400">({c.time})</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic">
                    "{c.content}"
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                    Onayla
                  </button>
                  <button className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors">
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayoutClient>
  );
}
