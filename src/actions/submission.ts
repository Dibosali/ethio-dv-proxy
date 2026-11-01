"use server";

import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { Role, Gender, MaritalStatus, DerivativeType, PaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  DVFormPayload,
  ServerActionResponse,
  SubmissionConfirmationData,
  ReportPaymentDTO,
} from "@/types/admin";
import {
  uploadFileToB2,
  getSignedReadUrl,
  deleteFileFromB2,
} from "@/lib/backblaze";

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Gracefully handle calls outside active request store (e.g. CLI/tests)
  }
}

/**
 * Robust date parser converting various DOB formats ({month, day, year}, string, Date)
 * into a valid UTC Date instance for Neon PostgreSQL.
 */
function parseDateOfBirth(input: any): Date {
  if (input instanceof Date && !isNaN(input.getTime())) {
    return input;
  }
  if (typeof input === "string") {
    const d = new Date(input);
    if (!isNaN(d.getTime())) return d;
  }
  if (input && typeof input === "object") {
    const y = parseInt(String(input.year), 10);
    const m = parseInt(String(input.month), 10);
    const d = parseInt(String(input.day), 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
    }
  }
  throw new Error(`Invalid birth date format: ${JSON.stringify(input)}`);
}

/**
 * Maps input string to Prisma Gender enum.
 */
function mapGender(gender: any): Gender {
  const normalized = String(gender || "").toUpperCase().trim();
  if (normalized === "FEMALE" || normalized === "F") {
    return Gender.FEMALE;
  }
  return Gender.MALE;
}

/**
 * Maps input string to Prisma MaritalStatus enum.
 */
function mapMaritalStatus(status: any): MaritalStatus {
  const normalized = String(status || "").toUpperCase().trim();
  switch (normalized) {
    case "MARRIED_NON_LPR":
      return MaritalStatus.MARRIED_NON_LPR;
    case "MARRIED_LPR":
      return MaritalStatus.MARRIED_LPR;
    case "DIVORCED":
      return MaritalStatus.DIVORCED;
    case "WIDOWED":
      return MaritalStatus.WIDOWED;
    case "LEGALLY_SEPARATED":
      return MaritalStatus.LEGALLY_SEPARATED;
    case "UNMARRIED":
    default:
      return MaritalStatus.UNMARRIED;
  }
}

const DEFAULT_AVATAR_URL =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=600&q=80";

/**
 * Core transactional execution to insert Primary Entrant Application and all Derivatives.
 */
