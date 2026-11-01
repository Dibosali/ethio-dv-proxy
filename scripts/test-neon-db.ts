import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("=== NEON POSTGRESQL END-TO-END VERIFICATION ===");
  console.log("Connecting to remote Neon instance...");

  const startTime = Date.now();

  // 1. Raw PostgreSQL Query
  const info: any[] = await prisma.$queryRaw`
    SELECT version(), current_database(), current_user, inet_server_addr(), now();
  `;
  console.log(" Connected to Neon PostgreSQL successfully!");
  console.log(" Database:", info[0].current_database);
  console.log(" User:", info[0].current_user);
  console.log(" Server Version:", info[0].version.split(" on ")[0]);
  console.log(" Server Timestamp:", info[0].now);
  console.log(` Latency: ${Date.now() - startTime}ms`);

  // 2. Test Transaction: Create User + Profile
  const testUsername = `admin_test_${Date.now().toString().slice(-4)}`;
  const passwordHash = await bcrypt.hash("NeonSecure2026!", 10);

  console.log(`\n Testing $transaction write: Creating test user '${testUsername}'...`);

  const createdUser = await prisma.$transaction(async (tx) => {
    return await tx.user.create({
      data: {
        username: testUsername,
        passwordHash,
        role: "SUPER_ADMIN",
        profile: {
          create: {
            stationaryName: "Bole Central Test Stationery",
            phoneNumber: "+251911223344",
            isActive: true,
          },
        },
      },
      include: {
        profile: true,
      },
    });
  });

  console.log(" Created user successfully in Neon!");
  console.log(" User ID:", createdUser.id);
  console.log(" Role:", createdUser.role);
  console.log(" Profile Stationary:", createdUser.profile?.stationaryName);

  // 3. Test Read Operation with relations
  console.log("\n Testing read query with relations...");
  const fetchedUser = await prisma.user.findUnique({
    where: { id: createdUser.id },
    include: { profile: true, applications: true },
  });

  if (!fetchedUser || !fetchedUser.profile) {
    throw new Error("Failed to retrieve user with profile from Neon!");
  }
  console.log(" Verified user fetched from Neon with profile relation!");

  // 4. Test Password Hash Verification
  const isMatch = await bcrypt.compare("NeonSecure2026!", fetchedUser.passwordHash);
  console.log(" Bcrypt password hash verification:", isMatch ? "PASSED" : "FAILED");

  // 5. Cleanup test record
  console.log("\n Cleaning up test user record...");
  await prisma.user.delete({
    where: { id: createdUser.id },
  });
  console.log(" Test user deleted cleanly!");

  console.log("\n=== ALL NEON POSTGRESQL END-TO-END TESTS PASSED SUCCESSFULLY! ===");
}

main()
  .catch((e) => {
    console.error("❌ Neon Verification Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
