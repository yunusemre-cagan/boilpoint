import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Academy LMS veritabanı örnek verilerle dolduruluyor...");

  // 1. Yönetici Kullanıcı
  const admin = await prisma.user.upsert({
    where: { email: "admin@academy.com" },
    update: {},
    create: {
      name: "Akademi Yöneticisi",
      email: "admin@academy.com",
      role: "ADMIN",
      passwordHash: "admin123",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  // 2. Örnek Öğrenciler
  const studentsData = [
    { name: "Ali Yılmaz", email: "ali@example.com", grade: 8, schoolName: "Atatürk Ortaokulu" },
    { name: "Zeynep Kaya", email: "zeynep@example.com", grade: 8, schoolName: "Cumhuriyet İÖO" },
    { name: "Mehmet Demir", email: "mehmet@example.com", grade: 7, schoolName: "Fatih Koleji" },
    { name: "Elif Çelik", email: "elif@example.com", grade: 6, schoolName: "Mehmet Akif O.O" },
    { name: "Emir Şahin", email: "emir@example.com", grade: 8, schoolName: "Atatürk Ortaokulu" },
  ];

  const students = [];
  for (const s of studentsData) {
    const student = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: { ...s, role: "STUDENT" },
    });
    students.push(student);
  }

  // 3. Kategoriler
  const catScience = await prisma.category.upsert({
    where: { slug: "fen-bilimleri" },
    update: {},
    create: { name: "Fen Bilimleri", slug: "fen-bilimleri" },
  });

  const catMath = await prisma.category.upsert({
    where: { slug: "matematik" },
    update: {},
    create: { name: "Matematik & Mantık", slug: "matematik" },
  });

  // 4. Örnek Blog / Ders Notları
  const posts = [
    {
      title: "LGS Hazırlık Sürecinde Etkili Tekrar ve Soru Çözme Teknikleri",
      slug: "lgs-hazirlik-etkili-tekrar",
      excerpt: "Sınav maratonunda zamanı doğru yönetmek ve yeni nesil soruları analiz etmek için ipuçları.",
      content: "<p>Yeni nesil sorularda en kritik adım sorunun kökünü doğru okumaktır...</p>",
      status: "PUBLISHED",
      viewCount: 1420,
      authorId: admin.id,
      categoryId: catScience.id,
    },
    {
      title: "Hücre Bölünmesi ve Kalıtım Ünitesi Özeti",
      slug: "hucre-bolunmesi-ve-kalitim",
      excerpt: "Mitoz ve Mayoz bölünme arasındaki farklar, DNA replikasyonu ve mutasyonlar.",
      content: "<p>Mitoz bölünme vücut hücrelerinde görülürken, mayoz bölünme üreme ana hücrelerinde gerçekleşir...</p>",
      status: "PUBLISHED",
      viewCount: 980,
      authorId: admin.id,
      categoryId: catScience.id,
    },
  ];

  for (const p of posts) {
    await prisma.post.upsert({
      where: { slug: p.slug },
      update: {},
      create: p as any,
    });
  }

  // 5. Örnek Quiz
  const sampleQuiz = await prisma.quiz.upsert({
    where: { slug: "8-sinif-dna-genetik-kod-tarama" },
    update: {},
    create: {
      title: "8. Sınıf DNA ve Genetik Kod Denemesi",
      slug: "8-sinif-dna-genetik-kod-tarama",
      grade: 8,
      unit: "2. Ünite: DNA ve Genetik Kod",
      topic: "Genetik Şifre & Mutasyon",
      difficulty: "YENI_NESIL",
      durationMin: 20,
      isPublished: true,
      questions: {
        create: [
          {
            question: "DNA molekülünün çift sarmallı yapısında Adenin nükleotidinin karşısına hangi baz gelir?",
            options: [
              { id: 0, text: "A) Timin", isCorrect: true },
              { id: 1, text: "B) Guanin", isCorrect: false },
              { id: 2, text: "C) Sitozin", isCorrect: false },
              { id: 3, text: "D) Urasil", isCorrect: false },
            ],
            explanation: "DNA molekülünde A ile T, G ile S bazları hidrojen bağlarıyla eşleşir.",
            order: 1,
          },
        ],
      },
    },
  });

  // 6. Örnek Deneme Çözümleri (Quiz Attempts)
  if (students.length > 0) {
    await prisma.quizAttempt.create({
      data: {
        userId: students[0].id,
        quizId: sampleQuiz.id,
        score: 95,
        correctCount: 19,
        wrongCount: 1,
        emptyCount: 0,
        timeSpentSec: 720,
      },
    });
  }

  console.log("✅ Örnek veriler başarıyla yüklendi!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
