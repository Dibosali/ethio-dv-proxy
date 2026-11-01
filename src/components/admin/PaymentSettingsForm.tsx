"use client";

import React, { useState, useEffect } from "react";
import { useAdmin } from "@/context/AdminContext";
import {
  CreditCard,
  Building2,
  Smartphone,
  Save,
  CheckCircle2,
  AlertCircle,
  Coins,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const PaymentSettingsForm: React.FC<{ className?: string }> = ({
  className,
}) => {
  const { paymentSettings, updatePaymentSettings } = useAdmin();

  const [feePerForm, setFeePerForm] = useState<number>(paymentSettings.feePerForm || 200);
  const [cbeAccountNumber, setCbeAccountNumber] = useState<string>(
    paymentSettings.cbeAccountNumber || ""
  );
  const [cbeAccountName, setCbeAccountName] = useState<string>(
    paymentSettings.cbeAccountName || ""
  );
  const [telebirrPhone, setTelebirrPhone] = useState<string>(
    paymentSettings.telebirrPhone || ""
  );
  const [telebirrName, setTelebirrName] = useState<string>(
    paymentSettings.telebirrName || ""
  );
  const [paymentNotice, setPaymentNotice] = useState<string>(
    paymentSettings.paymentNotice || ""
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Sync state if context loads from Neon DB
  useEffect(() => {
    if (paymentSettings) {
      setFeePerForm(paymentSettings.feePerForm);
      setCbeAccountNumber(paymentSettings.cbeAccountNumber);
      setCbeAccountName(paymentSettings.cbeAccountName);
      setTelebirrPhone(paymentSettings.telebirrPhone);
      setTelebirrName(paymentSettings.telebirrName);
      setPaymentNotice(paymentSettings.paymentNotice || "");
    }
  }, [paymentSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (feePerForm <= 0) {
      setError("Fee per form must be greater than 0 ETB.");
      return;
    }

    if (!cbeAccountNumber.trim()) {
      setError("Please provide a valid CBE account number.");
      return;
    }

    if (!telebirrPhone.trim()) {
      setError("Please provide a valid Telebirr phone or merchant ID.");
      return;
    }

    setLoading(true);
    try {
      const ok = await updatePaymentSettings({
        feePerForm: Number(feePerForm),
        cbeAccountNumber: cbeAccountNumber.trim(),
        cbeAccountName: cbeAccountName.trim(),
        telebirrPhone: telebirrPhone.trim(),
        telebirrName: telebirrName.trim(),
        paymentNotice: paymentNotice.trim(),
      });

      if (ok) {
        setSuccess("Payment configuration successfully updated in Neon database!");
      } else {
        setError("Failed to update payment settings. Please check your privileges.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to save payment configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 sm:p-6 space-y-5 shadow-xl",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
              Stationary Billing & Pricing Configuration
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Set form submission fees, CBE bank account, and Telebirr recipient credentials
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          Neon Remote Sync
        </span>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-700 dark:text-rose-300 animate-fadeIn">
          <AlertCircle className="h-4 w-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 p-3 text-xs text-emerald-700 dark:text-emerald-300 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Pricing Fee Per Form */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Coins className="h-3.5 w-3.5 text-amber-500" />
          Filing Fee Per Form (ETB)
        </label>
        <div className="relative">
          <input
            type="number"
            min="10"
            step="10"
            value={feePerForm}
            onChange={(e) => setFeePerForm(Number(e.target.value))}
            placeholder="200"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            required
          />
          <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
            ETB / form
          </span>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500">
          Amount multiplied by each stationery&apos;s unpaid filled submissions to compute total owed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* CBE Configuration */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span>Commercial Bank of Ethiopia (CBE)</span>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">
              Account Number
            </label>
            <input
              type="text"
              value={cbeAccountNumber}
              onChange={(e) => setCbeAccountNumber(e.target.value)}
              placeholder="e.g. 1000123456789"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">
              Account Holder Name
            </label>
            <input
              type="text"
              value={cbeAccountName}
              onChange={(e) => setCbeAccountName(e.target.value)}
              placeholder="e.g. DV PROXY MANAGEMENT"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              required
            />
          </div>
        </div>

        {/* Telebirr Configuration */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Smartphone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Telebirr Mobile Payment</span>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">
              Phone Number / Merchant ID
            </label>
            <input
              type="text"
              value={telebirrPhone}
              onChange={(e) => setTelebirrPhone(e.target.value)}
              placeholder="e.g. +251 91 123 4567"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">
              Recipient Name
            </label>
            <input
              type="text"
              value={telebirrName}
              onChange={(e) => setTelebirrName(e.target.value)}
              placeholder="e.g. DV PROXY SERVICES"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>
        </div>
      </div>

      {/* Payment Notice / Remarks */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-blue-500" />
          Transfer Remark / Notice for Stationaries
        </label>
        <textarea
          rows={2}
          value={paymentNotice}
          onChange={(e) => setPaymentNotice(e.target.value)}
          placeholder="e.g. Please put your shop username in the transfer remark."
          className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <p className="text-[10px] text-slate-400 dark:text-slate-500">
          This instruction is shown in the stationery&apos;s settlement modal and analytics dashboard.
        </p>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-500 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <>
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Saving to Neon...</span>
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              <span>Save Payment Settings</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};