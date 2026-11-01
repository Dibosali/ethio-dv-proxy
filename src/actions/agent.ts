"use server";

import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CreateAgentDTO, UpdateAgentDTO, ServerActionResponse } from "@/types/admin";

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Gracefully handle calls outside active request store (e.g. CLI/tests)
  }
}

export const createAgentDTOSchema = z.object({
  username: z
    .string({ required_error: "Username is required" })
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username cannot exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain alphanumeric characters, underscores, and dashes"
    ),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters long"),
  stationaryName: z
    .string({ required_error: "Stationary Name is required" })
    .trim()
    .min(2, "Stationary / business name must be at least 2 characters")
    .max(100, "Stationary name cannot exceed 100 characters"),
  phoneNumber: z
    .string({ required_error: "Phone Number is required" })
    .trim()
    .min(7, "Phone number must be at least 7 characters")
    .max(30, "Phone number cannot exceed 30 characters"),
  city: z.string().trim().optional(),
  subCityDistrict: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

/**
 * Core transactional logic to create a Proxy Agent User and Profile simultaneously.
 */
export async function executeCreateProxyAgent(
  data: CreateAgentDTO
): Promise<
  ServerActionResponse<{
    id: string;
    username: string;
    role: Role;
    createdAt: string;
    profile: {
      id: string;
      stationaryName: string;
      phoneNumber: string;
      isActive: boolean;
    };
  }>
> {
  // 1. Validate payload schema
  const validationResult = createAgentDTOSchema.safeParse(data);
  if (!validationResult.success) {
    const firstError =
      validationResult.error.errors[0]?.message || "Invalid input data";
    return { success: false, error: firstError };
  }

  const validData = validationResult.data;
  const normalizedUsername = validData.username.toLowerCase().trim();

  // 2. Uniqueness check for username
  const existingUser = await prisma.user.findUnique({
    where: { username: normalizedUsername },
  });
  if (existingUser) {
    return {
      success: false,
      error: `Username "${normalizedUsername}" is already taken. Please choose another username.`,
    };
  }

  // 3. Hash plain-text password using bcrypt.hash
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(validData.password, saltRounds);

  try {
    // 4. Execute atomic transaction creating User and Profile simultaneously
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: normalizedUsername,
          passwordHash,
          role: Role.PROXY_AGENT,
        },
      });

      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          stationaryName: validData.stationaryName,
          phoneNumber: validData.phoneNumber,
          isActive: true,
        },
      });

      return { user, profile };
    });

    safeRevalidatePath("/admin");
    safeRevalidatePath("/admin/agents");

    return {
      success: true,
      data: {
        id: result.user.id,
        username: result.user.username,
        role: result.user.role,
        createdAt: result.user.createdAt.toISOString(),
        profile: {
          id: result.profile.id,
          stationaryName: result.profile.stationaryName,
          phoneNumber: result.profile.phoneNumber,
          isActive: result.profile.isActive,
        },
      },
      message: `Proxy Agent "${validData.stationaryName}" provisioned successfully.`,
    };
  } catch (err: any) {
    console.error("Error creating proxy agent in $transaction:", err);
    if (err.code === "P2002") {
      return {
        success: false,
        error: "A user with this username already exists.",
      };
    }
    return {
      success: false,
      error: err.message || "Failed to create proxy agent in database.",
    };
  }
}

/**
 * Phase 3: Secure Super Admin Server Action - createProxyAgent
 * Validates SUPER_ADMIN session, hashes password, executes transaction.
 */
export async function createProxyAgent(
  data: CreateAgentDTO
): Promise<ServerActionResponse> {
  // Validate that the user invoking the action has the SUPER_ADMIN session role
  const session = await getServerAuthSession();

  if (!session || !session.user) {
    return {
      success: false,
      error: "Unauthorized: You must be signed in to perform this action.",
    };
  }

  if (session.user.role !== Role.SUPER_ADMIN) {
    return {
      success: false,
      error: "Forbidden: Super Admin privileges are required to create proxy agents.",
    };
  }

  return await executeCreateProxyAgent(data);
}

/**
 * Super Admin Server Action: Fetch all proxy agents with profiles and submission counts.
 */
