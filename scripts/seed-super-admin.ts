import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Super Admin & Sample Proxy Agents into remote Neon PostgreSQL...");

  const adminUsername = process.env.ADMIN_USERNAME || "superadmin";
  const adminPassword = process.env.ADMIN_PASSWORD || "SuperAdmin2026!";

  const existingAdmin = await prisma.user.findUnique({
    where: { username: adminUsername },
    include: { profile: true },
  });

  if (!existingAdmin) {
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: adminUsername,
          passwordHash,
          role: Role.SUPER_ADMIN,
        },
      });

      await tx.profile.create({
        data: {
          userId: user.id,
          stationaryName: "DV Proxy National Central Command",
          phoneNumber: "+251 11 555 0199",
          isActive: true,
        },
      });
    });
    console.log(`✅ Super Admin created: ${adminUsername} / ${adminPassword}`);
  } else {
    console.log(`ℹ️ Super Admin user '${adminUsername}' already exists.`);
  }

  // Seed sample stationery agents
  const sampleAgents = [
    {
      username: "bole_star_stationery",
      password: "Dv2026#BoleStar9!",
      stationaryName: "Bole Star Stationery & Cyber",
      phoneNumber: "+251 91 123 4567",
    },
    {
      username: "kazanchis_express_dv",
      password: "Dv2026#KazExp4$",
      stationaryName: "Kazanchis Express Photo & Print",
      phoneNumber: "+251 92 888 9911",
    },
  ];

  for (const agent of sampleAgents) {
    const existing = await prisma.user.findUnique({
      where: { username: agent.username },
    });
    if (!existing) {
      const passwordHash = await bcrypt.hash(agent.password, 10);
      await prisma.$transaction(async (tx) => {
        const u = await tx.user.create({
          data: {
            username: agent.username,
            passwordHash,
            role: Role.PROXY_AGENT,
          },
        });
        await tx.profile.create({
          data: {
            userId: u.id,
            stationaryName: agent.stationaryName,
            phoneNumber: agent.phoneNumber,
            isActive: true,
          },
        });
      });
      console.log(`✅ Proxy Agent created: ${agent.username} / ${agent.password}`);
    } else {
      console.log(`ℹ️ Agent '${agent.username}' already exists.`);
    }
  }

  // Seed initial PaymentConfig if not exists
  const existingConfig = await prisma.paymentConfig.findUnique({
    where: { id: "default" },
  });
  if (!existingConfig) {
    await prisma.paymentConfig.create({
      data: {
        id: "default",
        feePerForm: 200.0,
        cbeAccountNumber: "1000123456789",
        cbeAccountName: "DV PROXY MANAGEMENT SERVICES",
        telebirrPhone: "+251 91 123 4567",
        telebirrName: "DV PROXY SERVICES",
        paymentNotice: "Please include your shop username or CN in the transfer remark.",
      },
    });
    console.log("✅ Initial PaymentConfig created.");
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
