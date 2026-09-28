import Link from "next/link";
import { 
  ShieldCheck, 
  BarChart3, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  FileText, 
  Lock, 
  Palette, 
  Command 
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-slate-950 via-zinc-950 to-black text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl opacity-70" />
      </div>

      {/* Navigation */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 font-bold text-white shadow-lg shadow-indigo-500/25">
            O
          </span>
          <span className="text-xl font-bold tracking-tight text-white">
            Boilpoint <span className="text-indigo-400 font-normal">/ Obsidian</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/admin/login"
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Giriş Yap
          </Link>
          <Link
            href="/admin"
            className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-500/25 flex items-center gap-1.5"
          >
            Panele Git
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Boilpoint Admin Template Koleksiyonu
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.15]">
          Modern, Güçlü ve Koyu Temalı{" "}
          <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Admin Kokpiti
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Next.js 15, Tailwind CSS, Prisma ve NextAuth ile sıfırdan inşa edilmiş tak-çalıştır yönetim paneli şablonu.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/admin"
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 group"
          >
            Admin Panelini Aç
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/admin/login"
            className="px-6 py-3.5 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 font-semibold rounded-xl transition-all flex items-center gap-2"
          >
            <Lock className="w-4 h-4 text-zinc-400" />
            Giriş Ekranı
          </Link>
        </div>

        {/* Demo Credentials Box */}
        <div className="mt-10 max-w-md mx-auto p-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm text-xs text-zinc-400 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-zinc-300 font-mono">admin@example.com</span>
          </div>
          <span className="text-zinc-500 font-mono">Şifre: admin123</span>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-12 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BarChart3, title: "Canlı Analitik", desc: "KPI metrikleri, tıklama haritaları (Heatmap) ve kullanıcı akışları." },
          { icon: Sparkles, title: "AI Asistanı", desc: "Gemini ile SEO uyumlu blog yazısı ve FLUX ile kapak görseli üretimi." },
          { icon: Command, title: "Komut Paleti", desc: "CMD+K kısayolu ile anında sayfa ve eylem arama." },
          { icon: Palette, title: "Obsidian Tasarımı", desc: "Özel CSS tasarım jetonları, koyu/açık tema ve akıcı geçiş efektleri." }
        ].map((item, i) => (
          <div key={i} className="p-5 rounded-2xl border border-zinc-800/60 bg-zinc-900/30 backdrop-blur-sm hover:border-zinc-700 transition-colors">
            <item.icon className="w-6 h-6 text-indigo-400 mb-3" />
            <h3 className="font-semibold text-white text-base mb-1">{item.title}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
        <p>© {new Date().getFullYear()} Boilpoint · Obsidian Admin Starter</p>
        <p>Açık kaynak · Tak-çalıştır şablon kütüphanesi</p>
      </footer>
    </main>
  );
}
