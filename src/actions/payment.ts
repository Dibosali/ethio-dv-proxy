"use server";

import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { PaymentStatus, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { uploadFileToB2, getSignedReadUrl } from "@/lib/backblaze";
import { verifyTransaction, BankType } from "@/lib/verifier";

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Graceful for environments without active request store
  }
}

export interface PaymentProcessResult {
  success: boolean;
  status: PaymentStatus;
  message: string;
  paymentId?: string;
  transactionId: string;
  verifiedAt?: string | null;
  error?: string;
}

/**
 * Phase 3: Secure Payment Server Action with Identity Logging & Verification.
 * 
 * 1. Authenticates session and retrieves the invoking Agent's Profile (stationaryName).
 * 2. Extracts bank, transactionId, expectedAmount, receiptFile, and optional applicationId.
 * 3. Uploads receipt image via Backblaze B2 (uploadFileToB2).
 * 4. Awaits the verifyTransaction() utility.
 * 5. Uses a Prisma $transaction to record the Payment audit log:
 *    - If verified: status: VERIFIED, verifiedAt: new Date(), senderName: profile.stationaryName
 *    - If verification fails: status: FAILED, verifiedAt: null, senderName: profile.stationaryName
 */
export async function processPaymentAndVerify(
  formData: FormData
): Promise<PaymentProcessResult> {
  try {
    // 1. Authenticate the session
    const session = await getServerAuthSession();
    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        status: PaymentStatus.FAILED,
        transactionId: "",
        message: "Authentication required. Please log in as a registered stationary.",
        error: "UNAUTHORIZED",
      };
    }

    // Fetch user and profile to retrieve their registered stationaryName
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    });

    if (!user) {
      return {
        success: false,
        status: PaymentStatus.FAILED,
        transactionId: "",
        message: "Stationary account not found.",
        error: "USER_NOT_FOUND",
      };
    }

    const stationaryName =
      user.profile?.stationaryName || user.username || "DV Proxy Agent";

    // 2. Extract inputs from FormData
    const rawBank = formData.get("bankName") || formData.get("bank");
    const rawTxId = formData.get("transactionId") || formData.get("reference");
    const rawAmount = formData.get("expectedAmount") || formData.get("amount");
    const receiptFile = formData.get("receiptFile") as File | null;
    const applicationId = (formData.get("applicationId") as string) || null;

    if (!rawTxId || typeof rawTxId !== "string" || !rawTxId.trim()) {
      return {
        success: false,
        status: PaymentStatus.FAILED,
        transactionId: "",
        message: "Transaction ID / Reference Number is required.",
        error: "MISSING_TX_ID",
      };
    }

    const transactionId = rawTxId.trim().toUpperCase();

    if (!rawBank || typeof rawBank !== "string") {
      return {
        success: false,
        status: PaymentStatus.FAILED,
        transactionId,
        message: "Please select a valid bank (CBE, TELEBIRR, or BOA).",
        error: "MISSING_BANK",
      };
    }

    const bankUpper = rawBank.trim().toUpperCase();
    if (bankUpper !== "CBE" && bankUpper !== "TELEBIRR" && bankUpper !== "BOA") {
      return {
        success: false,
        status: PaymentStatus.FAILED,
        transactionId,
        message: "Unsupported bank selected. Choose CBE, TELEBIRR, or BOA.",
        error: "INVALID_BANK",
      };
    }
    const bankName = bankUpper as BankType;

    const expectedAmount = parseFloat(String(rawAmount || "0"));
    if (isNaN(expectedAmount) || expectedAmount <= 0) {
      return {
        success: false,
        status: PaymentStatus.FAILED,
        transactionId,
        message: "A valid positive expected payment amount is required.",
        error: "INVALID_AMOUNT",
      };
    }

    // Check for duplicate transaction ID
    const existingPayment = await prisma.payment.findUnique({
      where: { transactionId },
    });

    if (existingPayment) {
      return {
        success: false,
        status: existingPayment.status,
        transactionId,
        message: `Transaction ID ${transactionId} has already been logged on ${new Date(
          existingPayment.submittedAt
        ).toLocaleDateString()} with status: ${existingPayment.status}. Duplicate submissions are prohibited.`,
        error: "DUPLICATE_TX_ID",
      };
    }

    // Check if receipt has already been uploaded for this application
    if (applicationId) {
      const existingApp = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { payment: true },
      });
      if (existingApp && (existingApp.isPaid || existingApp.receiptUrl || existingApp.payment)) {
        return {
          success: false,
          status: PaymentStatus.FAILED,
          transactionId,
          message: `Payment receipt has already been uploaded for applicant "${existingApp.firstName || ""} ${existingApp.lastName}". Duplicate upload is prohibited.`,
          error: "RECEIPT_ALREADY_UPLOADED",
        };
      }
    }

    // 3. Upload Receipt to Backblaze B2
    let receiptPhotoUrl = "";
    if (receiptFile && typeof receiptFile === "object" && "size" in receiptFile && receiptFile.size > 0) {
      try {
        receiptPhotoUrl = await uploadFileToB2(receiptFile, "receipts/");
      } catch (uploadErr) {
        console.error("[processPaymentAndVerify] B2 upload error:", uploadErr);
        receiptPhotoUrl = `uploads/receipts/failed_upload_${Date.now()}_${transactionId}`;
      }
    } else {
      // If no file binary provided, create placeholder reference
      receiptPhotoUrl = `uploads/receipts/manual_${transactionId}.jpg`;
    }

    // 4. Await verifyTransaction() utility
    const isVerified = await verifyTransaction(bankName, transactionId, expectedAmount);
    const verifiedTimestamp = isVerified ? new Date() : null;
    const paymentStatus: PaymentStatus = isVerified
      ? PaymentStatus.VERIFIED
      : PaymentStatus.FAILED;

    // 5. Log & Save using Prisma $transaction
    const resultPayment = await prisma.$transaction(async (tx) => {
      // Validate optional applicationId
      let validAppId: string | null = null;
      if (applicationId) {
        const app = await tx.application.findUnique({
          where: { id: applicationId },
          include: { payment: true },
        });
        if (app && !app.payment) {
          validAppId = app.id;
        }
      }

      // Create Payment audit record with hardcoded stationary senderName
      const payment = await tx.payment.create({
        data: {
          agentId: user.id,
          applicationId: validAppId,
          transactionId,
          amount: expectedAmount,
          bankName,
          status: paymentStatus,
          receiptPhotoUrl,
          senderName: stationaryName,
          submittedAt: new Date(),
          verifiedAt: verifiedTimestamp,
        },
      });

      // If linked to an application and verified, update application payment fields
      if (validAppId && isVerified) {
        await tx.application.update({
          where: { id: validAppId },
          data: {
            isPaid: true,
            paidAt: verifiedTimestamp,
            paymentReference: transactionId,
            paymentMethod: bankName,
            paymentAmount: expectedAmount,
            receiptUrl: receiptPhotoUrl,
            receiptFileName: receiptFile?.name || `${transactionId}.jpg`,
          },
        });
      }

      return payment;
    });

    // Revalidate paths for admin and agents
    safeRevalidate("/admin");
    safeRevalidate("/admin/submissions");
    safeRevalidate("/analytics");
    safeRevalidate("/stationary/submissions");

    if (isVerified) {
      return {
        success: true,
        status: PaymentStatus.VERIFIED,
        paymentId: resultPayment.id,
        transactionId,
        verifiedAt: verifiedTimestamp?.toISOString(),
        message: `Payment of ${expectedAmount} ETB via ${bankName} successfully verified and logged for ${stationaryName}!`,
      };
    } else {
      return {
        success: false,
        status: PaymentStatus.FAILED,
        paymentId: resultPayment.id,
        transactionId,
        message: `Payment verification failed for ${bankName} reference ${transactionId}. An audit record with status FAILED has been logged for Super Admin review.`,
        error: "VERIFICATION_FAILED",
      };
    }
  } catch (error: any) {
    console.error("[processPaymentAndVerify] Internal error:", error);
    return {
      success: false,
      status: PaymentStatus.FAILED,
      transactionId: "",
      message: error?.message || "An unexpected error occurred while processing payment.",
      error: "INTERNAL_SERVER_ERROR",
    };
  }
}