export async function executeSubmitDVApplication(
  data: DVFormPayload,
  agentId: string
): Promise<ServerActionResponse<SubmissionConfirmationData>> {
  const primary = data.primaryEntrant;
  if (!primary || !primary.name || !primary.name.lastName) {
    return {
      success: false,
      error: "Primary Entrant information with a valid Last Name is strictly required.",
    };
  }

  // Verify that the submitting agent user exists in Neon database
  const agentExists = await prisma.user.findUnique({
    where: { id: agentId },
    include: { profile: true },
  });

  if (!agentExists) {
    return {
      success: false,
      error: `Agent ID "${agentId}" does not exist in the database.`,
    };
  }

  try {
    // Execute atomic multi-table transaction on Neon PostgreSQL
    const result = await prisma.$transaction(async (tx) => {
      // 1. Insert Application (Primary Entrant)
      const application = await tx.application.create({
        data: {
          agentId,
          lastName: primary.name.lastName.toUpperCase().trim(),
          firstName: primary.name.noFirstName
            ? null
            : primary.name.firstName?.toUpperCase().trim() || null,
          middleName: primary.name.noMiddleName
            ? null
            : primary.name.middleName?.toUpperCase().trim() || null,
          gender: mapGender(primary.gender),
          birthDate: parseDateOfBirth(primary.dob),
          birthCity: primary.birthCityUnknown
            ? "UNKNOWN"
            : primary.birthCity?.trim() || "UNKNOWN",
          birthCountry: primary.birthCountry.trim(),
          eligibilityCountry:
            primary.countryOfEligibilitySame === "NO" &&
            primary.alternativeCountryOfEligibility?.trim()
              ? primary.alternativeCountryOfEligibility.trim()
              : primary.birthCountry.trim(),
          addressLine1: primary.mailingAddress.addressLine1.trim(),
          addressLine2: primary.mailingAddress.addressLine2?.trim() || null,
          city: primary.mailingAddress.city.trim(),
          state: primary.mailingAddress.districtStateCounty.trim(),
          zip: primary.mailingAddress.noPostalCode
            ? null
            : primary.mailingAddress.postalCode?.trim() || null,
          mailingCountry: primary.mailingAddress.country.trim(),
          currentCountry: primary.currentCountry.trim(),
          phone: primary.phoneNumber?.trim() || null,
          email: primary.email.trim().toLowerCase(),
          educationLevel: primary.educationLevel,
          maritalStatus: mapMaritalStatus(primary.maritalStatus),
          numberOfChildren:
            primary.numberOfChildren ?? (data.children?.length || 0),
          photoUrl: primary.photoUrl || DEFAULT_AVATAR_URL,
        },
      });

      // 2. Prepare derivatives list
      const derivativesToInsert = [];

      // Check spouse
      if (data.spouse && data.spouse.name && data.spouse.name.lastName) {
        derivativesToInsert.push({
          applicationId: application.id,
          type: DerivativeType.SPOUSE,
          lastName: data.spouse.name.lastName.toUpperCase().trim(),
          firstName: data.spouse.name.noFirstName
            ? null
            : data.spouse.name.firstName?.toUpperCase().trim() || null,
          middleName: data.spouse.name.noMiddleName
            ? null
            : data.spouse.name.middleName?.toUpperCase().trim() || null,
          gender: mapGender(data.spouse.gender),
          birthDate: parseDateOfBirth(data.spouse.dob),
          birthCity: data.spouse.birthCityUnknown
            ? "UNKNOWN"
            : data.spouse.birthCity?.trim() || "UNKNOWN",
          birthCountry: data.spouse.birthCountry.trim(),
          photoUrl: data.spouse.photoUrl || DEFAULT_AVATAR_URL,
        });
      }

      // Check children
      if (data.children && Array.isArray(data.children)) {
        for (const child of data.children) {
          if (child.name && child.name.lastName) {
            derivativesToInsert.push({
              applicationId: application.id,
              type: DerivativeType.CHILD,
              lastName: child.name.lastName.toUpperCase().trim(),
              firstName: child.name.noFirstName
                ? null
                : child.name.firstName?.toUpperCase().trim() || null,
              middleName: child.name.noMiddleName
                ? null
                : child.name.middleName?.toUpperCase().trim() || null,
              gender: mapGender(child.gender),
              birthDate: parseDateOfBirth(child.dob),
              birthCity: child.birthCityUnknown
                ? "UNKNOWN"
                : child.birthCity?.trim() || "UNKNOWN",
              birthCountry: child.birthCountry.trim(),
              photoUrl: child.photoUrl || DEFAULT_AVATAR_URL,
            });
          }
        }
      }

      // 3. Insert derivatives if any exist
      let createdDerivatives: any[] = [];
      if (derivativesToInsert.length > 0) {
        await tx.derivative.createMany({
          data: derivativesToInsert,
        });

        createdDerivatives = await tx.derivative.findMany({
          where: { applicationId: application.id },
          orderBy: { createdAt: "asc" },
        });
      }

      return { application, derivatives: createdDerivatives };
    });

    safeRevalidatePath("/admin");
    safeRevalidatePath("/admin/submissions");

    const confSuffix = result.application.id
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(-10)
      .toUpperCase();
    const confirmationNumber = `2026${confSuffix}`;

    const applicantFullName = [
      result.application.lastName,
      result.application.firstName,
      result.application.middleName,
    ]
      .filter(Boolean)
      .join(" ");

    return {
      success: true,
      data: {
        applicationId: result.application.id,
        confirmationNumber,
        applicantName: applicantFullName,
        agentId: result.application.agentId,
        submittedAt: result.application.createdAt.toISOString(),
        derivativesCount: result.derivatives.length,
        derivatives: result.derivatives.map((d) => ({
          id: d.id,
          type: d.type,
          name: [d.lastName, d.firstName, d.middleName]
            .filter(Boolean)
            .join(" "),
        })),
      },
      message:
        "Diversity Visa application registered successfully in Neon database!",
    };
  } catch (err: any) {
    console.error("Error executing submitDVApplication transaction:", err);
    return {
      success: false,
      error: err.message || "Failed to persist application into database.",
    };
  }
}

