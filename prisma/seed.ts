import { Role } from "@prisma/client";
import { hash } from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local for the seed script
config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const settings = [
    ["panel.name", process.env.NEXT_PUBLIC_APP_NAME ?? "Ruby Panel"],
    ["setup.completed", "false"],
    ["panel.tagline", "Control Beyond Limits"],
    ["panel.theme", "ruby"]
  ] as const;

  for (const [key, value] of settings) {
    await prisma.panelSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  }

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (email && password) {
    const passwordHash = await hash(password, 12);
    await prisma.user.upsert({
      where: { email },
      update: { passwordHash, role: Role.SUPERADMIN, isActive: true },
      create: {
        email,
        username: process.env.SEED_ADMIN_USERNAME ?? "superadmin",
        passwordHash,
        role: Role.SUPERADMIN
      }
    });
    await prisma.panelSetting.upsert({
      where: { key: "setup.completed" },
      update: { value: "true" },
      create: { key: "setup.completed", value: "true" }
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
