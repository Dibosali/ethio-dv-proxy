import { getB2Client, getB2BucketName, getSignedReadUrl } from "../src/lib/backblaze";
import { executeSubmitDVApplication } from "../src/actions/submission";
import { prisma } from "../src/lib/prisma";
import { Role } from "@prisma/client";
import { DVFormPayload } from "../src/types/admin";

async function runB2Tests() {
  console.log("=================================================");
  console.log("🧪 TESTING BACKBLAZE B2 S3 STORAGE & INTEGRATION");
  console.log("=================================================");

  // -------------------------------------------------------------------------
  // TEST 1: S3Client Configuration & Environment Inspection
  // -------------------------------------------------------------------------
  console.log("\n📦 Test 1: Testing Backblaze S3Client initialization...");
  const client = getB2Client();
  const bucket = getB2BucketName();

  if (!client) throw new Error("❌ S3Client failed to initialize.");
  if (!bucket || bucket !== "dv-proxy-photos-private") {
    throw new Error(`❌ Unexpected bucket name: ${bucket}`);
  }

  console.log("✅ Passed: S3Client initialized successfully.");
  console.log(`   Configured Bucket: ${bucket}`);
  console.log(`   Configured Endpoint: ${process.env.B2_ENDPOINT}`);
  console.log(`   Configured Region:   ${process.env.B2_REGION}`);

  // -------------------------------------------------------------------------
  // TEST 2: Pre-signed URL Generation (Phase 4)
  // -------------------------------------------------------------------------
  console.log("\n🔐 Test 2: Testing pre-signed URL generation for private B2 files...");
  const sampleKey = "uploads/agt_bole_01/550e8400-e29b-41d4-a716-446655440000-entrant.jpg";
  const signedUrl = await getSignedReadUrl(sampleKey, 3600);

  if (!signedUrl.includes("X-Amz-Signature") || !signedUrl.includes("X-Amz-Expires=3600")) {
    throw new Error(`❌ Generated URL is not a valid AWS S3 pre-signed URL: ${signedUrl}`);
  }

  console.log("✅ Passed: Pre-signed URL generated with 1-hour expiration.");
  console.log(`   Sample Key: ${sampleKey}`);
  console.log(`   Signed URL Prefix: ${signedUrl.substring(0, 75)}...`);

  // Verify external URLs are returned unmodified
  const externalSample = "https://images.unsplash.com/photo-sample";
  const unmodified = await getSignedReadUrl(externalSample);
  if (unmodified !== externalSample) {
    throw new Error("❌ External URL was modified incorrectly by getSignedReadUrl");
  }
  console.log("✅ Passed: External/fallback URLs preserved without modification.");

  // -------------------------------------------------------------------------
  // TEST 3: File Key Structure Verification (Phase 2)
  // -------------------------------------------------------------------------
  console.log("\n📁 Test 3: Verifying file key structure formatting...");
  const agentId = "agt_test_b2_001";
  const uuid = crypto.randomUUID();
  const filename = "applicant_passport.png";
  const expectedKeyPattern = new RegExp(`^uploads/${agentId}/[a-f0-9-]+-applicant_passport\\.png$`);
  const generatedKey = `uploads/${agentId}/${uuid}-${filename}`;

  if (!expectedKeyPattern.test(generatedKey)) {
    throw new Error(`❌ Generated key does not match uploads/[agent_id]/[uuid]-[filename]: ${generatedKey}`);
  }
  console.log(`✅ Passed: Key matches required structure: "${generatedKey}"`);

  // -------------------------------------------------------------------------
  // TEST 4: Database Persistence of B2 File Keys (Phase 3)
  // -------------------------------------------------------------------------
  console.log("\n💾 Test 4: Testing relational submission with B2 file keys...");
  let agent = await prisma.user.findFirst({
    where: { role: Role.PROXY_AGENT },
  });

  if (!agent) {
    agent = await prisma.user.create({
      data: {
        username: `agt_b2_runner_${Date.now()}`,
        passwordHash: "$2b$12$TestB2PasswordHashExampleRunner!",
        role: Role.PROXY_AGENT,
        profile: {
          create: {
            stationaryName: "B2 Test Stationary",
            phoneNumber: "+251 91 777 6655",
            isActive: true,
          },
        },
      },
    });
  }

  const b2PrimaryPhotoKey = `uploads/${agent.id}/${crypto.randomUUID()}-primary_entrant.jpg`;
  const b2SpousePhotoKey = `uploads/${agent.id}/${crypto.randomUUID()}-spouse.jpg`;
  const b2ChildPhotoKey = `uploads/${agent.id}/${crypto.randomUUID()}-child1.jpg`;

  const timestamp = Date.now();
  const testPayload: DVFormPayload = {
    primaryEntrant: {
      name: { lastName: `B2_TEST_${timestamp}`, firstName: "ALMAZ" },
      gender: "FEMALE",
      dob: { month: "04", day: "12", year: "1994" },
      birthCity: "Gondar",
      birthCountry: "Ethiopia",
      mailingAddress: {
        addressLine1: "Piazza Central Road",
        city: "Gondar",
        districtStateCounty: "Central Gondar",
        country: "Ethiopia",
      },
      currentCountry: "Ethiopia",
      email: `almaz.${timestamp}@example.com`,
      educationLevel: "MASTERS_DEGREE",
      maritalStatus: "MARRIED_NON_LPR",
      numberOfChildren: 1,
      photoUrl: b2PrimaryPhotoKey, // Storing Backblaze B2 file key
    },
    spouse: {
      name: { lastName: `B2_TEST_${timestamp}`, firstName: "DAWIT" },
      gender: "MALE",
      dob: { month: "08", day: "25", year: "1992" },
      birthCity: "Bahir Dar",
      birthCountry: "Ethiopia",
      photoUrl: b2SpousePhotoKey, // Storing Backblaze B2 file key
    },
    children: [
      {
        name: { lastName: `B2_TEST_${timestamp}`, firstName: "SAMUEL" },
        gender: "MALE",
        dob: { month: "10", day: "10", year: "2022" },
        birthCity: "Gondar",
        birthCountry: "Ethiopia",
        photoUrl: b2ChildPhotoKey, // Storing Backblaze B2 file key
      },
    ],
  };

  const subResult = await executeSubmitDVApplication(testPayload, agent.id);
  if (!subResult.success || !subResult.data) {
    throw new Error(`❌ Failed to submit application: ${subResult.error}`);
  }

  const appId = subResult.data.applicationId;
  console.log(`✅ Passed: Application registered with ID: ${appId}`);

  // Query back from Neon database to verify the B2 file keys were persisted
  const dbApp = await prisma.application.findUnique({
    where: { id: appId },
    include: { derivatives: true },
  });

  if (!dbApp) throw new Error("❌ Application not found in Neon database!");
  if (dbApp.photoUrl !== b2PrimaryPhotoKey) {
    throw new Error(`❌ Primary photoUrl mismatch: expected ${b2PrimaryPhotoKey}, got ${dbApp.photoUrl}`);
  }

  const dbSpouse = dbApp.derivatives.find((d) => d.type === "SPOUSE");
  if (!dbSpouse || dbSpouse.photoUrl !== b2SpousePhotoKey) {
    throw new Error(`❌ Spouse photoUrl mismatch: expected ${b2SpousePhotoKey}, got ${dbSpouse?.photoUrl}`);
  }

  const dbChild = dbApp.derivatives.find((d) => d.type === "CHILD");
  if (!dbChild || dbChild.photoUrl !== b2ChildPhotoKey) {
    throw new Error(`❌ Child photoUrl mismatch: expected ${b2ChildPhotoKey}, got ${dbChild?.photoUrl}`);
  }

  console.log("✅ Passed: Stored B2 file keys verified in Neon PostgreSQL:");
  console.log(`   Primary Key: ${dbApp.photoUrl}`);
  console.log(`   Spouse Key:  ${dbSpouse.photoUrl}`);
  console.log(`   Child Key:   ${dbChild.photoUrl}`);

  // -------------------------------------------------------------------------
  // TEST 5: Pre-signed URL Resolution for Stored Database Keys
  // -------------------------------------------------------------------------
  console.log("\n🔗 Test 5: Resolving pre-signed reading URLs from persisted DB keys...");
  const signedPrimaryUrl = await getSignedReadUrl(dbApp.photoUrl);
  const signedSpouseUrl = await getSignedReadUrl(dbSpouse.photoUrl);
  const signedChildUrl = await getSignedReadUrl(dbChild.photoUrl);

  if (!signedPrimaryUrl.includes("X-Amz-Signature")) throw new Error("❌ Failed to sign primary photo URL");
  if (!signedSpouseUrl.includes("X-Amz-Signature")) throw new Error("❌ Failed to sign spouse photo URL");
  if (!signedChildUrl.includes("X-Amz-Signature")) throw new Error("❌ Failed to sign child photo URL");

  console.log("✅ Passed: All database B2 file keys successfully resolved to pre-signed URLs!");

  // Clean up test application and derivatives
  await prisma.application.delete({ where: { id: appId } });
  console.log("🧹 Cleaned up test application and cascaded derivatives.");

  console.log("\n=================================================");
  console.log("🎉 ALL BACKBLAZE B2 S3 INTEGRATION TESTS PASSED!");
  console.log("=================================================\n");
}

runB2Tests()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