/**
 * Phase 3: Secure Server Action - submitDVApplication
 * Accepts multipart FormData or DVFormPayload.
 * Extracts textual JSON and photo File objects.
 * Uploads all photos concurrently to Backblaze B2 using Promise.all.
 * Persists Application and Derivatives in Prisma transaction, storing B2 file keys.
 */
export async function submitDVApplication(
  input: FormData | DVFormPayload
): Promise<ServerActionResponse<SubmissionConfirmationData>> {
  // Validate calling agent's session
  const session = await getServerAuthSession();

  if (!session || !session.user || !session.user.id) {
    return {
      success: false,
      error:
        "Unauthorized: You must be signed in with an active Proxy Agent account to submit applications.",
    };
  }

  const agentId = session.user.id;

  let payload: DVFormPayload;
  let primaryPhotoFile: File | null = null;
  let spousePhotoFile: File | null = null;
  const childrenPhotoFiles: (File | null)[] = [];

  if (input instanceof FormData) {
    const rawPayload =
      input.get("payload") || input.get("data") || input.get("formPayload");

    if (!rawPayload || typeof rawPayload !== "string") {
      return {
        success: false,
        error: "Missing textual 'payload' JSON in multipart form data.",
      };
    }

    try {
      payload = JSON.parse(rawPayload);
    } catch {
      return {
        success: false,
        error: "Invalid JSON format for submission payload.",
      };
    }

    // Extract File objects
    const pPhoto =
      input.get("primaryPhoto") ||
      input.get("primaryEntrantPhoto") ||
      input.get("photo");
    if (pPhoto instanceof File && pPhoto.size > 0) {
      primaryPhotoFile = pPhoto;
    }

    const sPhoto = input.get("spousePhoto");
    if (sPhoto instanceof File && sPhoto.size > 0) {
      spousePhotoFile = sPhoto;
    }

    if (payload.children && Array.isArray(payload.children)) {
      for (let i = 0; i < payload.children.length; i++) {
        const cPhoto =
          input.get(`childPhoto_${i}`) ||
          input.get(`child_${i}`) ||
          input.get(`childPhoto${i}`);
        childrenPhotoFiles.push(
          cPhoto instanceof File && cPhoto.size > 0 ? cPhoto : null
        );
      }
    }
  } else {
    payload = input;
  }

  // Keep track of uploaded keys for rollback on transaction failure
  const uploadedKeys: string[] = [];

  try {
    // 1. Prepare concurrent uploads to Backblaze B2 using Promise.all
    const uploadTasks: Promise<{ target: string; key: string }>[] = [];

    if (primaryPhotoFile) {
      uploadTasks.push(
        uploadFileToB2(primaryPhotoFile, agentId).then((key) => {
          uploadedKeys.push(key);
          return { target: "primary", key };
        })
      );
    }

    if (spousePhotoFile) {
      uploadTasks.push(
        uploadFileToB2(spousePhotoFile, agentId).then((key) => {
          uploadedKeys.push(key);
          return { target: "spouse", key };
        })
      );
    }

    childrenPhotoFiles.forEach((file, index) => {
      if (file) {
        uploadTasks.push(
          uploadFileToB2(file, agentId).then((key) => {
            uploadedKeys.push(key);
            return { target: `child_${index}`, key };
          })
        );
      }
    });

    if (uploadTasks.length > 0) {
      const uploadResults = await Promise.all(uploadTasks);

      const primaryRes = uploadResults.find((r) => r.target === "primary");
      if (primaryRes) {
        payload.primaryEntrant.photoUrl = primaryRes.key;
      }

      const spouseRes = uploadResults.find((r) => r.target === "spouse");
      if (spouseRes && payload.spouse) {
        payload.spouse.photoUrl = spouseRes.key;
      }

      uploadResults
        .filter((r) => r.target.startsWith("child_"))
        .forEach((r) => {
          const idx = parseInt(r.target.replace("child_", ""), 10);
          if (payload.children && payload.children[idx]) {
            payload.children[idx].photoUrl = r.key;
          }
        });
    }
  } catch (uploadError: any) {
    console.error("Backblaze B2 upload error:", uploadError);
    // Cleanup any partial uploads if one failed in Promise.all
    if (uploadedKeys.length > 0) {
      await Promise.allSettled(uploadedKeys.map((key) => deleteFileFromB2(key)));
    }
    return {
      success: false,
      error: `Cloud storage upload failed: ${
        uploadError.message || "Failed to upload photo to Backblaze B2"
      }. Application submission was aborted.`,
    };
  }

  // 2. Execute Prisma transaction to persist Application and Derivatives
  try {
    const result = await executeSubmitDVApplication(payload, agentId);

    if (!result.success) {
      // Clean up uploaded files in B2 if DB transaction was not successful
      if (uploadedKeys.length > 0) {
        await Promise.allSettled(
          uploadedKeys.map((key) => deleteFileFromB2(key))
        );
      }
      return result;
    }

    return result;
  } catch (dbError: any) {
    // Clean up uploaded files in B2 if DB transaction threw
    if (uploadedKeys.length > 0) {
      await Promise.allSettled(
        uploadedKeys.map((key) => deleteFileFromB2(key))
      );
    }
    throw dbError;
  }
}

