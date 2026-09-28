<div align="center">

# 🔥 BOILPOINT

**Üretim Kalitesinde Modern Web Şablonları & Boilerplate Koleksiyonu**

Next.js 15+ (App Router), Tailwind CSS, Prisma ve TypeScript ile hazırlanmış; sıfır konfigürasyonla tek komutta projenize aktarabileceğiniz modüler şablon kataloğu.

<br />

[![Live Demo](https://img.shields.io/badge/⚡_Canlı_Demo-Obsidian_Admin-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://yunusemrecagan.com/demo/admin/obsidian)
[![Next.js](https://img.shields.io/badge/Next.js-15.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v3.4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

<br />
<br />

<a href="https://yunusemrecagan.com/demo/admin/obsidian" target="_blank">
  <img src="./assets/obsidian-dashboard.png" alt="Obsidian Admin Dashboard Önizleme" width="100%" style="border-radius: 14px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);" />
</a>

<p align="center"><em>💎 Obsidian Admin — Koyu Tema, Cam (Glassmorphism) Efektleri & Canlı Analitik Kokpiti</em></p>

</div>

---

## 💡 Neden Boilpoint?

Her yeni web projesinde kimlik doğrulama, admin paneli, karanlık tema, veritabanı şemaları veya navigasyon çubuklarını sıfırdan kodlamak haftalarca zaman kaybettirir. 

**Boilpoint** bu süreci saniyeler seviyesine indirir:
* **🚀 Tek Komutla Kurulum (`degit`):** Tüm depoyu klonlamanıza gerek kalmaz. Sadece ihtiyacınız olan şablonu, sıfır git geçmişiyle doğrudan yeni projenize çekersiniz.
* **🛡️ Sıfır Kişisel Veri & Temiz Kod:** Tüm şablonlar şifrelerden, kişisel içeriklerden ve hardcoded linklerden arındırılmış, jenerik ve modüler mimarilerdir.
* **🎨 Kusursuz Tasarım Sistemi:** Özel CSS değişkenleri (design tokens), koyu/açık tema uyumu, mobil duyarlı bileşenler ve akıcı mikro-animasyonlar.
* **⚡ Modern Teknoloji Yığını:** Next.js 15 (App Router & Server Actions), React 19, Prisma ORM, NextAuth ve Tailwind CSS.

---

## 📦 Şablon Kataloğu (Template Catalog)

| Şablon | Kategori | Açıklama | Önizleme & Kurulum |
| :--- | :--- | :--- | :---: |
| [**💎 obsidian**](./templates/admin/obsidian) | 🛠️ Admin Paneli | Koyu tema, analitik kokpiti, FLUX & Gemini AI stüdyosu | [⚡ Canlı Demo](https://yunusemrecagan.com/demo/admin/obsidian) · [Detaylar →](./templates/admin/obsidian) |
| [**🧭 floating-glass**](./templates/headers/floating-glass) | 🧭 Header / Navbar | Scroll duyarlı daralan, cam efektli yüzen pill navbar | [Önizleme](./templates/headers/floating-glass) · [Detaylar →](./templates/headers/floating-glass) |
| **minimal** | 🛠️ Admin Paneli | Sade, yüksek kontrastlı ve ultra hafif yönetim arayüzü | *Geliştirme Aşamasında* |
| **megamenu-saas** | 🧭 Header / Navbar | Çok sütunlu, kategorili SaaS üst navigasyon menüsü | *Geliştirme Aşamasında* |
| **saas-bento** | 🚀 Landing Page | Bento-grid düzeni, fiyatlandırma tabloları ve bekleme listesi | *Geliştirme Aşamasında* |

---

## 🛠️ Şablon Detayları & Hızlı Kurulum

### 1. 💎 Obsidian Admin Cockpit (`templates/admin/obsidian`)
> Koyu temalı, cam (glassmorphism) efektli, analitik ve AI stüdyo destekli eksiksiz Next.js 15 yönetim kokpiti.

* **Öne Çıkan Özellikler:** KPI & 30 Günlük Trafik Analizi, Isı Haritası (Heatmap) & Kullanıcı Akışı, Gemini & FLUX ile AI İçerik/Görsel Stüdyosu, Blog & Yorum Moderasyon Altyapısı, CMD+K Komut Paleti & NextAuth.
* **Teknoloji:** Next.js 15 (App Router), React 19, Tailwind CSS, Prisma ORM, NextAuth, Lucide Icons.
* **Canlı Demo:** [yunusemrecagan.com/demo/admin/obsidian](https://yunusemrecagan.com/demo/admin/obsidian)
* **Tek Komutla Kurulum:**
```bash
npx degit yunusemre-cagan/boilpoint/templates/admin/obsidian my-admin
```

---

### 2. 🧭 Floating Glass Navbar (`templates/headers/floating-glass`)
> Sayfa kaydırıldıkça daralan (scroll-shrink), cam (glassmorphism) efektli, koyu/açık tema ve mobil drawer menü destekli modern yüzen navigasyon çubuğu.

* **Öne Çıkan Özellikler:** Scroll-shrink animasyonu (`max-w-6xl` ➔ `max-w-5xl`), `next-themes` koyu/açık tema seçici, Mobil açılır drawer menü, `⌘K` Arama tetikleyici, Tak-çalıştır modüler mimari.
* **Tasarım Kaynağı:** [yunusemrecagan.com](https://yunusemrecagan.com) ana site navigasyon tasarımı.
* **Teknoloji:** Next.js 15, Tailwind CSS, Lucide Icons, `next-themes`.
* **Tek Komutla Kurulum:**
```bash
npx degit yunusemre-cagan/boilpoint/templates/headers/floating-glass my-header
```

---

## ⚡ Hızlı Başlangıç Rehberi

Herhangi bir şablonu indirdikten sonra çalıştırmak için standart adımlar:

```bash
# 1. Proje dizinine geçin
cd <proje-klasorunuz>

# 2. Bağımlılıkları yükleyin
npm install

# 3. Varsa çevre değişkenlerini kopyalayın
cp .env.example .env

# 4. Geliştirme sunucusunu başlatın
npm run dev
```

---

## 📂 Depo Yapısı

```text
boilpoint/
├── README.md                           # Ana katalog ve genel kullanım rehberi
├── LICENSE                             # MIT Açık Kaynak Lisansı
├── assets/                             # Vitrin ve önizleme görselleri
│   ├── obsidian-dashboard.png
│   └── floating-glass-navbar.png
└── templates/
    ├── admin/                          # 🛠️ Yönetim Paneli Şablonları
    │   ├── obsidian/                   # 💎 Obsidian Admin Cockpit
    │   └── minimal/                    # (Yakında) Sade & hafif admin paneli
    ├── headers/                        # 🧭 Navbar & Header Tasarımları
    │   ├── floating-glass/             # 🧭 Floating Glass Navbar
    │   └── megamenu-saas/              # (Yakında) SaaS mega menü
    ├── footers/                        # 🔻 Modern Footer Şablonları (Yakında)
    └── landing/                        # 🚀 SaaS & Ürün Tanıtım Sayfaları (Yakında)
```

---

## 🛠️ Katkıda Bulunma & Lisans

Bu projedeki tüm şablonlar [MIT Lisansı](LICENSE) kapsamında tamamen açık kaynaklıdır. Kişisel ya da ticari dilediğiniz her projede serbestçe kullanabilir, çatallayabilir ve özelleştirebilirsiniz.

Fikirleriniz veya yeni şablon önerileriniz varsa lütfen bir **Issue** veya **Pull Request** açmaktan çekinmeyin!

<div align="center">

Geliştirici: [Yunus Emre Çağan](https://yunusemrecagan.com) · **Boilpoint Hub**

</div>
