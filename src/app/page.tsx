"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  MultiStepFormProvider,
  useMultiStepForm,
} from "@/context/MultiStepFormContext";
import { useAdmin } from "@/context/AdminContext";
import { StepNavigation } from "@/components/form/StepNavigation";
import { Part1Screen } from "@/components/form/Part1Screen";
import { Part2Screen } from "@/components/form/Part2Screen";
import { ReviewScreen } from "@/components/form/ReviewScreen";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { EthioDvLogo } from "@/components/ui/EthioDvLogo";
import { UserProfileBadge } from "@/components/ui/UserProfileBadge";
import {
  Sparkles,
  Store,
  FileCheck2,
  BarChart3,
  LogOut,
  Send,
  Lock,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

function MultiStepFormContainer() {
  const { currentStep, isDerivativeRequired } = useMultiStepForm();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { getStationaryStats } = useAdmin();

  // Redirect unauthenticated entrants to login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 rounded-full border-3 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Verifying Terminal Authorization...
          </p>
        </div>
      </div>
    );
  }

  // Guard: If not signed in
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-5 shadow-2xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 mx-auto">
            <Lock className="h-7 w-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Stationary Login Required
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              This entry terminal is exclusively accessible to authorized proxy stationaries. Please log in with your issued credentials.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition-all cursor-pointer"
          >
            <span>Proceed to Login</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const stationaryIdentifier =
    session.user.stationaryName || session.user.username || "Bole Star";
  const stats = getStationaryStats(stationaryIdentifier);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* Official US Department of State Proxy Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30 shadow-xs transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* Left: DV Seal & System Title */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <EthioDvLogo size="sm" priority />
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                Ethio DV Proxy Entry Form
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Electronic Diversity Visa Proxy Application
              </p>
            </div>
          </div>

          {/* Right: Stationery Profile, Forms Sent Counter, Analytics, Theme Toggle, Sign Out */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            {/* Stationery Profile Interactive Badge */}
            <UserProfileBadge variant="stationary" />

            {/* Forms Sent Counter Pill */}
            <div
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/40 px-2.5 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 shadow-2xs"
              title={`Total forms submitted by ${session.user.stationaryName || "your shop"}`}
            >
              <Send className="h-3 w-3" />
              <span>
                <strong className="text-blue-800 dark:text-blue-200 font-black">{stats.totalSent}</strong> Forms Sent
              </span>
            </div>

            {/* Analytics & Billing Button */}
            <Link
              href="/analytics"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors shadow-2xs"
              title="View your filled forms, billing, and CBE payment info"
            >
              <BarChart3 className="h-3.5 w-3.5 text-emerald-500" />
              <span className="hidden sm:inline">Analytics</span>
              {stats.filledUnpaid > 0 && (
                <span className="rounded-full bg-amber-500 text-white px-1.5 py-0.2 text-[10px] font-bold">
                  {stats.filledUnpaid}
                </span>
              )}
            </Link>

            {/* Theme Toggle Button */}
            <ThemeToggle variant="icon" />

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 dark:hover:border-rose-900/50 transition-colors shadow-2xs cursor-pointer"
              title="Sign Out of Terminal"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Applicant Form Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-8">
          {/* Top Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-6 sm:p-8 text-white shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                  <span>Authorized Terminal Active: {session.user.stationaryName}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Electronic Diversity Visa Entry Form (DV-2026)
                </h2>
                <p className="text-sm text-blue-100 leading-relaxed">
                  Official Proxy Architecture. Entrant submissions made through this portal
                  are securely registered under your stationery terminal account.
                </p>
              </div>
            </div>
          </div>

          {/* Step Navigation Bar */}
          <StepNavigation />

          {/* Step 1: Part 1 Screen */}
          {currentStep === 1 && <Part1Screen />}

          {/* Step 2: Part 2 Screen (if derivatives required) OR Review Screen (if bypassed) */}
          {currentStep === 2 &&
            (isDerivativeRequired ? <Part2Screen /> : <ReviewScreen />)}

          {/* Step 3: Review Screen (when derivatives were active) */}
          {currentStep === 3 && <ReviewScreen />}
        </div>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <MultiStepFormProvider>
      <MultiStepFormContainer />
    </MultiStepFormProvider>
  );
}