/**
 * Super Admin Server Action: Retrieve all submissions from Neon database.
 * Generates pre-signed viewing URLs for private Backblaze B2 photos.
 */
export async function getSubmissions(): Promise<ServerActionResponse> {
  const session = await getServerAuthSession();

  if (!session || !session.user || session.user.role !== Role.SUPER_ADMIN) {
    return {
      success: false,
      error: "Unauthorized: Super Admin privileges required.",
    };
  }

  try {
    const apps = await prisma.application.findMany({
      include: {
        agent: {
          include: {
            profile: true,
          },
        },
        derivatives: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Resolve pre-signed URLs for private Backblaze B2 storage
    const signedApps = await Promise.all(
      apps.map(async (app) => {
        const signedPhotoUrl = await getSignedReadUrl(app.photoUrl);

        const spouse = app.derivatives.find(
          (d) => d.type === DerivativeType.SPOUSE
        );
        const signedSpousePhotoUrl = spouse
          ? await getSignedReadUrl(spouse.photoUrl)
          : undefined;

        const children = app.derivatives.filter(
          (d) => d.type === DerivativeType.CHILD
        );
        const signedChildrenPhotoUrls = await Promise.all(
          children.map((c) => getSignedReadUrl(c.photoUrl))
        );

        const signedDvPdfUrl = app.dvPdfUrl
          ? await getSignedReadUrl(app.dvPdfUrl, 7200)
          : undefined;

        return {
          id: app.id,
          confirmationNumber: `2026${app.id
            .replace(/[^a-zA-Z0-9]/g, "")
            .slice(-10)
            .toUpperCase()}`,
          applicantName: [app.lastName, app.firstName, app.middleName]
            .filter(Boolean)
            .join(" "),
          applicantFirstName: app.firstName || undefined,
          applicantLastName: app.lastName,
          stationaryName:
            app.agent.profile?.stationaryName || app.agent.username,
          agentId: app.agentId,
          agentUsername: app.agent.username,
          maritalStatus: app.maritalStatus,
          childrenCount: children.length,
          submittedAt: app.createdAt.toISOString(),
          status: "SUBMITTED",
          photoUrl: signedPhotoUrl,
          spousePhotoUrl: signedSpousePhotoUrl,
          childrenPhotoUrls: signedChildrenPhotoUrls,
          contactEmail: app.email,
          contactPhone: app.phone || undefined,
          isPaid: app.isPaid,
          isFilled: app.isFilled,
          paidAt: app.paidAt ? app.paidAt.toISOString() : undefined,
          paymentReference: app.paymentReference || undefined,
          paymentMethod: app.paymentMethod || undefined,
          paymentAmount: app.paymentAmount || undefined,
          receiptUrl: app.receiptUrl || undefined,
          receiptFileName: app.receiptFileName || undefined,
          dvPdfUrl: signedDvPdfUrl || app.dvPdfUrl || undefined,
          dvPdfFileName: app.dvPdfFileName || undefined,
          dvPdfUploadedAt: app.dvPdfUploadedAt ? app.dvPdfUploadedAt.toISOString() : undefined,
        };
      })
    );

    return {
      success: true,
      data: signedApps,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to fetch submissions from database.",
    };
  }
}

/**
 * Super Admin Server Action: Retrieve single submission with all derivatives.
 * Converts photoUrl file keys into temporary 1-hour pre-signed URLs.
 */
export async function getSubmissionById(
  id: string
): Promise<ServerActionResponse> {
  const session = await getServerAuthSession();

  if (!session || !session.user || session.user.role !== Role.SUPER_ADMIN) {
    return {
      success: false,
      error: "Unauthorized: Super Admin privileges required.",
    };
  }

  try {
    const app = await prisma.application.findUnique({
      where: { id },
      include: {
        agent: {
          include: {
            profile: true,
          },
        },
        derivatives: true,
      },
    });

    if (!app) {
      return {
        success: false,
        error: `Submission with ID "${id}" was not found.`,
      };
    }

    const signedAppPhoto = await getSignedReadUrl(app.photoUrl);
    const signedDerivatives = await Promise.all(
      app.derivatives.map(async (d) => ({
        ...d,
        photoUrl: await getSignedReadUrl(d.photoUrl),
      }))
    );

    return {
      success: true,
      data: {
        ...app,
        photoUrl: signedAppPhoto,
        derivatives: signedDerivatives,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to fetch submission details.",
    };
  }
}

/**
 * Phase 4: Server Action to generate a pre-signed viewing URL for any private photo key.
 */
export async function getSignedPhotoUrlAction(
  fileKey: string
): Promise<ServerActionResponse<string>> {
  const session = await getServerAuthSession();
  if (!session || !session.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const signedUrl = await getSignedReadUrl(fileKey);
    return { success: true, data: signedUrl };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to sign URL." };
  }
}

/**
 * Super Admin Server Action: Delete a submission.
 */
export async function deleteSubmission(
  id: string
): Promise<ServerActionResponse> {
  const session = await getServerAuthSession();

  if (!session || !session.user || session.user.role !== Role.SUPER_ADMIN) {
    return {
      success: false,
      error: "Unauthorized: Super Admin privileges required.",
    };
  }

  try {
    // Find application first to know the photo file keys
    const app = await prisma.application.findUnique({
      where: { id },
      include: { derivatives: true },
    });

    if (app) {
      // Clean up photos in Backblaze B2
      const keysToDelete = [
        app.photoUrl,
        ...app.derivatives.map((d) => d.photoUrl),
      ];
      await Promise.allSettled(
        keysToDelete.map((key) => deleteFileFromB2(key))
      );
    }

    await prisma.application.delete({
      where: { id },
    });

    safeRevalidatePath("/admin");
    safeRevalidatePath("/admin/submissions");

    return {
      success: true,
      message: "Submission deleted successfully.",
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to delete submission.",
    };
  }
}

/**
 * Stationary & Super Admin Action: Report / Confirm payment for a submission.
 */
export async function recordPaymentAction(
  data: ReportPaymentDTO
): Promise<ServerActionResponse<{
  applicationId: string;
  receiptNumber: string;
  paidAt: string;
  amount: number;
  paymentMethod: string;
  paymentReference: string;
  receiptUrl?: string | null;
  receiptFileName?: string | null;
}>> {
  const session = await getServerAuthSession();
  if (!session || !session.user) {
    return {
      success: false,
      error: "Unauthorized: You must be signed in to confirm payment.",
    };
  }

  if (!data.applicationId) {
    return { success: false, error: "Application ID is required." };
  }

  try {
    const app = await prisma.application.findUnique({
      where: { id: data.applicationId },
      include: { agent: true },
    });

    if (!app) {
      return { success: false, error: "Application submission not found." };
    }

    // Proxy agent can only pay for their own applications
    if (session.user.role === Role.PROXY_AGENT && app.agentId !== session.user.id) {
      return {
        success: false,
        error: "Forbidden: You cannot settle payments for another stationery's submissions.",
      };
    }

    // Check if receipt has already been uploaded for this submission
    if (app.isPaid && (app.receiptUrl || app.paymentReference)) {
      return {
        success: false,
        error: `Receipt has already been uploaded for applicant "${app.firstName || ""} ${app.lastName}". Re-uploading is not permitted.`,
      };
    }

    const now = new Date();
    const receiptNumber = `RCP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const cleanRef = data.paymentReference && data.paymentReference.trim().length > 0
      ? data.paymentReference.trim().toUpperCase()
      : (data.receiptFileName ? `RCP-${data.receiptFileName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toUpperCase()}` : receiptNumber);
    const cleanMethod = data.paymentMethod === "TELEBIRR" ? "TELEBIRR" : "CBE";
    const amount = Number(data.paymentAmount) || 200.0;
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: "Payment amount must be a positive number." };
    }

    // Attempt Backblaze B2 upload if base64 data URL provided
    let b2ReceiptKey: string | null = null;
    if (data.receiptUrl && data.receiptUrl.startsWith("data:")) {
      try {
        const matches = data.receiptUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches[2]) {
          const mimeType = matches[1];
          const buffer = Buffer.from(matches[2], "base64");
          const ext = mimeType.includes("pdf") ? "pdf" : "png";
          const fileName = data.receiptFileName || `receipt_${Date.now()}.${ext}`;

          const mockFile = {
            name: fileName,
            type: mimeType,
            size: buffer.length,
            arrayBuffer: async () =>
              buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
          } as unknown as File;

          b2ReceiptKey = await uploadFileToB2(mockFile, "receipts/");
        }
      } catch (b2Err) {
        console.warn("[recordPaymentAction] Backblaze B2 upload warning (retaining base64):", b2Err);
      }
    } else if (data.receiptUrl && !data.receiptUrl.startsWith("data:")) {
      b2ReceiptKey = data.receiptUrl;
    }

    const updated = await prisma.application.update({
      where: { id: data.applicationId },
      data: {
        isPaid: true,
        paidAt: now,
        paymentMethod: cleanMethod,
        paymentReference: cleanRef,
        paymentAmount: amount,
        receiptUrl: data.receiptUrl || b2ReceiptKey || null,
        receiptFileName: data.receiptFileName || null,
      },
    });

    // Record in Payment Audit Trail
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { profile: true },
      });
      const senderName =
        user?.profile?.stationaryName ||
        user?.username ||
        app.agent?.username ||
        "DV Proxy Agent";

      await prisma.payment.upsert({
        where: { transactionId: cleanRef },
        update: {
          status: PaymentStatus.VERIFIED,
          amount,
          bankName: cleanMethod,
          receiptPhotoUrl: b2ReceiptKey || data.receiptUrl || `uploads/receipts/${cleanRef}.jpg`,
          senderName,
          verifiedAt: now,
        },
        create: {
          agentId: session.user.id || app.agentId,
          applicationId: app.id,
          transactionId: cleanRef,
          amount,
          bankName: cleanMethod,
          status: PaymentStatus.VERIFIED,
          receiptPhotoUrl: b2ReceiptKey || data.receiptUrl || `uploads/receipts/${cleanRef}.jpg`,
          senderName,
          submittedAt: now,
          verifiedAt: now,
        },
      });
    } catch (auditErr) {
      console.warn("[recordPaymentAction] Payment audit table log error:", auditErr);
    }

    safeRevalidatePath("/");
    safeRevalidatePath("/analytics");
    safeRevalidatePath("/admin");
    safeRevalidatePath("/admin/submissions");

    return {
      success: true,
      message: `Payment of ${amount} ETB via ${cleanMethod} recorded successfully.`,
      data: {
        applicationId: updated.id,
        receiptNumber,
        paidAt: now.toISOString(),
        amount,
        paymentMethod: cleanMethod,
        paymentReference: cleanRef,
        receiptUrl: updated.receiptUrl,
        receiptFileName: updated.receiptFileName,
      },
    };
  } catch (err: any) {
    console.error("Error recording payment:", err);
    return {
      success: false,
      error: err.message || "Failed to record payment.",
    };
  }
}

/**
 * Super Admin Action: Toggle a submission's payment status.
 */
export async function toggleSubmissionPaidAction(
  applicationId: string,
  isPaid: boolean
): Promise<ServerActionResponse> {
  const session = await getServerAuthSession();
  if (!session || !session.user || session.user.role !== Role.SUPER_ADMIN) {
    return {
      success: false,
      error: "Unauthorized: Super Admin access required.",
    };
  }

  try {
    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        isPaid,
        ...(isPaid ? { paidAt: new Date() } : { paidAt: null, paymentReference: null }),
      },
    });

    safeRevalidatePath("/admin/submissions");
    safeRevalidatePath("/analytics");
    return {
      success: true,
      message: `Submission marked as ${isPaid ? "PAID" : "UNPAID"}.`,
      data: updated,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to update payment status.",
    };
  }
}

/**
 * Super Admin Action: Toggle a submission's filled status.
 */
export async function toggleSubmissionFilledAction(
  applicationId: string,
  isFilled: boolean
): Promise<ServerActionResponse> {
  const session = await getServerAuthSession();
  if (!session || !session.user || session.user.role !== Role.SUPER_ADMIN) {
    return {
      success: false,
      error: "Unauthorized: Super Admin access required.",
    };
  }

  try {
    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { isFilled },
    });

    safeRevalidatePath("/admin/submissions");
    safeRevalidatePath("/analytics");
    return {
      success: true,
      message: `Submission marked as ${isFilled ? "FILLED" : "UNFILLED"}.`,
      data: updated,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to update filled status.",
    };
  }
}

/**
 * Super Admin Action: Get all paid submissions log with financial audit details.
 */
export async function getPaidSubmissionsLogAction(): Promise<
  ServerActionResponse<
    Array<{
      id: string;
      confirmationNumber: string;
      entrantName: string;
      stationaryName: string;
      agentUsername: string;
      submittedAt: string;
      paidAt: string | null;
      paymentMethod: string;
      paymentReference: string;
      paymentAmount: number;
    }>
  >
> {
  const session = await getServerAuthSession();
  if (!session || !session.user || session.user.role !== Role.SUPER_ADMIN) {
    return {
      success: false,
      error: "Unauthorized: Super Admin access required.",
    };
  }

  try {
    const paidApps = await prisma.application.findMany({
      where: { isPaid: true },
      include: {
        agent: {
          include: { profile: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return {
      success: true,
      data: paidApps.map((app) => ({
        id: app.id,
        confirmationNumber: `2026${app.id.slice(-10).toUpperCase()}`,
        entrantName: `${app.lastName}, ${app.firstName || ""} ${app.middleName || ""}`.trim(),
        applicantFirstName: app.firstName || undefined,
        applicantLastName: app.lastName,
        stationaryName: app.agent.profile?.stationaryName || app.agent.username,
        agentUsername: app.agent.username,
        submittedAt: app.createdAt.toISOString(),
        paidAt: app.paidAt ? app.paidAt.toISOString() : app.updatedAt.toISOString(),
        paymentMethod: app.paymentMethod || "CBE",
        paymentReference: app.paymentReference || "MANUAL_VERIFIED",
        paymentAmount: app.paymentAmount || 200,
        receiptUrl: app.receiptUrl,
        receiptFileName: app.receiptFileName,
        dvPdfUrl: app.dvPdfUrl,
        dvPdfFileName: app.dvPdfFileName,
        dvPdfUploadedAt: app.dvPdfUploadedAt?.toISOString(),
      })),
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to fetch paid submissions log.",
    };
  }
}

/**
 * Super Admin Server Action: Uploads the official confirmation DV PDF for a paid submitted form.
 */
export async function uploadDvPdfAction(formData: FormData): Promise<{
  success: boolean;
  error?: string;
  data?: {
    dvPdfUrl: string;
    dvPdfFileName: string;
    dvPdfUploadedAt: string;
  };
}> {
  const session = await getServerAuthSession();
  if (!session || !session.user || session.user.role !== Role.SUPER_ADMIN) {
    return { success: false, error: "Unauthorized: Super Admin access required." };
  }

  const applicationId = formData.get("applicationId") as string;
  const pdfFile = formData.get("dvPdfFile") as File | null;

  if (!applicationId) {
    return { success: false, error: "Missing required applicationId." };
  }

  if (!pdfFile || pdfFile.size === 0) {
    return { success: false, error: "Please select a valid DV confirmation PDF file to upload." };
  }

  try {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!app) {
      return { success: false, error: "Submission record not found." };
    }

    // Upload DV PDF to Backblaze B2 under 'dv-confirmations/'
    let fileKey: string;
    try {
      fileKey = await uploadFileToB2(pdfFile, "dv-confirmations/");
    } catch (uploadErr: any) {
      console.warn("B2 upload error, using local fallback key:", uploadErr?.message);
      fileKey = `uploads/dv-confirmations/${crypto.randomUUID()}-${pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    }

    const now = new Date();
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        dvPdfUrl: fileKey,
        dvPdfFileName: pdfFile.name,
        dvPdfUploadedAt: now,
        isFilled: true, // Marking as filled when official DV PDF is uploaded
      },
    });

    safeRevalidatePath("/");
    safeRevalidatePath("/admin");
    safeRevalidatePath("/admin/submissions");
    safeRevalidatePath("/analytics");

    const signedUrl = await getSignedReadUrl(fileKey, 7200);

    return {
      success: true,
      data: {
        dvPdfUrl: signedUrl || fileKey,
        dvPdfFileName: pdfFile.name,
        dvPdfUploadedAt: now.toISOString(),
      },
    };
  } catch (err: any) {
    console.error("[uploadDvPdfAction] Error:", err);
    return { success: false, error: err?.message || "Failed to upload DV confirmation PDF." };
  }
}

/**
 * Super Admin Server Action: Remove/delete a previously uploaded DV PDF for a submission.
 */
export async function deleteDvPdfAction(applicationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await getServerAuthSession();
  if (!session || !session.user || session.user.role !== Role.SUPER_ADMIN) {
    return { success: false, error: "Unauthorized: Super Admin access required." };
  }

  try {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!app || !app.dvPdfUrl) {
      return { success: false, error: "No DV PDF found for this submission." };
    }

    await deleteFileFromB2(app.dvPdfUrl);

    await prisma.application.update({
      where: { id: applicationId },
      data: {
        dvPdfUrl: null,
        dvPdfFileName: null,
        dvPdfUploadedAt: null,
      },
    });

    safeRevalidatePath("/");
    safeRevalidatePath("/admin");
    safeRevalidatePath("/admin/submissions");
    safeRevalidatePath("/analytics");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to delete DV PDF." };
  }
}

