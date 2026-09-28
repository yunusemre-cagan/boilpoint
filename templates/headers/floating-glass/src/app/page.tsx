"use client";

import { Navbar } from "@/components/Navbar";
import { ArrowDown, Github, Sparkles, Sliders, Layers, Laptop } from "lucide-react";

export default function HeaderShowcasePage() {
  return (
    <div className="min-h-[200vh] flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* The Floating Glass Navbar Component */}
      <Navbar
        brand={{
          name: "CodeCraft",
          href: "#",
          logoNode: (
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 font-bold text-white shadow-md shadow-indigo-500/25">
              CC
            </span>
          ),
        }}
        navItems={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Hakkımda", href: "#hakkimda" },
          { label: "Blog", href: "#blog" },
          { label: "Projeler", href: "#projeler" },
          { label: "Araçlar", href: "#araclar" },
          { label: "İletişim", href: "#iletisim" },
        ]}
      />

      {/* Hero Showcase Area */}
      <section className="relative pt-44 pb-28 px-6 max-w-5xl mx-auto w-full text-center flex flex-col items-center justify-center">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/15 via-cyan-500/10 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Boilpoint Header Şablonu: `templates/headers/floating-glass`
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15] text-foreground max-w-3xl">
          Yüzen Cam Efektli{" "}
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            Floating Pill
          </span>{" "}
          Navbar
        </h1>

        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
          Sayfa kaydırıldıkça daralan, cam (glassmorphism) efektine bürünen, mobil menü ve karanlık mod destekli modern navigasyon çubuğu.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <a
            href="https://github.com/yunusemre-cagan/boilpoint/tree/main/templates/headers/floating-glass"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-3 shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Github className="w-4 h-4" />
            GitHub Kodunu İncele
          </a>
        </div>

        {/* Scroll Demo Hint */}
        <div className="mt-20 flex flex-col items-center gap-2 text-xs text-muted-foreground animate-bounce">
          <span>Cam daralma efektini görmek için aşağı kaydırın</span>
          <ArrowDown className="w-4 h-4 text-indigo-400" />
        </div>
      </section>

      {/* Demo Content Blocks to demonstrate scrolling */}
      <section className="max-w-4xl mx-auto px-6 py-20 w-full space-y-12">
        {[
          { title: "Kusursuz Scroll Daralması", desc: "Sayfayı 20px den fazla kaydırdığınızda navbar arka planı bulanıklaşır (backdrop-blur-xl), kenarlıklar belirir ve genişlik zarifçe daralır." },
          { title: "Parametrik & Tak-Çalıştır", desc: "Marka ismi, logo ikonu, navigasyon bağlantıları ve arama fonksiyonu props üzerinden kolayca yönetilebilir." },
          { title: "Mobil Duyarlı Drawer", desc: "Küçük ekranlarda animasyonlu hamburger butonu ve cam efektli açılır menü ile kusursuz mobil kullanıcı deneyimi." },
        ].map((box, i) => (
          <div key={i} className="p-8 rounded-3xl border border-border/60 bg-card/60 backdrop-blur-sm space-y-2">
            <h3 className="text-xl font-bold text-foreground">{box.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{box.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Boilpoint · Floating Glass Navbar Template
      </footer>
    </div>
  );
}