export async function getProxyAgents(): Promise<ServerActionResponse> {
  const session = await getServerAuthSession();

  if (!session || !session.user || session.user.role !== Role.SUPER_ADMIN) {
    return {
      success: false,
      error: "Unauthorized: Super Admin access required.",
    };
  }

  try {
    const agents = await prisma.user.findMany({
      where: { role: Role.PROXY_AGENT },
      include: {
        profile: true,
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: agents.map((a) => ({
        id: a.id,
        username: a.username,
        role: a.role,
        createdAt: a.createdAt.toISOString(),
        isActive: a.profile?.isActive ?? true,
        totalSubmissions: a._count.applications,
        profile: {
          stationaryName: a.profile?.stationaryName || a.username,
          phoneNumber: a.profile?.phoneNumber || "",
          city: a.profile?.city || "Addis Ababa",
          subCityDistrict: a.profile?.subCityDistrict || "",
          notes: a.profile?.notes || "",
        },
      })),
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to fetch proxy agents.",
    };
  }
}

/**
 * Super Admin Server Action: Update an existing proxy agent's account details.
 */
export async function updateProxyAgent(
  data: UpdateAgentDTO
): Promise<ServerActionResponse> {
  const session = await getServerAuthSession();

  if (!session || !session.user || session.user.role !== Role.SUPER_ADMIN) {
    return {
      success: false,
      error: "Unauthorized: Super Admin access required to edit stationery accounts.",
    };
  }

  if (!data.id) {
    return { success: false, error: "Agent ID is required." };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: data.id },
      include: { profile: true },
    });

    if (!existingUser) {
      return { success: false, error: "Proxy agent account not found." };
    }

    // Check username uniqueness if changed
    let updatedUsername = existingUser.username;
    if (data.username && data.username.toLowerCase().trim() !== existingUser.username) {
      const normalizedNew = data.username.toLowerCase().trim();
      const conflict = await prisma.user.findUnique({
        where: { username: normalizedNew },
      });
      if (conflict && conflict.id !== data.id) {
        return {
          success: false,
          error: `Username "${normalizedNew}" is already taken by another account.`,
        };
      }
      updatedUsername = normalizedNew;
    }

    // Hash new password if provided
    let newPasswordHash: string | undefined = undefined;
    if (data.password && data.password.trim().length > 0) {
      if (data.password.trim().length < 8) {
        return {
          success: false,
          error: "Password must be at least 8 characters long.",
        };
      }
      newPasswordHash = await bcrypt.hash(data.password.trim(), 12);
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update User model (username and/or password)
      await tx.user.update({
        where: { id: data.id },
        data: {
          username: updatedUsername,
          ...(newPasswordHash && { passwordHash: newPasswordHash }),
        },
      });

      // 2. Update Profile model
      await tx.profile.upsert({
        where: { userId: data.id },
        create: {
          userId: data.id,
          stationaryName: data.stationaryName || existingUser.username,
          phoneNumber: data.phoneNumber || "",
          city: data.city || "Addis Ababa",
          subCityDistrict: data.subCityDistrict || "",
          notes: data.notes || "",
          isActive: data.isActive ?? true,
        },
        update: {
          ...(data.stationaryName && { stationaryName: data.stationaryName }),
          ...(data.phoneNumber && { phoneNumber: data.phoneNumber }),
          ...(data.city !== undefined && { city: data.city }),
          ...(data.subCityDistrict !== undefined && { subCityDistrict: data.subCityDistrict }),
          ...(data.notes !== undefined && { notes: data.notes }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      });
    });

    safeRevalidatePath("/admin/agents");
    return {
      success: true,
      message: `Stationery "${data.stationaryName || updatedUsername}" updated successfully.`,
    };
  } catch (err: any) {
    console.error("Error updating proxy agent:", err);
    return {
      success: false,
      error: err.message || "Failed to update proxy agent.",
    };
  }
}

/**
 * Super Admin Server Action: Toggle an agent's active status.
 */
export async function toggleAgentStatus(
  agentId: string,
  isActive: boolean
): Promise<ServerActionResponse> {
  const session = await getServerAuthSession();

  if (!session || !session.user || session.user.role !== Role.SUPER_ADMIN) {
    return {
      success: false,
      error: "Unauthorized: Super Admin access required.",
    };
  }

  try {
    const updated = await prisma.profile.update({
      where: { userId: agentId },
      data: { isActive },
    });

    safeRevalidatePath("/admin/agents");
    return {
      success: true,
      data: updated,
      message: `Agent status updated to ${isActive ? "active" : "inactive"}.`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to toggle agent status.",
    };
  }
}

/**
 * Super Admin Server Action: Delete a proxy agent.
 */
export async function deleteProxyAgent(
  agentId: string
): Promise<ServerActionResponse> {
  const session = await getServerAuthSession();

  if (!session || !session.user || session.user.role !== Role.SUPER_ADMIN) {
    return {
      success: false,
      error: "Unauthorized: Super Admin access required.",
    };
  }

  try {
    await prisma.user.delete({
      where: { id: agentId },
    });

    safeRevalidatePath("/admin/agents");
    return {
      success: true,
      message: "Proxy agent deleted successfully.",
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to delete agent.",
    };
  }
}

/**
 * Super Admin Server Action: Change Super Admin account password.
 */
export async function changeAdminPassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<ServerActionResponse> {
  const session = await getServerAuthSession();

  if (!session || !session.user || session.user.role !== Role.SUPER_ADMIN) {
    return {
      success: false,
      error: "Unauthorized: Super Admin privileges required.",
    };
  }

  if (!data.newPassword || data.newPassword.length < 8) {
    return {
      success: false,
      error: "New password must be at least 8 characters long.",
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return {
        success: false,
        error: "Super Admin account was not found in the database.",
      };
    }

    const isMatch = await bcrypt.compare(
      data.currentPassword,
      user.passwordHash
    );
    if (!isMatch) {
      return {
        success: false,
        error: "Current password does not match records.",
      };
    }

    const newHash = await bcrypt.hash(data.newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return {
      success: true,
      message: "Password changed successfully! Keep your credentials safe.",
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to change admin password.",
    };
  }
}