/**
 * Super Admin query to fetch all payment audit logs with agent profile details
 * and signed B2 URLs for receipt images.
 */
export async function getPaymentsAuditLogAction() {
  try {
    const session = await getServerAuthSession();
    if (!session || !session.user) {
      throw new Error("Unauthorized");
    }

    const isSuperAdmin = session.user.role === Role.SUPER_ADMIN;

    // Fetch payments (Super Admin sees all; agent sees only their stationary's)
    const whereClause = isSuperAdmin ? {} : { agentId: session.user.id };

    const payments = await prisma.payment.findMany({
      where: whereClause,
      orderBy: { submittedAt: "desc" },
      include: {
        agent: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                stationaryName: true,
                phoneNumber: true,
                city: true,
              },
            },
          },
        },
        application: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            isPaid: true,
            isFilled: true,
          },
        },
      },
    });

    // Resolve pre-signed URLs for receipt photos in parallel
    const paymentsWithSignedUrls = await Promise.all(
      payments.map(async (p: any) => {
        let signedUrl = "";
        if (p.receiptPhotoUrl) {
          try {
            signedUrl = await getSignedReadUrl(p.receiptPhotoUrl, 7200);
          } catch {
            signedUrl = "";
          }
        }

        return {
          id: p.id,
          agentId: p.agentId,
          transactionId: p.transactionId,
          amount: p.amount,
          bankName: p.bankName,
          status: p.status,
          receiptPhotoUrl: p.receiptPhotoUrl,
          receiptSignedUrl: signedUrl,
          senderName: p.senderName,
          submittedAt: p.submittedAt.toISOString(),
          verifiedAt: p.verifiedAt ? p.verifiedAt.toISOString() : null,
          applicationId: p.applicationId,
          application: p.application
            ? {
                id: p.application.id,
                entrantName: `${p.application.firstName || ""} ${p.application.lastName || ""}`.trim(),
                isPaid: p.application.isPaid,
                isFilled: p.application.isFilled,
              }
            : null,
          agent: {
            id: p.agent?.id || p.agentId,
            username: p.agent?.username || "agent",
            stationaryName:
              p.agent?.profile?.stationaryName || p.senderName || p.agent?.username || "Stationary",
            phoneNumber: p.agent?.profile?.phoneNumber || "",
          },
        };
      })
    );

    return {
      success: true,
      payments: paymentsWithSignedUrls,
    };
  } catch (error: any) {
    console.error("[getPaymentsAuditLogAction] Error:", error);
    return {
      success: false,
      error: error.message || "Failed to retrieve payment audit logs",
      payments: [],
    };
  }
}
