<div align="center">

# 💎 Obsidian Admin Dashboard

**Next.js 15+ App Router, Tailwind CSS, Prisma ve NextAuth ile Güçlendirilmiş Yönetim Kokpiti**

*Boilpoint Şablon Koleksiyonu nun koyu temalı, zengin özellikli ve yapay zeka destekli ilk amiral gemisi şablonu.*

<br />

[![Live Demo](https://img.shields.io/badge/⚡_Canlı_Demo-İncele-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://yunusemrecagan.com/demo/admin/obsidian)
[![Next.js](https://img.shields.io/badge/Next.js-15.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.4-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

<br />
<br />

<img src="./public/preview-dashboard.png" alt="Obsidian Dashboard" width="100%" style="border-radius: 14px; box-shadow: 0 15px 40px rgba(0,0,0,0.4);" />

</div>

---

## 🌟 Öne Çıkan Özellikler

### 💎 1. Obsidian Tasarım Sistemi (admin.css)
* **Özel CSS Jetonları (Design Tokens):** Koyu ve açık mod için özel kalibre edilmiş renk paletleri ve cam (glassmorphism) efektleri.
* **3 Farklı Kenar Çubuğu Modu:**
  * `expanded`: Tam genişlikli ve kalıcı kenar çubuğu.
  * `hover`: İkon şeridi görünümü; fare üzerine gelince akıcı biçimde açılır.
  * `collapsed`: Ultra kompakt ikon modu; ipucu balonlarıyla alan tasarrufu sağlar.
* **Hızlı Erişim:** `CMD+K` (veya `CTRL+K`) ile tetiklenen akıllı Komut Paleti.

### 📊 2. Kapsamlı Analitik & İstatistikler
* **Canlı KPI Kartları:** Tekil ziyaretçi, toplam sayfa görüntüleme ve oturum süreleri.
* **30 Günlük Trafik Trendleri:** Recharts ile oluşturulmuş yumuşak alan grafikleri.
* **Yayın Sıklığı Isı Haritası (Heatmap):** GitHub katkı grafiği tarzında içerik üretim aktivitesi.
* **Kullanıcı Akışı (Flow Map) & Tıklama Haritası:** Ziyaretçilerin sayfa geçiş ve etkileşim analizleri.

### ✨ 3. Yapay Zeka & Zengin Markdown Editörü
* **AI Destekli Yazı Üretimi (Gemini API):** Tek bir konudan SEO uyumlu başlık, özet, kategori, etiket ve detaylı Markdown içeriği üretme.
* **AI Kapak Görseli Üretimi (FLUX):** Yazının temasına göre fotorealistik 16:9 kapak görseli oluşturma.
* **Gelişmiş Markdown Editörü:** Canlı önizleme, sürükle-bırak görsel yükleme ve otomatik SEO slug biçimlendirme.

### 🛡️ 4. Moderasyon & İletişim
* **Yorum Yönetimi:** Onaylama, reddetme ve tek tıkla silme akışları.
* **Ziyaretçi Defteri:** Bekleyen girdileri moderasyondan geçirme.
* **Gelen Kutusu:** İletişim formu mesajlarını okuma ve e-posta istemcisini otomatik doldurarak yanıtlama.

---

## 🚀 Kurulum Adımları

### 1. Şablonu İndirin
```bash
npx degit yunusemre-cagan/boilpoint/templates/admin/obsidian my-admin-app
cd my-admin-app
```

### 2. Paketleri Yükleyin
```bash
npm install
```

### 3. Çevre Değişkenlerini Tanımlayın
```bash
cp .env.example .env
```
`.env` dosyasındaki veritabanı ve NextAuth anahtarlarını yapılandırın:

| Değişken Adı | Açıklama | Varsayılan / Örnek |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL veritabanı bağlantı URI si | `postgresql://user:pass@localhost:5432/db` |
| `NEXTAUTH_SECRET` | NextAuth oturum güvenliği için rastgele anahtar | `openssl rand -base64 32` |
| `ADMIN_EMAIL` | Seed scripti ile oluşturulacak yönetici e-postası | `admin@example.com` |
| `ADMIN_PASSWORD` | Seed scripti ile oluşturulacak yönetici şifresi | `admin123` |
| `GEMINI_API_KEY` | *(İsteğe Bağlı)* AI yazı üretimi için Google Gemini anahtarı | `AIzaSy...` |
| `HUGGINGFACE_API_KEY` | *(İsteğe Bağlı)* AI görsel üretimi için Hugging Face anahtarı | `hf_...` |
| `CLOUDINARY_*` | *(İsteğe Bağlı)* Bulut görsel depolama ayarları | Cloudinary API keys |

### 4. Veritabanını Başlatın & Örnek Verileri Yükleyin
```bash
npx prisma db push
npm run prisma:seed
```

### 5. Çalıştırın
```bash
npm run dev
```
Tarayıcınızda `http://localhost:3000/admin` adresini açarak oturum açabilirsiniz.

---

## 📄 Lisans
Bu şablon [MIT Lisansı](LICENSE) ile korunmaktadır. Özgürce kullanabilir, genişletebilir ve dağıtabilirsiniz.
