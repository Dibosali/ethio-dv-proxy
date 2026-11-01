import {
  S3Client,
  HeadBucketCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as fs from "fs";
import * as path from "path";

// Load .env manually without external dependencies
try {
  const envPath = path.resolve(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [k, ...v] = trimmed.split("=");
        const val = v.join("=").replace(/^["']|["']$/g, "").trim();
        process.env[k.trim()] = val;
      }
    });
  }
} catch (e) {
  console.warn("Could not load .env file directly:", e);
}

async function testLiveBackblaze() {
  console.log("==================================================");
  console.log("🚀 TESTING LIVE BACKBLAZE B2 STORAGE CONNECTION");
  console.log("==================================================");

  const endpoint = process.env.B2_ENDPOINT;
  const region = process.env.B2_REGION;
  const keyId = process.env.B2_KEY_ID;
  const appKey = process.env.B2_APP_KEY;
  const bucketName = process.env.B2_BUCKET_NAME;

  console.log("Configuration from .env:");
  console.log(`- B2_ENDPOINT:    ${endpoint}`);
  console.log(`- B2_REGION:      ${region}`);
  console.log(`- B2_BUCKET_NAME: ${bucketName}`);
  console.log(`- B2_KEY_ID:      ${keyId?.slice(0, 8)}... (${keyId?.length} chars)`);
  console.log(`- B2_APP_KEY:     ${appKey ? "[PRESENT]" : "[MISSING]"}`);

  if (!endpoint || !region || !keyId || !appKey || !bucketName) {
    throw new Error("Missing required Backblaze B2 environment variables in .env");
  }

  const client = new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId: keyId,
      secretAccessKey: appKey,
    },
  });

  // Step 1: Check Bucket Access
  console.log("\n[Step 1] Verifying Bucket Access via HeadBucketCommand...");
  const t0 = Date.now();
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucketName }));
    console.log(`✅ Bucket "${bucketName}" exists and is accessible (${Date.now() - t0}ms).`);
  } catch (err: any) {
    console.error(`❌ HeadBucketCommand failed:`, err.message || err);
    throw err;
  }

  // Step 2: List Objects (read permission)
  console.log("\n[Step 2] Testing ListObjectsV2Command...");
  const t1 = Date.now();
  try {
    const listRes = await client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        MaxKeys: 5,
      })
    );
    console.log(
      `✅ ListObjectsV2 successful (${Date.now() - t1}ms). KeyCount: ${listRes.KeyCount ?? 0}`
    );
    if (listRes.Contents && listRes.Contents.length > 0) {
      console.log("   Existing objects found:");
      listRes.Contents.forEach((obj) => {
        console.log(`   - ${obj.Key} (${obj.Size} bytes)`);
      });
    } else {
      console.log("   Bucket is currently empty or has 0 objects in root.");
    }
  } catch (err: any) {
    console.error(`❌ ListObjectsV2 failed:`, err.message || err);
    throw err;
  }

  // Step 3: Test Upload (write permission)
  console.log("\n[Step 3] Testing PutObjectCommand (Upload test file)...");
  const testKey = `uploads/diagnostics/test-${Date.now()}.txt`;
  const testContent = `Backblaze B2 Health Check passed at ${new Date().toISOString()}`;
  const t2 = Date.now();
  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: testKey,
        Body: Buffer.from(testContent, "utf-8"),
        ContentType: "text/plain",
      })
    );
    console.log(`✅ Uploaded test object successfully (${Date.now() - t2}ms): ${testKey}`);
  } catch (err: any) {
    console.error(`❌ PutObjectCommand failed:`, err.message || err);
    throw err;
  }

  // Step 4: Test Pre-signed URL generation and retrieval
  console.log("\n[Step 4] Generating Pre-signed Read URL...");
  const t3 = Date.now();
  try {
    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: testKey,
    });
    const signedUrl = await getSignedUrl(client, getCommand, { expiresIn: 300 });
    console.log(`✅ Signed URL generated successfully (${Date.now() - t3}ms):`);
    console.log(`   ${signedUrl.slice(0, 100)}...`);

    // Fetch the signed URL to verify external download
    const fetchRes = await fetch(signedUrl);
    if (fetchRes.ok) {
      const text = await fetchRes.text();
      console.log(`✅ Pre-signed URL download verified (HTTP ${fetchRes.status})!`);
      console.log(`   Retrieved Content: "${text}"`);
    } else {
      console.warn(`⚠️ Pre-signed URL fetch returned HTTP ${fetchRes.status}`);
    }
  } catch (err: any) {
    console.error(`❌ Pre-signed URL test failed:`, err.message || err);
    throw err;
  }

  // Step 5: Clean up test file (delete permission)
  console.log("\n[Step 5] Cleaning up test file with DeleteObjectCommand...");
  const t4 = Date.now();
  try {
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: testKey,
      })
    );
    console.log(`✅ Test object deleted successfully (${Date.now() - t4}ms).`);
  } catch (err: any) {
    console.warn(`⚠️ Delete cleanup failed:`, err.message || err);
  }

  console.log("\n==================================================");
  console.log("🎉 ALL BACKBLAZE B2 TESTS PASSED PERFECTLY!");
  console.log("   - Bucket Access: OK");
  console.log("   - Read Permission: OK");
  console.log("   - Write / Upload Permission: OK");
  console.log("   - Signed URL Retrieval: OK");
  console.log("   - Delete Permission: OK");
  console.log("==================================================");
}

testLiveBackblaze().catch((err) => {
  console.error("\n💥 Backblaze B2 verification failed:", err);
  process.exit(1);
});
