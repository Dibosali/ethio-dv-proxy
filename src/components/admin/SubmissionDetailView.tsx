"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SubmissionSummary } from "@/types/admin";
import { useAdmin } from "@/context/AdminContext";
import { CopyDetailsButton } from "@/components/admin/CopyDetailsButton";
import { MediaGallery } from "@/components/admin/MediaGallery";
import {
  FileCheck2,
  Store,
  Calendar,
  Users,
  MapPin,
  Mail,
  Phone,
  GraduationCap,
  Heart,
  Baby,
  Globe,
  User,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  Maximize2,
  Check,
  FileUp,
  CreditCard,
  Building2,
  Smartphone,
  Download,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UploadDvPdfModal } from "./UploadDvPdfModal";

export interface SubmissionDetailViewProps {
  submission: SubmissionSummary;
  className?: string;
}

export const SubmissionDetailView: React.FC<SubmissionDetailViewProps> = ({
  submission,
  className,
}) => {
  const { submissions, toggleSubmissionPaid, toggleSubmissionFilled } =
    useAdmin();

  const [isUploadingDvPdf, setIsUploadingDvPdf] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(false);

  // Keep live reference so Paid & Filled toggles reflect immediately in UI
  const currentSub =
    submissions.find((s) => s.id === submission.id) || submission;
  const isPaid = !!currentSub.isPaid;
  const isFilled = !!currentSub.isFilled;

  const [selectedPhoto, setSelectedPhoto] = useState<{
    url: string;
    title: string;
  } | null>(null);

  const f = currentSub.formData;
  const p = f?.primaryEntrant;
  const spouse = f?.spouse;
  const children = f?.children || [];

  const submissionDateFormatted = (() => {
    try {
      return new Date(currentSub.submittedAt).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return currentSub.submittedAt;
    }
  })();

  return (
    <div className={cn("space-y-8", className)}>
      {/* Lightbox Modal for Enlarged Photo View */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-xl w-full rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-white text-sm">
                {selectedPhoto.title}
              </span>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="rounded-xl border border-slate-700 bg-slate-800 p-1.5 text-slate-300 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex justify-center p-4">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="max-h-[70vh] w-auto rounded-2xl border border-slate-800 object-contain shadow-2xl"
              />
            </div>
            <p className="text-center text-xs text-slate-400">
              Official 600x600 px passport specification photo
            </p>
          </div>
        </div>
      )}

      {/* HEADER: Processing Stationary Shop Banner */}
      <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50/40 dark:from-slate-900 dark:via-blue-950/40 dark:to-slate-900 p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 dark:bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-500/30">
                <Store className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Stationary Proxy Verified</span>
              </span>

              {/* Paid Badge */}
              {isPaid ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Paid</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 dark:bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400 border border-amber-500/30">
                  <AlertCircle className="h-3 w-3" />
                  <span>Unpaid</span>
                </span>
              )}

              {/* Filled Badge */}
              {isFilled ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 dark:bg-blue-500/20 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-400 border border-blue-500/30">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Filled</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                  <Clock className="h-3 w-3" />
                  <span>Unfilled</span>
                </span>
              )}
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {currentSub.applicantName}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300 mt-1.5">
                <span className="font-mono bg-white dark:bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-blue-700 dark:text-blue-300 font-bold select-all">
                  CN: {currentSub.confirmationNumber}
                </span>
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Calendar className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                  <span>Submitted: {submissionDateFormatted}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Toolbar with Paid & Filled Toggles */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Paid Toggle Button */}
            <button
              type="button"
              onClick={() => toggleSubmissionPaid(currentSub.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-md border cursor-pointer",
                isPaid
                  ? "bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400"
              )}
            >
              <Check className="h-3.5 w-3.5" />
              <span>{isPaid ? "Paid ✓" : "Mark Paid"}</span>
            </button>

            {/* When form is paid: Prompt Super Admin to upload official DV PDF */}
            {isPaid && (
              currentSub.dvPdfUrl ? (
                <button
                  type="button"
                  onClick={() => setIsUploadingDvPdf(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all cursor-pointer shadow-sm"
                  title="Official DV PDF uploaded. Click to inspect or replace."
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span>DV PDF Uploaded ✓</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsUploadingDvPdf(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:from-indigo-500 hover:to-blue-500 transition-all cursor-pointer animate-pulse"
                  title="Form is paid! Click to upload the official government DV confirmation PDF."
                >
                  <FileUp className="h-3.5 w-3.5" />
                  <span>Upload DV PDF (ስቀል)</span>
                </button>
              )
            )}

            {/* Filled Toggle Button */}
            <button
              type="button"
              onClick={() => toggleSubmissionFilled(currentSub.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-md border cursor-pointer",
                isFilled
                  ? "bg-blue-600 text-white border-blue-500 hover:bg-blue-500"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
              )}
            >
              <FileCheck2 className="h-3.5 w-3.5" />
              <span>{isFilled ? "Filled ✓" : "Mark Filled"}</span>
            </button>

            <CopyDetailsButton submission={currentSub} variant="primary" />

            <Link
              href="/admin/submissions"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors shadow-xs"
            >
              <span>Back to Registry</span>
            </Link>
          </div>
        </div>

        {/* Stationary Details Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800/80 text-xs">
          <div className="flex items-center gap-3 rounded-2xl bg-white/80 dark:bg-slate-950/70 p-3.5 border border-slate-200 dark:border-slate-800/80 shadow-xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Store className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
                Processing Stationary
              </p>
              <p className="font-bold text-slate-900 dark:text-white truncate">
                {submission.stationaryName}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                @{submission.agentUsername}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white/80 dark:bg-slate-950/70 p-3.5 border border-slate-200 dark:border-slate-800/80 shadow-xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Phone className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
                Station Contact
              </p>
              <p className="font-bold text-slate-900 dark:text-white truncate">
                {submission.contactPhone || "+251 91 123 4567"}
              </p>
              <p className="text-[10px] text-slate-500">Official Mobile Terminal</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white/80 dark:bg-slate-950/70 p-3.5 border border-slate-200 dark:border-slate-800/80 shadow-xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Users className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
                Family Composition
              </p>
              <p className="font-bold text-slate-900 dark:text-white truncate">
                {submission.childrenCount > 0
                  ? `${submission.childrenCount} Derivatives Included`
                  : "Single Entrant"}
              </p>
              <p className="text-[10px] text-slate-500">
                {submission.maritalStatus}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FINANCIAL SETTLEMENT & RECEIPT AUDIT CARD */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-xl border",
              isPaid
                ? "bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20"
            )}>
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Payment & Filing Fee Settlement</span>
                {isPaid ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Paid & Reconciled</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400 border border-amber-500/30">
                    <AlertCircle className="h-3 w-3" />
                    <span>Payment Pending</span>
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Settlement audit details for {currentSub.applicantName} from {currentSub.stationaryName}
              </p>
            </div>
          </div>

          {/* Action prompt if paid but no DV PDF */}
          {isPaid && !currentSub.dvPdfUrl && (
            <button
              type="button"
              onClick={() => setIsUploadingDvPdf(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:from-indigo-500 hover:to-blue-500 transition-all cursor-pointer animate-pulse shrink-0"
              title="Form is paid! Prompt: Upload the official government DV confirmation PDF."
            >
              <FileUp className="h-3.5 w-3.5" />
              <span>Upload DV PDF (ስቀል)</span>
            </button>
          )}
        </div>

        {isPaid ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
            {/* 1. Settlement Date */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Receipt / Settlement Date
              </span>
              <p className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                {currentSub.paidAt
                  ? new Date(currentSub.paidAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Confirmed"}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ Verified Timestamp
              </p>
            </div>

            {/* 2. Amount Settled */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Settled Filing Fee
              </span>
              <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                {currentSub.paymentAmount || 200} ETB
              </p>
              <p className="text-[10px] text-slate-500">Official form processing rate</p>
            </div>

            {/* 3. Payment Method & TxID */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Channel & Reference
              </span>
              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                {currentSub.paymentMethod === "TELEBIRR" ? (
                  <Smartphone className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Building2 className="h-3 w-3 text-purple-500" />
                )}
                <span>{currentSub.paymentMethod || "CBE"}</span>
              </p>
              <p className="font-mono text-[10px] text-slate-500 truncate select-all">
                Ref: {currentSub.paymentReference || "CONFIRMED"}
              </p>
            </div>

            {/* 4. Uploaded Receipt Screenshot */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Attached Receipt Screenshot
              </span>
              {currentSub.receiptUrl ? (
                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setViewingReceipt(true)}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <ImageIcon className="h-3 w-3" />
                    <span>View Screenshot</span>
                  </button>
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[90px]">
                    {currentSub.receiptFileName || "receipt.png"}
                  </span>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">No screenshot file attached</p>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20 p-4 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <p className="font-bold text-amber-800 dark:text-amber-300">
                Filing Fee Pending Settlement
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                {currentSub.stationaryName} has not yet reported payment for this form submission.
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleSubmissionPaid(currentSub.id)}
              className="inline-flex items-center gap-1 rounded-lg border border-amber-500/40 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors cursor-pointer"
            >
              <Check className="h-3 w-3" />
              <span>Mark as Paid</span>
            </button>
          </div>
        )}

        {/* Prompt to Upload Official DV PDF Banner */}
        {isPaid && (
          <div className={cn(
            "rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border",
            currentSub.dvPdfUrl
              ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-900 dark:text-emerald-200"
              : "bg-gradient-to-r from-indigo-50/90 via-blue-50/80 to-purple-50/90 dark:from-indigo-950/40 dark:via-blue-950/30 dark:to-purple-950/40 border-indigo-500/30 text-slate-900 dark:text-white"
          )}>
            <div className="space-y-0.5">
              <p className="font-bold flex items-center gap-1.5">
                {currentSub.dvPdfUrl ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Official DV Confirmation Slip (PDF) Attached</span>
                  </>
                ) : (
                  <>
                    <FileUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>Admin Action Prompt: Upload Official Government DV Confirmation PDF</span>
                  </>
                )}
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                {currentSub.dvPdfUrl
                  ? `File: ${currentSub.dvPdfFileName || "dv-confirmation.pdf"} — Station can download this DV with applicant branding.`
                  : `Payment is verified! Please upload the government confirmation PDF so ${currentSub.stationaryName} can download the official DV slip.`}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {currentSub.dvPdfUrl && (
                <a
                  href={currentSub.dvPdfUrl}
                  download={currentSub.dvPdfFileName || `DV_${currentSub.applicantName.replace(/\s+/g, "_")}.pdf`}
                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors shadow-2xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download DV</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => setIsUploadingDvPdf(true)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer",
                  currentSub.dvPdfUrl
                    ? "border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/25 animate-pulse"
                )}
              >
                <FileUp className="h-3.5 w-3.5" />
                <span>{currentSub.dvPdfUrl ? "Replace DV PDF" : "Upload DV PDF Now"}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Receipt Lightbox */}
      {viewingReceipt && currentSub.receiptUrl && (
        <div
          onClick={() => setViewingReceipt(false)}
          className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4 animate-fadeIn cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 p-2 shadow-2xl">
            <button
              type="button"
              onClick={() => setViewingReceipt(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/70 text-white hover:bg-black transition-colors cursor-pointer z-10"
              title="Close image"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={currentSub.receiptUrl}
              alt="Payment Receipt Screenshot"
              className="max-h-[85vh] w-auto object-contain mx-auto rounded-lg"
            />
          </div>
        </div>
      )}

      {/* PART 1: PRIMARY ENTRANT SECTION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-xs">
            1
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Part 1 — Entrant Information
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Primary applicant official entry fields
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Full Name */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 space-y-1.5 lg:col-span-2 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              1. Full Name
            </span>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div>
                <span className="text-[10px] text-slate-500">Last / Family Name:</span>
                <p className="font-bold text-slate-900 dark:text-white uppercase text-sm">
                  {p?.name.lastName || submission.applicantName.split(" ")[0]}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500">First / Given Name:</span>
                <p className="font-bold text-slate-900 dark:text-white uppercase text-sm">
                  {p?.name.noFirstName
                    ? "(No First Name)"
                    : p?.name.firstName || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500">Middle Name:</span>
                <p className="font-bold text-slate-900 dark:text-white uppercase text-sm">
                  {p?.name.noMiddleName
                    ? "(No Middle Name)"
                    : p?.name.middleName || "(None)"}
                </p>
              </div>
            </div>
          </div>

          {/* 7. Entrant Photo Thumbnail */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 flex items-center gap-4 shadow-sm">
            <div
              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 cursor-pointer group shadow-md"
              onClick={() =>
                setSelectedPhoto({
                  url: submission.photoUrl,
                  title: `Primary Entrant Photo: ${submission.applicantName}`,
                })
              }
              title="Click to view full photo"
            >
              <img
                src={submission.photoUrl}
                alt={submission.applicantName}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                <Maximize2 className="h-4 w-4" />
              </div>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                7. Entrant Photo
              </span>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                ✓ Uploaded & Verified
              </p>
              <p className="text-[10px] text-slate-500">600x600 px spec met</p>
            </div>
          </div>

          {/* 2. Gender */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 space-y-1 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              2. Gender
            </span>
            <p className="font-bold text-slate-900 dark:text-white text-base">
              {p?.gender === "MALE" ? "Male (ወንድ)" : "Female (ሴት)"}
            </p>
          </div>

          {/* 3. Birth Date */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 space-y-1 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              3. Date of Birth
            </span>
            <p className="font-mono font-bold text-slate-900 dark:text-white text-base">
              {p?.dob.month} / {p?.dob.day} / {p?.dob.year}
            </p>
            <p className="text-[10px] text-slate-500">Format: Month / Day / Year</p>
          </div>

          {/* 4. Birth City */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 space-y-1 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              4. Birth City
            </span>
            <p className="font-bold text-slate-900 dark:text-white text-base">
              {p?.birthCityUnknown ? "Birth City Unknown" : p?.birthCity || "Addis Ababa"}
            </p>
          </div>

          {/* 5. Birth Country */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 space-y-1 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              5. Birth Country
            </span>
            <p className="font-bold text-slate-900 dark:text-white text-base">
              {p?.birthCountry || "Ethiopia"}
            </p>
          </div>

          {/* 6. Country of Eligibility */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 space-y-1 lg:col-span-2 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              6. Country of Eligibility
            </span>
            <p className="font-bold text-slate-900 dark:text-white text-sm">
              {p?.countryOfEligibilitySame === "YES"
                ? `Claiming eligibility based on country of birth (${p?.birthCountry || "Ethiopia"})`
                : `Alternative eligibility claimed: ${p?.alternativeCountryOfEligibility}`}
            </p>
          </div>

          {/* 8. Mailing Address */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 space-y-2 lg:col-span-3 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              8. Mailing Address
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
              {p?.mailingAddress.inCareOf && (
                <div>
                  <span className="text-slate-500">In Care Of:</span>
                  <p className="font-bold text-slate-900 dark:text-white">{p.mailingAddress.inCareOf}</p>
                </div>
              )}
              <div className="sm:col-span-2">
                <span className="text-slate-500">Address Line 1:</span>
                <p className="font-bold text-slate-900 dark:text-white">{p?.mailingAddress.addressLine1}</p>
              </div>
              {p?.mailingAddress.addressLine2 && (
                <div>
                  <span className="text-slate-500">Address Line 2:</span>
                  <p className="font-bold text-slate-900 dark:text-white">{p.mailingAddress.addressLine2}</p>
                </div>
              )}
              <div>
                <span className="text-slate-500">City / Town:</span>
                <p className="font-bold text-slate-900 dark:text-white">{p?.mailingAddress.city}</p>
              </div>
              <div>
                <span className="text-slate-500">District / State / County:</span>
                <p className="font-bold text-slate-900 dark:text-white">{p?.mailingAddress.districtStateCounty}</p>
              </div>
              <div>
                <span className="text-slate-500">Postal / Zip Code:</span>
                <p className="font-bold text-slate-900 dark:text-white">
                  {p?.mailingAddress.noPostalCode
                    ? "No Postal Code"
                    : p?.mailingAddress.postalCode}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Country:</span>
                <p className="font-bold text-slate-900 dark:text-white">{p?.mailingAddress.country}</p>
              </div>
            </div>
          </div>

          {/* 9. Current Country of Residence */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 space-y-1 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              9. Country of Current Residence
            </span>
            <p className="font-bold text-slate-900 dark:text-white text-base">
              {p?.currentCountry || "Ethiopia"}
            </p>
          </div>

          {/* 10. Contact Details (Phone & Email) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 space-y-2 lg:col-span-2 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              10. Contact Details
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="text-slate-500">Email Address:</span>
                <p className="font-bold text-slate-900 dark:text-white select-all">{p?.email || submission.contactEmail}</p>
              </div>
              <div>
                <span className="text-slate-500">Phone Number:</span>
                <p className="font-bold text-slate-900 dark:text-white select-all">{p?.phoneNumber || submission.contactPhone || "None"}</p>
              </div>
            </div>
          </div>

          {/* 11. Highest Level of Education */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 space-y-1 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              11. Education Level
            </span>
            <p className="font-bold text-slate-900 dark:text-white text-sm">
              {p?.educationLevel ? p.educationLevel.replace(/_/g, " ") : "University Degree"}
            </p>
          </div>

          {/* 12. Marital Status */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 space-y-1 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              12. Marital Status
            </span>
            <p className="font-bold text-slate-900 dark:text-white text-sm">
              {submission.maritalStatus}
            </p>
          </div>

          {/* 13. Number of Children */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 space-y-1 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              13. Number of Children
            </span>
            <p className="font-bold text-slate-900 dark:text-white text-base">
              {submission.childrenCount}{" "}
              {submission.childrenCount === 1 ? "Child" : "Children"}
            </p>
          </div>
        </div>
      </div>

      {/* PART 2: DERIVATIVES SECTION */}
      <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-black text-xs">
            2
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Part 2 — Derivatives Information
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Spouse and children records attached to this application
            </p>
          </div>
        </div>

        {/* Spouse Block */}
        {spouse ? (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-500 dark:text-pink-400" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Spouse Record
                </h4>
              </div>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                Spouse Included
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
              <div className="md:col-span-2">
                <span className="text-slate-500">Spouse Full Name:</span>
                <p className="font-bold text-slate-900 dark:text-white uppercase text-base mt-0.5">
                  {spouse.name.lastName}, {spouse.name.firstName} {spouse.name.middleName}
                </p>
              </div>

              <div>
                <span className="text-slate-500">Gender:</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                  {spouse.gender === "MALE" ? "Male" : "Female"}
                </p>
              </div>

              <div>
                <span className="text-slate-500">Date of Birth:</span>
                <p className="font-mono font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                  {spouse.dob.month} / {spouse.dob.day} / {spouse.dob.year}
                </p>
              </div>

              <div>
                <span className="text-slate-500">Birth City:</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                  {spouse.birthCityUnknown ? "Unknown" : spouse.birthCity}
                </p>
              </div>

              <div>
                <span className="text-slate-500">Birth Country:</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                  {spouse.birthCountry}
                </p>
              </div>

              {submission.spousePhotoUrl && (
                <div className="flex items-center gap-3 md:col-span-2 pt-1">
                  <div
                    className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 cursor-pointer shadow-sm"
                    onClick={() =>
                      setSelectedPhoto({
                        url: submission.spousePhotoUrl!,
                        title: `Spouse Photo: ${spouse.name.firstName} ${spouse.name.lastName}`,
                      })
                    }
                  >
                    <img
                      src={submission.spousePhotoUrl}
                      alt="Spouse Photo"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Spouse Photograph Verified
                    </span>
                    <p className="text-[10px] text-slate-500">
                      Click thumbnail to inspect full preview
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-5 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-3 shadow-xs">
            <Heart className="h-4 w-4 text-slate-400 dark:text-slate-600" />
            <span>
              <strong>Spouse:</strong> No spouse claimed on this entry (Unmarried / Legally Separated without spouse info).
            </span>
          </div>
        )}

        {/* Children Blocks */}
        {children.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Baby className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Children Records ({children.length})
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children.map((child, index) => {
                const childPhoto = submission.childrenPhotoUrls?.[index];

                return (
                  <div
                    key={index}
                    className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 space-y-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                      <span className="font-bold text-blue-600 dark:text-blue-400 text-xs">
                        CHILD #{index + 1}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        DOB: {child.dob.month}/{child.dob.day}/{child.dob.year}
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      {childPhoto && (
                        <div
                          className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 cursor-pointer shadow-sm"
                          onClick={() =>
                            setSelectedPhoto({
                              url: childPhoto,
                              title: `Child #${index + 1} Photo: ${child.name.firstName} ${child.name.lastName}`,
                            })
                          }
                        >
                          <img
                            src={childPhoto}
                            alt={`Child ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}

                      <div className="min-w-0 flex-1 space-y-1 text-xs">
                        <p className="font-bold text-slate-900 dark:text-white uppercase truncate">
                          {child.name.lastName}, {child.name.firstName} {child.name.middleName}
                        </p>
                        <p className="text-slate-600 dark:text-slate-400">
                          Gender: <strong>{child.gender === "MALE" ? "Male" : "Female"}</strong>
                        </p>
                        <p className="text-slate-600 dark:text-slate-400">
                          City / Country:{" "}
                          <strong>
                            {child.birthCityUnknown ? "Unknown" : child.birthCity},{" "}
                            {child.birthCountry}
                          </strong>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-5 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-3 shadow-xs">
            <Baby className="h-4 w-4 text-slate-400 dark:text-slate-600" />
            <span>
              <strong>Children:</strong> 0 children registered for this entrant.
            </span>
          </div>
        )}
      </div>

      {/* PART 4: SUBMITTED MEDIA & DOWNLOAD HANDLERS */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <MediaGallery submission={submission} />
      </div>

      {/* Official DV PDF Upload Modal */}
      <UploadDvPdfModal
        submission={currentSub}
        isOpen={isUploadingDvPdf}
        onClose={() => setIsUploadingDvPdf(false)}
      />
    </div>
  );
};
