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
* **🚀 Tek Komutla Kurulum (degit):** Tüm repoyu klonlamanıza gerek kalmaz. Sadece ihtiyacınız olan şablonu, sıfır git geçmişiyle doğrudan yeni projenize çekersiniz.
* **🛡️ Sıfır Kişisel Veri & Temiz Kod:** Tüm şablonlar şifrelerden, kişisel içeriklerden ve hardcoded linklerden arındırılmış, çevre değişkenlerine (.env) bağlı jenerik mimarilerdir.
* **🎨 Kusursuz Tasarım Sistemi:** Özel CSS değişkenleri (design tokens), koyu/açık tema uyumu, mobil duyarlı kenar çubukları ve akıcı mikro-animasyonlar.
* **⚡ Modern Teknoloji Yığını:** Next.js 15 (App Router & Server Actions), React 19, Prisma ORM, NextAuth ve Tailwind CSS.

---

## 📦 Şablon Kataloğu (Template Catalog)

### 🛠️ Yönetim Panelleri (templates/admin/)

| Şablon Adı | Açıklama | Anahtar Özellikler | Hızlı Başlat (degit) |
| :--- | :--- | :--- | :--- |
| [**💎 obsidian**](./templates/admin/obsidian)<br />[🔗 Canlı İncele](https://yunusemrecagan.com/demo/admin/obsidian) | Koyu temalı, cam efektli, analitik ve AI destekli eksiksiz Admin Kokpiti | • KPI & 30 Günlük Trafik Analizi<br />• Isı Haritası (Heatmap) & Kullanıcı Akışı<br />• Gemini & FLUX ile AI İçerik/Görsel Stüdyosu<br />• Blog & Yorum Moderasyon Altyapısı<br />• CMD+K Komut Paleti & NextAuth | `npx degit yunusemre-cagan/boilpoint/templates/admin/obsidian my-admin` |
| **minimal** *(Yakında)* | Sade, yüksek kontrastlı ve ultra hafif yönetim arayüzü | • SQLite & Postgres Desteği<br />• Minimalist Veri Tabloları<br />• Rol Tabanlı Yetkilendirme | *Geliştirme Aşamasında* |

### 🧭 Navigasyon & Header (templates/headers/) *(Çok Yakında)*
* **floating-glass**: Yüzen cam efektli, scroll duyarlı modern navbar.
* **megamenu-saas**: Geniş açılır kategorili ve SaaS odaklı üst menü.

### 🚀 Karşılama & Landing Sayfaları (templates/landing/) *(Çok Yakında)*
* **saas-bento**: Modern Bento-grid düzeni, fiyatlandırma tabloları ve bekleme listesi entegrasyonu.

---

## ⚡ Hızlı Başlangıç Kılavuzu

İstediğiniz şablonu terminalinizden tek komutla yeni projenize aktarın:

```bash
# 1. Şablonu yeni klasörünüze indirin
npx degit yunusemre-cagan/boilpoint/templates/admin/obsidian yeni-projem

# 2. Proje dizinine geçin
cd yeni-projem

# 3. Bağımlılıkları yükleyin
npm install

# 4. Çevre değişkenlerini oluşturun
cp .env.example .env

# 5. Veritabanını eşitleyin ve örnek verileri yükleyin
npx prisma db push
npm run prisma:seed

# 6. Geliştirme sunucusunu başlatın
npm run dev
```

> 💡 **Varsayılan Giriş Bilgileri:**
> * **URL:** http://localhost:3000/admin
> * **E-posta:** admin@example.com
> * **Şifre:** admin123

---

## 📂 Depo Yapısı

```text
boilpoint/
├── README.md                           # Ana katalog ve genel kullanım rehberi
├── LICENSE                             # MIT Açık Kaynak Lisansı
├── assets/                             # Vitrin ve önizleme görselleri
└── templates/
    ├── admin/                          # 🛠️ Yönetim Paneli Şablonları
    │   ├── obsidian/                   # 💎 1. Şablon: Obsidian Admin Cockpit
    │   └── minimal/                    # (Yakında) Sade & hafif admin paneli
    ├── headers/                        # 🧭 Navbar & Header Tasarımları (Yakında)
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
