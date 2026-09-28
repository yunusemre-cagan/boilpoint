# 🔥 Boilpoint

> Modern, ölçeklenebilir ve yüksek standartlı web projeleri için **Boilerplate & Starter Şablon Koleksiyonu**.

Boilpoint, her yeni projeye sıfırdan başlamak yerine; kanıtlanmış mimariler, zengin UI kütüphaneleri, kimlik doğrulama, veritabanı ve tema sistemleriyle donatılmış tak-çalıştır şablonları bir arada sunar.

---

## 📦 Şablon Kataloğu (Templates)

| Şablon | Açıklama | Teknoloji | Hızlı İndir |
| :--- | :--- | :--- | :--- |
| [**`admin-obsidian`**](./templates/admin-obsidian) | Koyu temalı, cam efektli, AI destekli, analitik ve tam moderasyonlu Admin Paneli Kokpiti | Next.js 15, Tailwind, Prisma, NextAuth | `npx degit yunusemre-cagan/boilpoint/templates/admin-obsidian my-admin` |
| `admin-minimal` *(Yakında)* | Sade, yüksek kontrastlı ve hafif kurumsal yönetim paneli | Next.js 15, Tailwind, SQLite/PostgreSQL | `Hazırlanıyor` |
| `saas-landing` *(Yakında)* | Fiyatlandırma, bekleme listesi ve Bento-grid odaklı SaaS karşılama sayfası | Next.js 15, Tailwind | `Hazırlanıyor` |

---

## ⚡ Nasıl Kullanılır?

İstediğiniz şablonu tüm repoyu klonlamadan, sadece o şablonun temiz dosyalarını sıfır git geçmişiyle yeni bir projeye indirmek için **`npx degit`** kullanabilirsiniz:

```bash
# 1. İstediğiniz şablonu yeni bir klasöre indirin:
npx degit yunusemre-cagan/boilpoint/templates/admin-obsidian yeni-projem

# 2. Proje klasörüne gidin:
cd yeni-projem

# 3. Bağımlılıkları yükleyin:
npm install

# 4. Çevre değişkenlerini kopyalayın:
cp .env.example .env

# 5. Geliştirme sunucusunu başlatın:
npm run dev
```

---

## 📂 Depo Yapısı

```text
boilpoint/
├── README.md                      # Bu dosya (Şablon dizini ve kılavuz)
└── templates/                     # Tüm bağımsız şablon projeleri
    ├── admin-obsidian/            # 1. Admin Paneli: Koyu tema & AI kokpiti
    └── ...
```

Her şablon `templates/<sablon-adi>` altında kendi bağımsız `package.json`, `prisma`, `tsconfig.json` ve `README.md` dosyalarına sahip eksiksiz bir projedir.

---

## 📄 Lisans
Bu depodaki tüm şablonlar [MIT Lisansı](LICENSE) altında tamamen açık kaynaklıdır. İstediğiniz kişisel ya da ticari projede dilediğiniz gibi kullanabilirsiniz.
