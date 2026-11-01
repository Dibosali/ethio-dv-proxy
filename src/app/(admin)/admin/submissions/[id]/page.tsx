"use client";

import React, { use } from "react";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import { SubmissionDetailView } from "@/components/admin/SubmissionDetailView";
import {
  FileCheck2,
  ArrowLeft,
  Store,
  Calendar,
  Users,
  Copy,
  Clock,
  ExternalLink,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export default function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getSubmissionById } = useAdmin();
  const submission = getSubmissionById(id);

  if (!submission) {
    return (
      <div className="space-y-6 animate-fadeIn py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20 mx-auto">
          <AlertCircle className="h-7 w-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Submission Not Found</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No record exists matching ID: <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{id}</span>
          </p>
        </div>
        <div>
          <Link
            href="/admin/submissions"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Submissions Registry</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Breadcrumb & Return Link */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <span>/</span>
          <Link
            href="/admin/submissions"
            className="hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Submissions
          </Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[200px]">
            {submission.applicantName}
          </span>
        </div>

        <Link
          href="/admin/submissions"
          className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Submissions</span>
        </Link>
      </div>

      {/* Main Submission Detail View */}
      <SubmissionDetailView submission={submission} />
    </div>
  );
}
