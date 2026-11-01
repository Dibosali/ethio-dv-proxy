"use client";

import React, { useState, useRef, useEffect } from "react";
import { SubmissionSummary } from "@/types/admin";
import { useAdmin } from "@/context/AdminContext";
import {
  X,
  CreditCard,
  Building2,
  Smartphone,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Printer,
  ShieldCheck,
  UploadCloud,
  FileUp,
  Image as ImageIcon,
  Trash2,
  FileText,
  Eye,
  ExternalLink,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadDvConfirmationSlip, downloadOfficialDvPdf } from "@/lib/utils/dvSlip";

interface StationaryPaymentModalProps {
  submission: SubmissionSummary | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

export const StationaryPaymentModal: React.FC<StationaryPaymentModalProps> = ({
  submission,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const { paymentSettings, recordSubmissionPayment } = useAdmin();

  const fee = paymentSettings.feePerForm || 200;
  const [paymentMethod, setPaymentMethod] = useState<"CBE" | "TELEBIRR">("CBE");
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Receipt File & Preview State
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fullsize receipt image modal/lightbox view
  const [isViewingFullReceipt, setIsViewingFullReceipt] = useState(false);

  // Receipt state after payment confirmation
  const [receiptData, setReceiptData] = useState<{
    receiptNumber: string;
    paidAt: string;
    amount: number;
    paymentMethod: string;
    paymentReference: string;
    entrantName: string;
    confirmationNumber: string;
    stationaryName: string;
    receiptUrl?: string | null;
    receiptFileName?: string | null;
  } | null>(null);

  // Helper to remove selected file and clean up object URL
  const handleRemoveFile = () => {
    setReceiptFile(null);
    if (receiptPreview && receiptPreview.startsWith("blob:")) {
      URL.revokeObjectURL(receiptPreview);
    }
    setReceiptPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // If already paid, automatically load receipt view
  useEffect(() => {
    if (submission && submission.isPaid) {
      setReceiptData({
        receiptNumber: submission.paymentReference
          ? `RCP-${submission.paymentReference.slice(-6).toUpperCase()}`
          : `RCP-${submission.id.slice(-6).toUpperCase()}`,
        paidAt: submission.paidAt || new Date().toISOString(),
        amount: submission.paymentAmount || fee,
        paymentMethod: submission.paymentMethod || "CBE",
        paymentReference: submission.paymentReference || "CONFIRMED",
        entrantName: submission.applicantName,
        confirmationNumber: submission.confirmationNumber,
        stationaryName: submission.stationaryName,
        receiptUrl: submission.receiptUrl,
        receiptFileName: submission.receiptFileName,
      });
    } else {
      setReceiptData(null);
      handleRemoveFile();
      setError(null);
    }
  }, [submission, fee]);

  if (!isOpen || !submission) return null;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const validExtensions = /\.(jpe?g|png|webp|pdf)$/i;
    const isValidType =
      file.type.startsWith("image/") ||
      file.type === "application/pdf" ||
      validExtensions.test(file.name);

    if (!isValidType) {
      setError("Please upload an image screenshot (JPG, PNG, WebP) or PDF receipt.");
      return;
    }

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit. Please choose a smaller file.");
      return;
    }

    setError(null);
    setReceiptFile(file);

    // Create instant preview for image files
    if (file.type.startsWith("image/") || /\.(jpe?g|png|webp)$/i.test(file.name)) {
      const previewUrl = URL.createObjectURL(file);
      setReceiptPreview(previewUrl);
    } else {
      setReceiptPreview(null);
    }
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Prevent re-uploading if receipt is already submitted
    if (submission?.isPaid || submission?.receiptUrl) {
      setError(`Receipt has already been uploaded for entrant "${submission.applicantName}". Re-uploading is not permitted.`);
      return;
    }

    if (!receiptFile) {
      setError("Please upload your payment receipt screenshot before confirming.");
      return;
    }

    setLoading(true);

    try {
      // Convert receipt file into Base64 Data URL for universal storage & preview
      const base64Data: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read receipt file."));
        reader.readAsDataURL(receiptFile);
      });

      const now = new Date();
      const generatedRef = `RCP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const res = await recordSubmissionPayment({
        applicationId: submission.id,
        paymentMethod,
        paymentReference: generatedRef,
        receiptUrl: base64Data,
        receiptFileName: receiptFile.name,
        paymentAmount: fee,
      });

      if (res.success && res.data) {
        setReceiptData({
          receiptNumber: res.data.receiptNumber || generatedRef,
          paidAt: res.data.paidAt || now.toISOString(),
          amount: fee,
          paymentMethod,
          paymentReference: res.data.paymentReference || generatedRef,
          entrantName: submission.applicantName,
          confirmationNumber: submission.confirmationNumber,
          stationaryName: submission.stationaryName,
          receiptUrl: base64Data,
          receiptFileName: receiptFile.name,
        });
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
      } else {
        setError(res.error || "Failed to record payment confirmation.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while processing your receipt.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFinish = () => {
    handleRemoveFile();
    setReceiptData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                {receiptData ? "Official Payment Receipt Report" : "Settle Form Submission Fee"}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {receiptData
                  ? "Generated payment confirmation report"
                  : `Entrant: ${submission.applicantName} (${submission.confirmationNumber})`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={receiptData ? handleFinish : onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {receiptData ? (
            /* ================= RECEIPT REPORT VIEW ================= */
            <div className="space-y-5 animate-fadeIn">
              <div className="text-center space-y-2">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 mb-1">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Payment Confirmed & Settled!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  የክፍያ ማረጋገጫ ተመዝግቧል! Your filing fee has been reconciled in the system.
                </p>
              </div>

              {/* Official Receipt Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5 space-y-3.5 shadow-xs text-xs font-mono">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
                  <span className="text-slate-500 font-sans font-semibold">Receipt Number:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {receiptData.receiptNumber}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
                  <span className="text-slate-500 font-sans font-semibold">Entrant Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-sans">
                    {receiptData.entrantName}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
                  <span className="text-slate-500 font-sans font-semibold">Confirmation Number:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {receiptData.confirmationNumber}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
                  <span className="text-slate-500 font-sans font-semibold">Payment Channel:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-sans">
                    {receiptData.paymentMethod === "TELEBIRR" ? "Telebirr Mobile" : "Commercial Bank of Ethiopia (CBE)"}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
                  <span className="text-slate-500 font-sans font-semibold">Settlement Reference:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 select-all">
                    {receiptData.paymentReference}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-900 dark:text-white font-sans font-bold text-sm">
                    Amount Paid:
                  </span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    {receiptData.amount} ETB
                  </span>
                </div>
              </div>

              {/* Uploaded Receipt Document Preview */}
              {receiptData.receiptUrl && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Attached Payment Receipt</span>
                    </span>
                    {receiptData.receiptFileName && (
                      <span className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                        {receiptData.receiptFileName}
                      </span>
                    )}
                  </div>

                  {receiptData.receiptUrl.startsWith("data:image") ||
                  receiptData.receiptUrl.startsWith("http") ? (
                    <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900/50 max-h-52 flex items-center justify-center">
                      <img
                        src={receiptData.receiptUrl}
                        alt="Uploaded Receipt Proof"
                        className="w-full h-auto max-h-52 object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setIsViewingFullReceipt(true)}
                        className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white text-xs font-bold transition-opacity cursor-pointer"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Full Screen</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-emerald-600" />
                        <span className="font-mono text-slate-800 dark:text-slate-200">
                          {receiptData.receiptFileName || "receipt-document.pdf"}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        Attached PDF
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Receipt Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (submission?.dvPdfUrl) {
                      downloadOfficialDvPdf(
                        submission.dvPdfUrl,
                        submission.applicantFirstName,
                        submission.applicantLastName,
                        submission.confirmationNumber
                      );
                    } else {
                      downloadDvConfirmationSlip({
                        applicantName: receiptData.entrantName,
                        applicantFirstName: submission?.applicantFirstName,
                        applicantLastName: submission?.applicantLastName,
                        confirmationNumber: receiptData.confirmationNumber,
                        stationaryName: receiptData.stationaryName,
                        submittedAt: receiptData.paidAt,
                        paymentReference: receiptData.paymentReference,
                        paymentMethod: receiptData.paymentMethod,
                        dvPdfUrl: submission?.dvPdfUrl,
                      });
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-500 transition-colors cursor-pointer"
                  title="Download and print official DV Confirmation Reference Slip"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{submission?.dvPdfUrl ? "Download DV (PDF)" : "Download DV"}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Receipt</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinish}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition-colors cursor-pointer"
                >
                  <span>Done</span>
                </button>
              </div>
            </div>
          ) : (
            /* ================= PAYMENT INSTRUCTIONS & SUBMISSION FORM ================= */
            <form onSubmit={handleConfirmPayment} className="space-y-5">
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 animate-fadeIn">
                  <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Entrant Fee Summary Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Entrant Candidate:</span>
                  <span className="font-bold text-slate-900 dark:text-white uppercase">
                    {submission.applicantName}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Confirmation Number:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {submission.confirmationNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-slate-200 dark:border-slate-800/80 pt-2 font-bold">
                  <span className="text-slate-800 dark:text-slate-200">Total Settlement Fee:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-sm font-mono">
                    {fee} {paymentSettings.currency || "ETB"}
                  </span>
                </div>
              </div>

              {/* Channel Selector: CBE vs Telebirr */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Settlement Channel (የክፍያ ዘዴ ይምረጡ):
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CBE")}
                    className={cn(
                      "flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer",
                      paymentMethod === "CBE"
                        ? "border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-500 shadow-xs ring-1 ring-purple-500/20"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    )}
                  >
                    <Building2 className="h-4 w-4" />
                    <span>CBE Bank Transfer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("TELEBIRR")}
                    className={cn(
                      "flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer",
                      paymentMethod === "TELEBIRR"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500 shadow-xs ring-1 ring-emerald-500/20"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    )}
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>Telebirr Mobile</span>
                  </button>
                </div>
              </div>

              {/* Bank Details Display Card */}
              {paymentMethod === "CBE" ? (
                <div className="rounded-2xl border border-purple-500/30 bg-purple-50/50 dark:bg-purple-950/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 dark:text-purple-200">
                      Commercial Bank of Ethiopia
                    </span>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono font-semibold">
                      100% Verified Account
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-purple-200 dark:border-purple-900/50">
                    <div>
                      <p className="text-[10px] text-slate-400">Account Number</p>
                      <p className="text-sm font-mono font-bold text-slate-900 dark:text-white select-all">
                        {paymentSettings.cbeAccountNumber || "1000123456789"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          paymentSettings.cbeAccountNumber || "1000123456789",
                          "cbe"
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-lg bg-purple-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-purple-500 cursor-pointer shadow-xs"
                    >
                      {copiedType === "cbe" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedType === "cbe" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Account Name: </span>
                    {paymentSettings.cbeAccountName || "DV PROXY MANAGEMENT SERVICES"}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      Telebirr Mobile Payment
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                      Instant Receipt
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                    <div>
                      <p className="text-[10px] text-slate-400">Phone / Merchant ID</p>
                      <p className="text-sm font-mono font-bold text-slate-900 dark:text-white select-all">
                        {paymentSettings.telebirrPhone || "+251 91 123 4567"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          paymentSettings.telebirrPhone || "+251 91 123 4567",
                          "telebirr"
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-500 cursor-pointer shadow-xs"
                    >
                      {copiedType === "telebirr" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedType === "telebirr" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Recipient Name: </span>
                    {paymentSettings.telebirrName || "DV PROXY SERVICES"}
                  </div>
                </div>
              )}

              {/* Notice Remark */}
              {paymentSettings.paymentNotice && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  ℹ️ {paymentSettings.paymentNotice}
                </p>
              )}

              {/* ========================================================================= */}
              {/* RECEIPT UPLOAD DROPZONE COMPONENT                                          */}
              {/* ========================================================================= */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <UploadCloud className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Upload Transfer Receipt (የክፍያ ደረሰኝ ይጫኑ)</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  {receiptFile && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Ready to Confirm</span>
                    </span>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  className="hidden"
                />

                {!receiptFile ? (
                  /* Empty Dropzone State */
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2.5 p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center",
                      isDragging
                        ? "border-emerald-500 bg-emerald-500/10 scale-[1.01]"
                        : "border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-950/60 hover:border-emerald-500/70 hover:bg-emerald-50/20 dark:hover:bg-slate-800"
                    )}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-2xs">
                      <FileUp className="h-6 w-6 stroke-[2]" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Click or drag & drop CBE / Telebirr receipt screenshot
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        የባንክ ወይም የቴሌብር ማስተላለፊያ ስክሪንሽት ወይም ደረሰኝ እዚህ ይጫኑ
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                      <span className="px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 font-mono">
                        PNG, JPG, WEBP, PDF
                      </span>
                      <span>•</span>
                      <span>Max 10MB</span>
                    </div>
                  </div>
                ) : (
                  /* Uploaded File Preview State */
                  <div className="rounded-2xl border border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {receiptPreview ? (
                          <div className="relative h-13 w-13 shrink-0 rounded-xl overflow-hidden border border-emerald-500/30 bg-slate-900 shadow-2xs">
                            <img
                              src={receiptPreview}
                              alt="Receipt Preview"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-xl bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            <FileText className="h-6 w-6" />
                          </div>
                        )}

                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {receiptFile.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            {(receiptFile.size / 1024).toFixed(1)} KB • {receiptFile.type || "Document"}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                            <Check className="h-3 w-3 stroke-[3]" />
                            <span>Receipt Attached Successfully</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="p-1.5 text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Remove uploaded receipt"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between gap-2.5">
                  <div className="text-[11px] text-slate-400">
                    {!receiptFile ? (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        ⚠️ Upload receipt above to enable confirmation
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        ✓ Ready to report payment
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={loading}
                      className="rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={loading || !receiptFile}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold transition-all shadow-md",
                        receiptFile && !loading
                          ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/25 cursor-pointer"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none"
                      )}
                    >
                      {loading ? (
                        <>
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Uploading & Recording...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>Confirm & Report Paid ({fee} ETB)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Fullscreen Receipt Lightbox */}
      {isViewingFullReceipt && receiptData?.receiptUrl && (
        <div
          onClick={() => setIsViewingFullReceipt(false)}
          className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4 animate-fadeIn cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
            <button
              type="button"
              onClick={() => setIsViewingFullReceipt(false)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={receiptData.receiptUrl}
              alt="Receipt Full View"
              className="max-h-[85vh] w-auto object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};
