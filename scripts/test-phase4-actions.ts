import { Role, Gender, MaritalStatus, DerivativeType } from "@prisma/client";
import { prisma } from "../src/lib/prisma";
import { submitDVApplication, executeSubmitDVApplication } from "../src/actions/submission";
import { DVFormPayload } from "../src/types/admin";

async function runPhase4Tests() {
  console.log("=================================================");
  console.log("🧪 TESTING PHASE 4: SUBMISSION SERVER ACTIONS & RELATIONAL MAPPING");
  console.log("=================================================");

  // Find or create an agent user to act as agentId
  let agent = await prisma.user.findFirst({
    where: { role: Role.PROXY_AGENT },
    include: { profile: true },
  });

  if (!agent) {
    console.log("Creating temporary proxy agent for testing...");
    agent = await prisma.user.create({
      data: {
        username: `agt_dv_tester_${Date.now()}`,
        passwordHash: "$2b$12$eXampleHashedPasswordForTestRunnerOnly!",
        role: Role.PROXY_AGENT,
        profile: {
          create: {
            stationaryName: "Addis Ababa Central Proxy Stationary",
            phoneNumber: "+251 91 222 3344",
            isActive: true,
          },
        },
      },
      include: { profile: true },
    });
  }

  console.log(`Using Agent: ${agent.username} (ID: ${agent.id})`);

  // -------------------------------------------------------------------------
  // TEST 1: Session Authorization Check
  // -------------------------------------------------------------------------
  console.log("\n🔒 Test 1: Testing session protection on submitDVApplication...");
  const dummyPayload: DVFormPayload = {
    primaryEntrant: {
      name: { lastName: "TESTING" },
      gender: "MALE",
      dob: { month: "01", day: "01", year: "1990" },
      birthCity: "Addis Ababa",
      birthCountry: "Ethiopia",
      mailingAddress: {
        addressLine1: "Bole Medhanialem",
        city: "Addis Ababa",
        districtStateCounty: "Bole",
        country: "Ethiopia",
      },
      currentCountry: "Ethiopia",
      email: "test@example.com",
      educationLevel: "UNIVERSITY_DEGREE",
      maritalStatus: "UNMARRIED",
      numberOfChildren: 0,
    },
  };

  const unauthorizedResult = await submitDVApplication(dummyPayload);
  if (!unauthorizedResult.success && unauthorizedResult.error?.includes("Unauthorized")) {
    console.log("✅ Passed: Unauthenticated call correctly blocked.");
    console.log(`   Response: ${JSON.stringify(unauthorizedResult)}`);
  } else {
    throw new Error(`❌ Failed: Expected Unauthorized error but got: ${JSON.stringify(unauthorizedResult)}`);
  }

  // -------------------------------------------------------------------------
  // TEST 2: Relational $transaction Insert (Primary + Spouse + Children)
  // -------------------------------------------------------------------------
  console.log("\n⚡ Test 2: Executing relational submission transaction on Neon PostgreSQL...");

  const timestamp = Date.now();
  const testPayload: DVFormPayload = {
    primaryEntrant: {
      name: {
        lastName: `KEBEDE_${timestamp}`,
        firstName: "ABEBE",
        middleName: "BIKILA",
        noFirstName: false,
        noMiddleName: false,
      },
      gender: "MALE",
      dob: { month: "07", day: "21", year: "1988" },
      birthCity: "Addis Ababa",
      birthCityUnknown: false,
      birthCountry: "Ethiopia",
      countryOfEligibilitySame: "YES",
      mailingAddress: {
        inCareOf: "Bole Cyber",
        addressLine1: "Airport Road, Bldg 4",
        addressLine2: "Suite 201",
        city: "Addis Ababa",
        districtStateCounty: "Bole Sub-City",
        postalCode: "1000",
        noPostalCode: false,
        country: "Ethiopia",
      },
      currentCountry: "Ethiopia",
      phoneNumber: "+251 91 123 4567",
      email: `abebe.kebede.${timestamp}@example.com`,
      educationLevel: "UNIVERSITY_DEGREE",
      maritalStatus: "MARRIED_NON_LPR",
      numberOfChildren: 2,
    },
    spouse: {
      name: {
        lastName: `TADESSE_${timestamp}`,
        firstName: "TIGIST",
        middleName: "KASSA",
        noFirstName: false,
        noMiddleName: false,
      },
      gender: "FEMALE",
      dob: { month: "11", day: "05", year: "1991" },
      birthCity: "Hawassa",
      birthCityUnknown: false,
      birthCountry: "Ethiopia",
    },
    children: [
      {
        name: {
          lastName: `KEBEDE_${timestamp}`,
          firstName: "DAWIT",
          middleName: "ABEBE",
          noFirstName: false,
          noMiddleName: false,
        },
        gender: "MALE",
        dob: { month: "03", day: "14", year: "2018" },
        birthCity: "Addis Ababa",
        birthCityUnknown: false,
        birthCountry: "Ethiopia",
      },
      {
        name: {
          lastName: `KEBEDE_${timestamp}`,
          firstName: "HELEN",
          middleName: "ABEBE",
          noFirstName: false,
          noMiddleName: false,
        },
        gender: "FEMALE",
        dob: { month: "09", day: "30", year: "2021" },
        birthCity: "Addis Ababa",
        birthCityUnknown: false,
        birthCountry: "Ethiopia",
      },
    ],
  };

  const submissionResult = await executeSubmitDVApplication(testPayload, agent.id);

  if (!submissionResult.success || !submissionResult.data) {
    throw new Error(`❌ Failed to submit application: ${submissionResult.error}`);
  }

  const { applicationId, confirmationNumber, derivativesCount, derivatives } = submissionResult.data;
  console.log("✅ Passed: Multi-table relational transaction committed successfully!");
  console.log(`   Application ID:      ${applicationId}`);
  console.log(`   Confirmation Number: ${confirmationNumber}`);
  console.log(`   Derivatives Linked:  ${derivativesCount}`);

  // -------------------------------------------------------------------------
  // TEST 3: Direct Database Verification (Enum mappings & Foreign Keys)
  // -------------------------------------------------------------------------
  console.log("\n🔍 Test 3: Verifying relational models in Neon database...");
  const dbApp = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      derivatives: {
        orderBy: { createdAt: "asc" },
      },
      agent: {
        include: { profile: true },
      },
    },
  });

  if (!dbApp) throw new Error("❌ Application record was not found in Neon database!");

  // Verify Primary Entrant
  if (dbApp.lastName !== `KEBEDE_${timestamp}`) throw new Error("❌ Last name mismatch");
  if (dbApp.gender !== Gender.MALE) throw new Error("❌ Gender enum mapping failed");
  if (dbApp.maritalStatus !== MaritalStatus.MARRIED_NON_LPR) throw new Error("❌ Marital status enum mapping failed");
  if (dbApp.birthDate.getUTCFullYear() !== 1988 || dbApp.birthDate.getUTCMonth() !== 6 || dbApp.birthDate.getUTCDate() !== 21) {
    throw new Error(`❌ Date of birth parsing failed: ${dbApp.birthDate.toISOString()}`);
  }

  console.log("✅ Primary Entrant fields & enums verified:");
  console.log(`   Applicant:   ${dbApp.lastName}, ${dbApp.firstName} ${dbApp.middleName}`);
  console.log(`   DOB (UTC):   ${dbApp.birthDate.toISOString().split("T")[0]}`);
  console.log(`   Gender Enum: ${dbApp.gender}`);
  console.log(`   Marital:     ${dbApp.maritalStatus}`);
  console.log(`   Stationary:  ${dbApp.agent.profile?.stationaryName}`);

  // Verify Derivatives
  if (dbApp.derivatives.length !== 3) {
    throw new Error(`❌ Expected 3 derivatives, found ${dbApp.derivatives.length}`);
  }

  const dbSpouse = dbApp.derivatives.find((d) => d.type === DerivativeType.SPOUSE);
  if (!dbSpouse) throw new Error("❌ Spouse derivative missing");
  if (dbSpouse.gender !== Gender.FEMALE) throw new Error("❌ Spouse gender enum mismatch");
  if (dbSpouse.birthDate.getUTCFullYear() !== 1991) throw new Error("❌ Spouse DOB mismatch");

  const dbChildren = dbApp.derivatives.filter((d) => d.type === DerivativeType.CHILD);
  if (dbChildren.length !== 2) throw new Error("❌ Expected 2 child derivatives");

  console.log("✅ Derivatives relational mapping verified:");
  console.log(`   Spouse:  ${dbSpouse.lastName}, ${dbSpouse.firstName} (${dbSpouse.gender}, DOB: ${dbSpouse.birthDate.toISOString().split("T")[0]})`);
  for (let i = 0; i < dbChildren.length; i++) {
    const c = dbChildren[i];
    console.log(`   Child ${i + 1}: ${c.lastName}, ${c.firstName} (${c.gender}, DOB: ${c.birthDate.toISOString().split("T")[0]})`);
  }

  // -------------------------------------------------------------------------
  // TEST 4: Cascade Delete Verification
  // -------------------------------------------------------------------------
  console.log("\n🗑️ Test 4: Testing cascade deletion of derivatives on application delete...");
  await prisma.application.delete({
    where: { id: applicationId },
  });

  const checkApp = await prisma.application.findUnique({ where: { id: applicationId } });
  if (checkApp) throw new Error("❌ Application was not deleted!");

  const orphanDerivatives = await prisma.derivative.findMany({
    where: { applicationId },
  });

  if (orphanDerivatives.length !== 0) {
    throw new Error(`❌ Cascade delete failed: ${orphanDerivatives.length} orphan derivatives remaining!`);
  }

  console.log("✅ Passed: Deleting Application cascade-deleted all 3 associated Derivatives.");

  // Clean up test agent if we created one
  if (agent.username.startsWith("agt_dv_tester_")) {
    await prisma.user.delete({ where: { id: agent.id } });
    console.log("🧹 Cleaned up temporary test agent.");
  }

  console.log("\n=================================================");
  console.log("🎉 ALL PHASE 4 SUBMISSION TESTS PASSED!");
  console.log("=================================================\n");
}

runPhase4Tests()
  .catch((e) => {
    console.error("Test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
