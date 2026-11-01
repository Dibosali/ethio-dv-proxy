"use client";

import React, { useState, useRef } from "react";
import {
  X,
  FileUp,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  Trash2,
  ExternalLink,
  Download,
} from "lucide-react";
import { SubmissionSummary } from "@/types/admin";
import { uploadDvPdfAction, deleteDvPdfAction } from "@/actions/submission";
import { downloadOfficialDvPdf } from "@/lib/utils/dvSlip";
import { cn } from "@/lib/utils";

interface UploadDvPdfModalProps {
  submission: SubmissionSummary | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (dvPdfUrl: string, dvPdfFileName: string) => void;
}

export const UploadDvPdfModal: React.FC<UploadDvPdfModalProps> = ({
  submission,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen || !submission) return null;

  const firstName = submission.applicantFirstName || submission.applicantName.split(" ")[0] || "";
  const lastName = submission.applicantLastName || submission.applicantName.split(" ").slice(1).join(" ") || "";

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setError("Please select a valid DV confirmation PDF document (.pdf).");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError("File size exceeds 25MB limit.");
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select the official DV confirmation PDF file to upload.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append("applicationId", submission.id);
      formData.append("dvPdfFile", selectedFile);

      const res = await uploadDvPdfAction(formData);

      if (res.success && res.data) {
        setSuccessMsg(`Official DV Confirmation PDF uploaded successfully!`);
        submission.dvPdfUrl = res.data.dvPdfUrl;
        submission.dvPdfFileName = res.data.dvPdfFileName;
        submission.dvPdfUploadedAt = res.data.dvPdfUploadedAt;
        submission.isFilled = true;

        if (onSuccess) {
          onSuccess(res.data.dvPdfUrl, res.data.dvPdfFileName);
        }

        setTimeout(() => {
          setSelectedFile(null);
          onClose();
        }, 1200);
      } else {
        setError(res.error || "Failed to upload DV confirmation PDF.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during upload.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove the current DV PDF?")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await deleteDvPdfAction(submission.id);
      if (res.success) {
        submission.dvPdfUrl = null;
        submission.dvPdfFileName = null;
        submission.dvPdfUploadedAt = null;
        setSuccessMsg("DV PDF removed successfully.");
        if (onSuccess) {
          onSuccess("", "");
        }
      } else {
        setError(res.error || "Failed to delete DV PDF.");
      }
    } catch (err: any) {
      setError(err?.message || "Error deleting DV PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <FileUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Upload Official DV Confirmation PDF
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Attach official government submission confirmation slip for stationary
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Entrant Identification Details */}
          <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">Entrant Legal Name:</span>
              <span className="font-extrabold text-blue-700 dark:text-blue-300 uppercase">
                {firstName} {lastName}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">DV Confirmation Number:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {submission.confirmationNumber}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-semibold">Stationary Shop:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {submission.stationaryName} (@{submission.agentUsername})
              </span>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-blue-200/60 dark:border-blue-900/40 pt-2 font-bold">
              <span className="text-slate-600 dark:text-slate-300">Payment Status:</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                PAID & SETTLED ✓
              </span>
            </div>
          </div>

          {/* Already uploaded status */}
          {submission.dvPdfUrl && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    DV Confirmation PDF Uploaded & Active
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  title="Remove uploaded PDF"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-mono truncate">
                File: {submission.dvPdfFileName || "official-dv-confirmation.pdf"}
              </p>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    downloadOfficialDvPdf(
                      submission.dvPdfUrl!,
                      firstName,
                      lastName,
                      submission.confirmationNumber
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download / Inspect PDF</span>
                </button>
              </div>
            </div>
          )}

          {/* Error & Success Alerts */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Upload Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {submission.dvPdfUrl
                  ? "Replace / Upload New Official DV PDF:"
                  : "Select Official DV Confirmation PDF:"}
              </label>

              {!selectedFile ? (
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
                    "flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all",
                    isDragging
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                      : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-slate-800"
                  )}
                >
                  <UploadCloud className="h-8 w-8 text-blue-500 mb-2" />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Click to browse or drag & drop official DV PDF
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Government DV confirmation file (PDF format only, max 25MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-blue-500/30 bg-blue-50/60 dark:bg-blue-950/30 p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB • Ready to upload to Backblaze B2
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading DV PDF...</span>
                  </>
                ) : (
                  <>
                    <FileUp className="h-4 w-4" />
                    <span>Confirm & Upload DV PDF</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
