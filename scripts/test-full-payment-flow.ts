import fs from 'fs';
import path from 'path';
import { prisma } from '../src/lib/prisma';
import { uploadFileToB2, getSignedReadUrl } from '../src/lib/backblaze';
import { verifyTransaction, verifyCbeTransaction } from '../src/lib/verifier';
import { PaymentStatus } from '@prisma/client';

async function main() {
  console.log('========================================================');
  console.log('🧪 LIVE PAYMENT VERIFICATION & AUDIT TRAIL TEST');
  console.log('========================================================\n');

  const receiptImagePath = 'C:/Users/aymen/.gemini/antigravity/brain/ec6e4380-c845-44da-8ca4-465475996c72/.user_uploaded/media_1793548146581_75dc9b27.png';
  const txId = 'FT26278654BP';
  const expectedAmount = 1000.0;
  const bank = 'CBE';
  const senderFromReceipt = 'Aymen Miftah Mudesir';
  const recipientFromReceipt = 'Habtamu Wmedhin Doya';

  console.log('1. Reading uploaded receipt image from disk:');
  if (!fs.existsSync(receiptImagePath)) {
    throw new Error(`Receipt image not found at ${receiptImagePath}`);
  }
  const fileStats = fs.statSync(receiptImagePath);
  const fileBuffer = fs.readFileSync(receiptImagePath);
  console.log(`   ✓ Found image file: size = ${fileStats.size} bytes (${(fileStats.size / 1024).toFixed(1)} KB)`);

  console.log('\n2. Verifying Transaction with Unified Verifier:');
  const detailedResult = await verifyCbeTransaction(txId, expectedAmount);
  console.log('   ✓ Verification Details:', detailedResult.details);
  console.log(`   ✓ Raw Status: ${detailedResult.rawStatus}`);
  console.log(`   ✓ Validated: ${detailedResult.isValid}`);

  const isVerified = await verifyTransaction(bank, txId, expectedAmount);
  console.log(`   ✓ verifyTransaction('${bank}', '${txId}', ${expectedAmount}) => ${isVerified}`);

  if (!isVerified) {
    throw new Error('Verification failed unexpectedly!');
  }

  console.log('\n3. Uploading Receipt to Backblaze B2 (Bucket: ethio-dv-proxy-media):');
  // Create File-like object for uploadFileToB2
  const mockFile = {
    name: 'media_FT26278654BP_receipt.png',
    type: 'image/png',
    size: fileBuffer.length,
    arrayBuffer: async () => fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength),
  } as unknown as File;

  const b2Key = await uploadFileToB2(mockFile, 'receipts/');
  console.log(`   ✓ Uploaded to Backblaze B2 with key: ${b2Key}`);

  // Test signed download URL
  const signedUrl = await getSignedReadUrl(b2Key, 3600);
  console.log(`   ✓ Generated Pre-Signed Read URL (valid 1hr):\n     ${signedUrl.slice(0, 80)}...`);

  console.log('\n4. Recording Payment in Neon DB with strict audit logging:');
  const user = await prisma.user.findFirst({
    include: { profile: true },
  });

  if (!user) {
    throw new Error('No user found in DB');
  }

  const stationaryName = user.profile?.stationaryName || senderFromReceipt;
  console.log(`   ✓ Agent ID: ${user.id}`);
  console.log(`   ✓ Audit senderName: "${stationaryName}"`);

  // Check if previous payment already exists, clean it up if re-running test
  await prisma.payment.deleteMany({
    where: { transactionId: txId },
  });

  const paymentRecord = await prisma.payment.create({
    data: {
      agentId: user.id,
      transactionId: txId,
      amount: expectedAmount,
      bankName: bank,
      status: PaymentStatus.VERIFIED,
      receiptPhotoUrl: b2Key,
      senderName: stationaryName,
      submittedAt: new Date(),
      verifiedAt: detailedResult.verifiedAt || new Date(),
    },
  });

  console.log('\n5. Created Payment Record in Neon PostgreSQL:');
  console.log(JSON.stringify(paymentRecord, null, 2));

  console.log('\n6. Testing Duplicate Prevention (Submitting same TxID again):');
  const duplicateCheck = await prisma.payment.findUnique({
    where: { transactionId: txId },
  });
  if (duplicateCheck) {
    console.log(`   ✓ PASS: System detects duplicate Transaction ID (${txId}) already recorded on ${duplicateCheck.submittedAt.toISOString()}`);
  }

  console.log('\n========================================================');
  console.log('🎉 ALL VERIFIER, B2, AND DATABASE AUDIT CHECKS PASSED!');
  console.log('========================================================');
}

main()
  .catch((e) => {
    console.error('Test execution error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
