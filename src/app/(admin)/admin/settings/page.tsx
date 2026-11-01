"use client";

import React from "react";
import Link from "next/link";
import { Settings, Shield, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";
import { PaymentSettingsForm } from "@/components/admin/PaymentSettingsForm";

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            System Settings & Security Policies
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global configuration for proxy credential rotation, WhatsApp integration, and data retention.
          </p>
        </div>

        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Payment & Billing Configuration */}
      <PaymentSettingsForm />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Change Admin Password */}
        <ChangePasswordForm />

        {/* Security Policies and Session Privilege */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Super Admin Privilege
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Current active administrative session
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span>Role</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">SUPER_ADMIN</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span>Access Level</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Full Access (All Stationaries)</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span>Status</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Active Session
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Credential Security Policy
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Minimum complexity rules for proxy agent passwords
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span>Entropy Requirement</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  14 Chars (Upper, Lower, Num, Special)
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span>Automatic Username Prefix</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                  [shop_slug]_dv
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span>Share Format</span>
                <span className="text-slate-500 dark:text-slate-400">
                  Unicode Formatted + WhatsApp Link
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
