import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function runHealthCheck() {
  console.log("==================================================");
  console.log("🔍 ETHIO DV PROXY: COMPREHENSIVE LOGIC HEALTH CHECK");
  console.log("==================================================");

  const testUsername = `test_agent_${Date.now().toString().slice(-5)}`;
  const testPassword = "OriginalPassword2026!";
  const updatedPassword = "UpdatedPassword2026!";
  const testStationaryName = "Bole Central Test Stationery";
  const updatedStationaryName = "Bole Central Test Stationery (Renamed)";

  let createdUserId: string | null = null;
  let createdAppId: string | null = null;

  try {
    // -------------------------------------------------------------
    // STEP 1: Verify Neon Database Connectivity
    // -------------------------------------------------------------
    console.log("\n[TEST 1/5] Checking Neon Database connection...");
    // Clean up any stale test agents from prior runs
    const staleTestUsers = await prisma.user.findMany({
      where: { username: { startsWith: "test_agent_" } },
    });
    for (const u of staleTestUsers) {
      await prisma.application.deleteMany({ where: { agentId: u.id } }).catch(() => {});
      await prisma.profile.deleteMany({ where: { userId: u.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: u.id } }).catch(() => {});
    }

    const userCount = await prisma.user.count();
    console.log(`✅ Neon PostgreSQL is active and connected. Total users in DB: ${userCount}`);

    // -------------------------------------------------------------
    // STEP 2: Real Stationery Account Creation
    // -------------------------------------------------------------
    console.log(`\n[TEST 2/5] Creating real stationery agent: ${testUsername}...`);
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(testPassword, saltRounds);

    const createdAgent = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: testUsername,
          passwordHash,
          role: Role.PROXY_AGENT,
        },
      });

      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          stationaryName: testStationaryName,
          phoneNumber: "+251 91 100 2233",
          city: "Addis Ababa",
          subCityDistrict: "Bole Sub-city, Woreda 04",
          notes: "Verification test stationery account",
          isActive: true,
        },
      });

      return { user, profile };
    });

    createdUserId = createdAgent.user.id;
    console.log(`✅ Successfully created real Stationery in DB!`);
    console.log(`   ID: ${createdAgent.user.id}`);
    console.log(`   Username: ${createdAgent.user.username}`);
    console.log(`   Stationary: ${createdAgent.profile.stationaryName}`);
    console.log(`   City: ${createdAgent.profile.city}`);
    console.log(`   District: ${createdAgent.profile.subCityDistrict}`);

    // -------------------------------------------------------------
    // STEP 3: NextAuth Credential Login Flow Verification
    // -------------------------------------------------------------
    console.log(`\n[TEST 3/5] Testing NextAuth credentials authentication logic...`);
    const authUser = await prisma.user.findUnique({
      where: { username: testUsername },
      include: { profile: true },
    });

    if (!authUser) {
      throw new Error("Failed to retrieve newly created user for auth check");
    }

    // Verify correct password matches
    const isPasswordCorrect = await bcrypt.compare(testPassword, authUser.passwordHash);
    if (!isPasswordCorrect) {
      throw new Error("Password verification failed for correct credentials!");
    }
    console.log(`✅ Valid credentials correctly matched via bcrypt hash.`);

    // Verify invalid password fails
    const isInvalidPasswordRejected = !(await bcrypt.compare("WrongPassword123", authUser.passwordHash));
    if (!isInvalidPasswordRejected) {
      throw new Error("Security flaw: Invalid password was accepted!");
    }
    console.log(`✅ Invalid password correctly rejected.`);

    // Verify active account check
    if (!authUser.profile?.isActive) {
      throw new Error("Stationery active check failed.");
    }

    // Verify returned session payload structure
    const sessionPayload = {
      id: authUser.id,
      username: authUser.username,
      role: authUser.role,
      stationaryName: authUser.profile?.stationaryName || "",
      agentId: authUser.profile?.id || authUser.id,
    };
    console.log(`✅ NextAuth session user generated successfully:`, sessionPayload);

    // -------------------------------------------------------------
    // STEP 4: Stationery Account Editing by Admin
    // -------------------------------------------------------------
    console.log(`\n[TEST 4/5] Testing Super Admin account edit logic...`);
    const newPasswordHash = await bcrypt.hash(updatedPassword, 12);

    const updatedAgent = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: createdUserId! },
        data: {
          passwordHash: newPasswordHash,
        },
      });

      const profile = await tx.profile.update({
        where: { userId: createdUserId! },
        data: {
          stationaryName: updatedStationaryName,
          phoneNumber: "+251 99 999 8888",
          city: "Dire Dawa",
          subCityDistrict: "Kezira Area",
          notes: "Updated during logic verification",
          isActive: true,
        },
      });

      return { user, profile };
    });

    // Check updated fields
    if (updatedAgent.profile.stationaryName !== updatedStationaryName) {
      throw new Error("Stationary name was not updated correctly!");
    }
    if (updatedAgent.profile.city !== "Dire Dawa") {
      throw new Error("City was not updated correctly!");
    }

    // Verify new password works and old password fails
    const isNewPasswordValid = await bcrypt.compare(updatedPassword, updatedAgent.user.passwordHash);
    const isOldPasswordInvalid = !(await bcrypt.compare(testPassword, updatedAgent.user.passwordHash));
    if (!isNewPasswordValid || !isOldPasswordInvalid) {
      throw new Error("Password update check failed!");
    }
    console.log(`✅ Stationery account successfully updated in DB:`);
    console.log(`   New Stationary Name: ${updatedAgent.profile.stationaryName}`);
    console.log(`   New City: ${updatedAgent.profile.city}`);
    console.log(`   New Password verified successfully.`);

    // -------------------------------------------------------------
    // STEP 5: Payment Reporting & Paid Submissions Log Check
    // -------------------------------------------------------------
    console.log(`\n[TEST 5/5] Testing Payment settlement & Paid Submissions Audit Log...`);
    
    // Create a dummy application
    const application = await prisma.application.create({
      data: {
        agentId: createdUserId!,
        isPaid: false,
        isFilled: true,
        firstName: "Abebe",
        lastName: "Bikila",
        gender: "MALE",
        birthDate: new Date("1990-01-01"),
        birthCity: "Addis Ababa",
        birthCountry: "Ethiopia",
        eligibilityCountry: "Ethiopia",
        addressLine1: "Bole, House 123",
        city: "Addis Ababa",
        state: "Addis Ababa",
        mailingCountry: "Ethiopia",
        currentCountry: "Ethiopia",
        email: "abebe@example.com",
        phone: "+251911223344",
        educationLevel: "UNIVERSITY_DEGREE",
        maritalStatus: "UNMARRIED",
        numberOfChildren: 0,
        photoUrl: "https://example.com/photo.jpg",
      },
    });
    createdAppId = application.id;

    console.log(`   Created test application ID: ${application.id} (isPaid: ${application.isPaid}, isFilled: ${application.isFilled})`);

    // Simulate recordPaymentAction with uploaded receipt
    const testTxRef = `CBE-TXN-${Date.now().toString().slice(-6)}`;
    const testReceiptUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const testReceiptFileName = "cbe_screenshot_confirmation.png";

    const paidApp = await prisma.application.update({
      where: { id: createdAppId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentReference: testTxRef,
        paymentMethod: "CBE",
        paymentAmount: 200,
        receiptUrl: testReceiptUrl,
        receiptFileName: testReceiptFileName,
      },
      include: {
        agent: { include: { profile: true } },
      },
    });

    if (
      !paidApp.isPaid ||
      paidApp.paymentReference !== testTxRef ||
      paidApp.paymentAmount !== 200 ||
      paidApp.receiptUrl !== testReceiptUrl ||
      paidApp.receiptFileName !== testReceiptFileName
    ) {
      throw new Error("Payment record check with receipt upload failed!");
    }
    console.log(`✅ Payment with attached receipt successfully recorded in DB!`);
    console.log(`   Reference Code: ${paidApp.paymentReference}`);
    console.log(`   Receipt File: ${paidApp.receiptFileName}`);
    console.log(`   Method: ${paidApp.paymentMethod}`);
    console.log(`   Amount: ${paidApp.paymentAmount} ETB`);
    console.log(`   Paid At: ${paidApp.paidAt?.toISOString()}`);

    // Query paid submissions audit log
    const auditLogs = await prisma.application.findMany({
      where: { isPaid: true },
      include: {
        agent: { include: { profile: true } },
      },
      orderBy: { paidAt: "desc" },
    });

    const foundInAudit = auditLogs.find((a) => a.id === createdAppId);
    if (!foundInAudit) {
      throw new Error("Recorded payment did not appear in audit log query!");
    }
    console.log(`✅ Paid Submissions Audit Log query verified: ${auditLogs.length} total paid record(s) found in Neon DB.`);

    console.log("\n==================================================");
    console.log("🎉 ALL HEALTH CHECKS PASSED WITH 100% SUCCESS!");
    console.log("==================================================");
  } catch (err) {
    console.error("\n❌ HEALTH CHECK FAILED:", err);
    process.exit(1);
  } finally {
    // Cleanup temporary test records
    console.log("\n🧹 Cleaning up test records from database...");
    if (createdAppId) {
      await prisma.derivative.deleteMany({ where: { applicationId: createdAppId } }).catch(() => {});
      await prisma.application.delete({ where: { id: createdAppId } }).catch(() => {});
      console.log(`   Cleaned up test application.`);
    }
    if (createdUserId) {
      await prisma.profile.deleteMany({ where: { userId: createdUserId } }).catch(() => {});
      await prisma.user.delete({ where: { id: createdUserId } }).catch(() => {});
      console.log(`   Cleaned up test user & profile.`);
    }
    await prisma.$disconnect();
    console.log("🏁 Health check run completed cleanly.");
  }
}

runHealthCheck();
