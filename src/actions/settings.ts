"use server";

import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { Role } from "@prisma/client";
import {
  PaymentSettings,
  UpdatePaymentSettingsDTO,
  ServerActionResponse,
} from "@/types/admin";

const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  feePerForm: 200,
  currency: "ETB",
  cbeAccountNumber: "1000123456789",
  cbeAccountName: "DV PROXY MANAGEMENT SERVICES",
  telebirrPhone: "+251 91 123 4567",
  telebirrName: "DV PROXY SERVICES",
  paymentNotice: "Please include your shop username or Entrant Confirmation Number in the transfer remark.",
};

export async function getPaymentSettingsAction(): Promise<
  ServerActionResponse<PaymentSettings>
> {
  try {
    const config = await prisma.paymentConfig.findUnique({
      where: { id: "default" },
    });

    if (!config) {
      return {
        success: true,
        data: DEFAULT_PAYMENT_SETTINGS,
      };
    }

    return {
      success: true,
      data: {
        feePerForm: config.feePerForm,
        currency: "ETB",
        cbeAccountNumber: config.cbeAccountNumber,
        cbeAccountName: config.cbeAccountName,
        telebirrPhone: config.telebirrPhone,
        telebirrName: config.telebirrName,
        paymentNotice: config.paymentNotice,
        updatedAt: config.updatedAt.toISOString(),
      },
    };
  } catch (error: any) {
    console.error("Error fetching payment settings from Neon DB:", error);
    return {
      success: true,
      data: DEFAULT_PAYMENT_SETTINGS,
    };
  }
}

export async function updatePaymentSettingsAction(
  data: UpdatePaymentSettingsDTO
): Promise<ServerActionResponse<PaymentSettings>> {
  try {
    const session = await getServerAuthSession();

    // Verify Super Admin permission
    if (session && session.user.role !== Role.SUPER_ADMIN) {
      return {
        success: false,
        error: "Unauthorized: Only Super Admins can configure payment and pricing rules.",
      };
    }

    const updated = await prisma.paymentConfig.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        feePerForm: data.feePerForm ?? DEFAULT_PAYMENT_SETTINGS.feePerForm,
        cbeAccountNumber: data.cbeAccountNumber ?? DEFAULT_PAYMENT_SETTINGS.cbeAccountNumber,
        cbeAccountName: data.cbeAccountName ?? DEFAULT_PAYMENT_SETTINGS.cbeAccountName,
        telebirrPhone: data.telebirrPhone ?? DEFAULT_PAYMENT_SETTINGS.telebirrPhone,
        telebirrName: data.telebirrName ?? DEFAULT_PAYMENT_SETTINGS.telebirrName,
        paymentNotice: data.paymentNotice ?? DEFAULT_PAYMENT_SETTINGS.paymentNotice,
      },
      update: {
        ...(data.feePerForm !== undefined && { feePerForm: data.feePerForm }),
        ...(data.cbeAccountNumber && { cbeAccountNumber: data.cbeAccountNumber }),
        ...(data.cbeAccountName && { cbeAccountName: data.cbeAccountName }),
        ...(data.telebirrPhone && { telebirrPhone: data.telebirrPhone }),
        ...(data.telebirrName && { telebirrName: data.telebirrName }),
        ...(data.paymentNotice && { paymentNotice: data.paymentNotice }),
      },
    });

    return {
      success: true,
      message: "Payment settings saved successfully to Neon Database!",
      data: {
        feePerForm: updated.feePerForm,
        currency: "ETB",
        cbeAccountNumber: updated.cbeAccountNumber,
        cbeAccountName: updated.cbeAccountName,
        telebirrPhone: updated.telebirrPhone,
        telebirrName: updated.telebirrName,
        paymentNotice: updated.paymentNotice,
        updatedAt: updated.updatedAt.toISOString(),
      },
    };
  } catch (error: any) {
    console.error("Error updating payment settings:", error);
    return {
      success: false,
      error: error.message || "Failed to update payment settings",
    };
  }
}
