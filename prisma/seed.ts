import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding skybio...");

  // The bio config singleton. Idempotent: created once, never overwritten so an
  // owner's customizations survive re-seeds (which run on every container boot).
  await prisma.profile.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      displayName: "your name",
      username: "user",
      bio: "welcome to my corner of the internet ✦\nedit everything at /admin",
      badges: ["owner"],
    },
  });
  console.log("  ✓ Profile singleton");

  // Seed a couple of example social links only if none exist yet.
  const socialCount = await prisma.socialLink.count();
  if (socialCount === 0) {
    await prisma.socialLink.createMany({
      data: [
        { platform: "discord", url: "https://discord.com", sortOrder: 1 },
        { platform: "github", url: "https://github.com", sortOrder: 2 },
      ],
    });
    console.log("  ✓ Example social links");
  }

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
