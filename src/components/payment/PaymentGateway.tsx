"use client";

import React, { useState, useRef } from "react";
import {
  CreditCard,
  Building2,
  Smartphone,
  UploadCloud,
  FileCheck2,
  AlertCircle,
  Loader2,
  CheckCircle2,
  X,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Eye,
} from "lucide-react";
import { processPaymentAndVerify, PaymentProcessResult } from "@/actions/payment";
import { BankType } from "@/lib/verifier";
import { cn } from "@/lib/utils";

interface PaymentGatewayProps {
  applicationId?: string;
  defaultAmount?: number;
  stationaryName?: string;
  onSuccess?: (result: PaymentProcessResult) => void;
  onCancel?: () => void;
  className?: string;
}

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  applicationId,
  defaultAmount = 200,
  stationaryName,
  onSuccess,
  onCancel,
  className,
}) => {
  const [bank, setBank] = useState<BankType>("CBE");
  const [transactionId, setTransactionId] = useState("");
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PaymentProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isViewingPreview, setIsViewingPreview] = useState(false);

  const handleBankChange = (newBank: BankType) => {
    setBank(newBank);
    setError(null);
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image receipt file (JPG, PNG, or WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Receipt image size must be under 10MB.");
      return;
    }

    setReceiptFile(file);
    setError(null);

    if (receiptPreview && receiptPreview.startsWith("blob:")) {
      URL.revokeObjectURL(receiptPreview);
    }
    const previewUrl = URL.createObjectURL(file);
    setReceiptPreview(previewUrl);
  };

  const removeFile = () => {
    setReceiptFile(null);
    if (receiptPreview && receiptPreview.startsWith("blob:")) {
      URL.revokeObjectURL(receiptPreview);
    }
    setReceiptPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const cleanTxId = transactionId.trim().toUpperCase();
    if (!cleanTxId) {
      setError("Please enter the transaction reference / ID.");
      return;
    }

    if (!receiptFile) {
      setError("Please upload the transaction receipt photo for verification and audit.");
      return;
    }

    if (amount <= 0 || isNaN(amount)) {
      setError("Please specify a valid payment amount.");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("bankName", bank);
      formData.append("transactionId", cleanTxId);
      formData.append("expectedAmount", amount.toString());
      formData.append("receiptFile", receiptFile);
      if (applicationId) {
        formData.append("applicationId", applicationId);
      }

      const res = await processPaymentAndVerify(formData);
      setResult(res);

      if (res.success) {
        if (onSuccess) {
          onSuccess(res);
        }
      } else {
        setError(res.message || "Payment verification failed. Please review your details.");
      }
    } catch (err: any) {
      console.error("[PaymentGateway] Submission error:", err);
      setError(err?.message || "Failed to communicate with payment verifier.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 p-5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md border border-white/20">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Secure Bank Payment Gateway
              </h3>
              <p className="text-xs text-blue-100">
                Direct Ethiopian Bank Receipt Verification & Audit
              </p>
            </div>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Verification Success State */}
        {result?.success ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Payment Verified & Logged!
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              {result.message}
            </p>
            <div className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              <span>TxID: {result.transactionId}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">• VERIFIED</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-50 dark:bg-red-950/30 p-3.5 text-xs text-red-600 dark:text-red-400 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">{error}</p>
                  {result && !result.success && (
                    <p className="text-[11px] text-red-500/90 dark:text-red-400/80">
                      Audit Record: Stored with status <span className="font-mono font-bold">FAILED</span> for Super Admin review.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Bank Channel Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                1. Select Banking Channel (ባንክ ይምረጡ)
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {/* CBE */}
                <button
                  type="button"
                  onClick={() => handleBankChange("CBE")}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all",
                    bank === "CBE"
                      ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/30 font-bold"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                  )}
                >
                  <Building2 className="h-5 w-5 mb-1 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-bold">CBE</span>
                  <span className="text-[10px] opacity-75">ንግድ ባንክ</span>
                </button>

                {/* Telebirr */}
                <button
                  type="button"
                  onClick={() => handleBankChange("TELEBIRR")}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all",
                    bank === "TELEBIRR"
                      ? "border-sky-500 bg-sky-50/70 dark:bg-sky-950/30 text-sky-900 dark:text-sky-200 ring-2 ring-sky-500/30 font-bold"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                  )}
                >
                  <Smartphone className="h-5 w-5 mb-1 text-sky-600 dark:text-sky-400" />
                  <span className="text-xs font-bold">telebirr</span>
                  <span className="text-[10px] opacity-75">ቴሌብር</span>
                </button>

                {/* BOA */}
                <button
                  type="button"
                  onClick={() => handleBankChange("BOA")}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all",
                    bank === "BOA"
                      ? "border-orange-500 bg-orange-50/70 dark:bg-orange-950/30 text-orange-900 dark:text-orange-200 ring-2 ring-orange-500/30 font-bold"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                  )}
                >
                  <CreditCard className="h-5 w-5 mb-1 text-orange-600 dark:text-orange-400" />
                  <span className="text-xs font-bold">BOA</span>
                  <span className="text-[10px] opacity-75">አቢሲኒያ</span>
                </button>
              </div>
            </div>

            {/* Transaction ID & Amount Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Transaction ID */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Transaction Reference / ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                  placeholder={
                    bank === "CBE"
                      ? "e.g. FT26105XXXXX"
                      : bank === "TELEBIRR"
                      ? "e.g. 8GH902123"
                      : "e.g. BOA reference"
                  }
                  required
                  disabled={isLoading}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase placeholder:font-sans placeholder:font-normal placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Reference code from your SMS or banking app confirmation.
                </p>
              </div>

              {/* Expected Amount */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Settlement Amount (ETB) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    min={1}
                    step="0.01"
                    required
                    disabled={isLoading}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-bold text-slate-400">
                    ETB
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Total required per entrant form.
                </p>
              </div>
            </div>

            {/* Receipt File Upload */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Payment Receipt Photo / Screenshot <span className="text-red-500">*</span>
              </label>

              {!receiptPreview ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileChange(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all",
                    isDragging
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  )}
                >
                  <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Click to upload or drag & drop receipt screenshot
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    JPG, PNG or WebP (max 10MB) — Uploaded securely to Backblaze B2
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={receiptPreview}
                      alt="Receipt Preview"
                      className="h-12 w-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer"
                      onClick={() => setIsViewingPreview(true)}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {receiptFile?.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {((receiptFile?.size || 0) / 1024).toFixed(1)} KB • Ready for verification
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsViewingPreview(true)}
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Inspect preview"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Stationary Identity Stamp */}
            {stationaryName && (
              <div className="rounded-xl border border-blue-500/20 bg-blue-50/40 dark:bg-blue-950/20 px-3.5 py-2 text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>Submitting Stationary:</span>
                <span className="font-bold text-blue-700 dark:text-blue-300">
                  {stationaryName}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying with Bank & Uploading...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Verify & Confirm Payment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Lightbox / Preview Modal */}
      {isViewingPreview && receiptPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setIsViewingPreview(false)}
        >
          <div
            className="relative max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-800 shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsViewingPreview(false)}
              className="absolute top-4 right-4 z-10 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={receiptPreview}
              alt="Receipt Full Preview"
              className="max-h-[80vh] w-auto mx-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
