import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const platforms = [
    {
      id: "instagram",
      name: "Instagram",
      baseUrl: "https://instagram.com/",
      iconUrl: "/resources/instagram.svg",
    },
    {
      id: "youtube",
      name: "YouTube",
      baseUrl: "https://youtube.com/",
      iconUrl: "/resources/youtube.svg",
    },
    {
      id: "tiktok",
      name: "TikTok",
      baseUrl: "https://tiktok.com/",
      iconUrl: "/resources/tiktok.svg",
    },
    {
      id: "facebook",
      name: "Facebook",
      baseUrl: "https://facebook.com/",
      iconUrl: "/resources/facebook.svg",
    },
    {
      id: "pinterest",
      name: "Pinterest",
      baseUrl: "https://pinterest.com/",
      iconUrl: "/resources/pinterest.svg",
    },
    {
      id: "x",
      name: "X",
      baseUrl: "https://x.com/",
      iconUrl: "/resources/x.svg",
    },
  ];

  for (const platform of platforms) {
    await prisma.platform.upsert({
      where: { id: platform.id },
      update: {},
      create: platform,
    });
  }

  console.log("✅ Plattformen erfolgreich angelegt.");
}

main()
  .catch((e) => {
    console.error("❌ Fehler beim Seeding:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
