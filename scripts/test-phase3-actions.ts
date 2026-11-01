import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { executeCreateProxyAgent, createProxyAgent } from "../src/actions/agent";

const prisma = new PrismaClient();

async function runPhase3Tests() {
  console.log("=================================================");
  console.log("🧪 TESTING PHASE 3: SUPER ADMIN SERVER ACTIONS");
  console.log("=================================================");

  const timestamp = Date.now();
  const testUsername = `agt_test_${timestamp}`;
  const testPassword = `TestSecret#${timestamp}!`;
  const testStationary = `Bole Test Cyber ${timestamp}`;
  const testPhone = "+251 91 999 8877";

  // -------------------------------------------------------------------------
  // TEST 1: Session Role Authorization Protection
  // -------------------------------------------------------------------------
  console.log("\n🔒 Test 1: Testing session protection on createProxyAgent...");
  const unauthorizedResult = await createProxyAgent({
    username: testUsername,
    password: testPassword,
    stationaryName: testStationary,
    phoneNumber: testPhone,
  });

  if (!unauthorizedResult.success && unauthorizedResult.error?.includes("Unauthorized")) {
    console.log("✅ Passed: Unauthenticated invocation was properly rejected with Unauthorized error.");
    console.log(`   Response: ${JSON.stringify(unauthorizedResult)}`);
  } else {
    throw new Error(`❌ Failed: Expected Unauthorized error but got: ${JSON.stringify(unauthorizedResult)}`);
  }

  // -------------------------------------------------------------------------
  // TEST 2: Input Validation (Schema Rejections)
  // -------------------------------------------------------------------------
  console.log("\n📋 Test 2: Testing schema validation with short password...");
  const invalidResult = await executeCreateProxyAgent({
    username: "ab", // too short (<3)
    password: "short", // too short (<8)
    stationaryName: "",
    phoneNumber: "123",
  });

  if (!invalidResult.success && invalidResult.error) {
    console.log("✅ Passed: Invalid payload correctly rejected by Zod schema.");
    console.log(`   Error message: "${invalidResult.error}"`);
  } else {
    throw new Error(`❌ Failed: Expected validation failure but got success: ${JSON.stringify(invalidResult)}`);
  }

  // -------------------------------------------------------------------------
  // TEST 3: $transaction Atomicity & Password Hashing in Neon DB
  // -------------------------------------------------------------------------
  console.log("\n⚡ Test 3: Executing createProxyAgent transaction in Neon database...");
  const createResult = await executeCreateProxyAgent({
    username: testUsername,
    password: testPassword,
    stationaryName: testStationary,
    phoneNumber: testPhone,
    city: "Addis Ababa",
  });

  if (!createResult.success || !createResult.data) {
    throw new Error(`❌ Failed to create agent: ${createResult.error}`);
  }

  const createdId = createResult.data.id;
  console.log("✅ Passed: User and Profile created simultaneously in $transaction!");
  console.log(`   User ID:         ${createdId}`);
  console.log(`   Username:        ${createResult.data.username}`);
  console.log(`   Role:            ${createResult.data.role}`);
  console.log(`   Stationary Name: ${createResult.data.profile.stationaryName}`);
  console.log(`   Phone Number:    ${createResult.data.profile.phoneNumber}`);
  console.log(`   Is Active:       ${createResult.data.profile.isActive}`);

  // -------------------------------------------------------------------------
  // TEST 4: Query Database directly & verify bcrypt hash
  // -------------------------------------------------------------------------
  console.log("\n🔑 Test 4: Verifying database record and bcrypt.compare...");
  const dbUser = await prisma.user.findUnique({
    where: { id: createdId },
    include: { profile: true },
  });

  if (!dbUser) throw new Error("❌ User not found in database.");
  if (!dbUser.profile) throw new Error("❌ Associated profile relation not found in database.");

  if (dbUser.passwordHash === testPassword) {
    throw new Error("❌ CRITICAL: Password was stored in plain text instead of bcrypt hash!");
  }

  const isBcryptValid = await bcrypt.compare(testPassword, dbUser.passwordHash);
  if (!isBcryptValid) {
    throw new Error("❌ bcrypt.compare failed to verify password against passwordHash!");
  }

  console.log("✅ Passed: Password hash verified via bcrypt.compare.");
  console.log(`   Stored hash prefix: ${dbUser.passwordHash.substring(0, 15)}...`);
  console.log(`   Profile stationary: ${dbUser.profile.stationaryName}`);

  // -------------------------------------------------------------------------
  // TEST 5: Duplicate Username Rejection
  // -------------------------------------------------------------------------
  console.log("\n🚫 Test 5: Testing duplicate username prevention...");
  const duplicateResult = await executeCreateProxyAgent({
    username: testUsername,
    password: "AnotherPassword123!",
    stationaryName: "Another Stationery",
    phoneNumber: "+251 91 111 2222",
  });

  if (!duplicateResult.success && duplicateResult.error?.includes("already taken")) {
    console.log("✅ Passed: Duplicate username was cleanly rejected.");
    console.log(`   Error: "${duplicateResult.error}"`);
  } else {
    throw new Error(`❌ Failed: Expected duplicate username error but got: ${JSON.stringify(duplicateResult)}`);
  }

  // -------------------------------------------------------------------------
  // TEST 6: Cleanup Test Data
  // -------------------------------------------------------------------------
  console.log("\n🧹 Test 6: Cleaning up test agent from Neon DB...");
  await prisma.user.delete({ where: { id: createdId } });
  const checkDeleted = await prisma.user.findUnique({ where: { id: createdId } });
  if (checkDeleted) throw new Error("❌ Failed to delete test user.");
  console.log("✅ Passed: Test user and cascaded profile cleaned up.");

  console.log("\n=================================================");
  console.log("🎉 ALL PHASE 3 AGENT MANAGEMENT TESTS PASSED!");
  console.log("=================================================\n");
}

runPhase3Tests()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
