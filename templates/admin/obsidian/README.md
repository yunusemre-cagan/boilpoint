# 💎 Obsidian Admin Dashboard (Boilpoint Starter)

Next.js 15+ (App Router), Tailwind CSS, Prisma ve NextAuth ile sıfırdan inşa edilmiş, tak-çalıştır ve yüksek kaliteli bir yönetim paneli şablonu.

Bu şablon, **Boilpoint** boilerplate koleksiyonunun koyu temalı, zengin özellikli ve AI destekli ilk yönetim paneli şablonudur.

<p align="center">
  <a href="https://yunusemrecagan.com/demo/admin/obsidian" target="_blank">
    <img src="https://img.shields.io/badge/⚡_CANLI_DEMO_İNCELE-Obsidian_Admin-6366f1?style=for-the-badge&logo=vercel&logoColor=white" alt="Canlı Demo İncele" />
  </a>
</p>

---

## 📸 Önizleme (Preview)

<div align="center">
  <img src="./public/preview-dashboard.png" alt="Obsidian Admin Dashboard" width="100%" style="border-radius: 12px; margin-bottom: 16px;" />
  <p><em>Dashboard & Analitik Görünümü</em></p>
  <br/>
  <img src="./public/preview-editor.png" alt="Obsidian Post & AI Editor" width="100%" style="border-radius: 12px;" />
  <p><em>Zengin Markdown Editörü & Canlı Ayarlar</em></p>
</div>

---

## 🚀 Hızlı Başlangıç

### 1. Şablonu Yeni Bir Klasöre İndirin (degit ile)

```bash
npx degit yunusemre-cagan/boilpoint/templates/admin/obsidian yeni-yonetim-paneli
cd yeni-yonetim-paneli
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Çevre Değişkenlerini Ayarlayın

```bash
cp .env.example .env
```
`.env` dosyasındaki `DATABASE_URL` ve `NEXTAUTH_SECRET` değerlerini güncelleyin.

### 4. Veritabanını Hazırlayın ve Seed Verisini Yükleyin

```bash
npx prisma db push
npm run prisma:seed
```

### 5. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

* **Ana Sayfa:** `http://localhost:3000`
* **Admin Paneli:** `http://localhost:3000/admin`
* **Giriş:** `http://localhost:3000/admin/login`
  * **E-posta:** `admin@example.com`
  * **Şifre:** `admin123`

---

## 🌟 Öne Çıkan Özellikler

* **💎 Obsidian Tasarım Sistemi (`admin.css`):**
  * Koyu / Açık tema desteği (`next-themes`)
  * Katlanabilir, hover ve tam genişlikli kenar çubuğu modları
  * İnce düşünülmüş animasyonlar ve cam (glassmorphism) efektleri
* **📊 Kapsamlı Analitik Kokpiti:**
  * KPI kartları (Tekil ziyaretçi, oturum süreleri, hemen çıkma oranı)
  * Tıklama Haritası (Heatmap)
  * Kullanıcı Akışı (Flow Map)
  * Önemli Event Logları
* **✨ AI & Zengin İçerik Editörü:**
  * Markdown editörü, canlı önizleme ve görsel sürükle-bırak
  * **Gemini** ile tek komuttan SEO uyumlu yazı üretme
  * **FLUX** ile konuya uygun kapak görseli üretme
* **🛡️ Moderasyon & Gelen Kutusu:**
  * Blog yorumları onayla / reddet
  * Ziyaretçi defteri onay akışı
  * İletişim formu mesajları ve doğrudan e-posta istemcisi entegrasyonu
* **🗂️ Taksonomi ve Medya:**
  * Kategori ve Etiket yönetimi
  * Medya Kütüphanesi (Cloudinary ve yerel dosya desteği)
* **⌨️ Komut Paleti (Command Palette):**
  * `CMD+K` (veya `CTRL+K`) ile hızlı sayfa ve aksiyon arama

---

## 🛠️ Lisans
MIT - İstediğiniz kişisel veya ticari projede özgürce kullanabilirsiniz.
