"use client";

import React, { useState } from "react";
import { SubmissionSummary } from "@/types/admin";
import { formatSubmissionToPlainText } from "@/lib/utils/clipboard";
import { Copy, Check, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CopyDetailsButtonProps {
  submission: SubmissionSummary;
  className?: string;
  variant?: "primary" | "secondary";
}

export const CopyDetailsButton: React.FC<CopyDetailsButtonProps> = ({
  submission,
  className,
  variant = "primary",
}) => {
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleCopy = async () => {
    try {
      const text = formatSubmissionToPlainText(submission);
      await navigator.clipboard.writeText(text);

      setCopied(true);
      setShowToast(true);

      setTimeout(() => setCopied(false), 3000);
      setTimeout(() => setShowToast(false), 4500);
    } catch (err) {
      console.error("Clipboard copy error:", err);
      // Fallback using older execCommand if needed
      const textArea = document.createElement("textarea");
      textArea.value = formatSubmissionToPlainText(submission);
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      setCopied(true);
      setShowToast(true);
      setTimeout(() => setCopied(false), 3000);
      setTimeout(() => setShowToast(false), 4500);
    }
  };

  return (
    <>
      {/* Toast Success Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-slate-900/95 px-5 py-4 text-xs text-white shadow-2xl backdrop-blur-md animate-fadeIn ring-1 ring-emerald-500/30">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">
              All Details Copied to Clipboard!
            </p>
            <p className="text-slate-400 text-xs mt-0.5">
              Complete plain text record for {submission.applicantName} ready to paste.
            </p>
          </div>
        </div>
      )}

      {/* Main Copy Button */}
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-md focus:outline-none select-none",
          copied
            ? "bg-emerald-600 text-white shadow-emerald-600/25 ring-2 ring-emerald-500/30"
            : variant === "primary"
            ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/20 active:scale-[0.98]"
            : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white shadow-xs cursor-pointer",
          className
        )}
        title="Copy human-readable submission record"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 stroke-[3] text-white" />
            <span>Copied to Clipboard!</span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            <span>Copy All Details</span>
          </>
        )}
      </button>
    </>
  );
};
