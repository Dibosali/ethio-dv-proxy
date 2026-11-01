"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { NotificationBell } from "@/components/admin/NotificationBell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { EthioDvLogo } from "@/components/ui/EthioDvLogo";
import { UserProfileBadge } from "@/components/ui/UserProfileBadge";
import { ExternalLink, LogOut, ShieldAlert } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // If loading session, show clean loading skeleton
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 rounded-full border-3 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Verifying Admin Session...
          </p>
        </div>
      </div>
    );
  }

  // If not logged in as SUPER_ADMIN, present access restricted shield
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-5 shadow-2xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 mx-auto">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Super Admin Authorization Required
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              This area is restricted to Super Administrator root credentials. Proxy stationaries must use the application terminal.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition-colors cursor-pointer"
            >
              <span>Login as Admin</span>
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <span>Open Entrant Form</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-blue-600 selection:text-white transition-colors duration-150">
      {/* Retractable Left Sidebar Navigation */}
      <AdminSidebar />

      {/* Right Main Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 transition-colors">
        {/* Admin Clean Minimal Header Bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 px-4 sm:px-6 backdrop-blur-md transition-colors">
          {/* Left Header - Clean Breadcrumb with Brand Logo */}
          <div className="flex items-center gap-2.5">
            <EthioDvLogo size="xs" />
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">
              Super Admin Control Room
            </span>
          </div>

          {/* Right Header - Theme Toggle, Solid Notification Bell, Live Form Link, Avatar, Sign Out */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Dark / Light Mode Switcher */}
            <ThemeToggle variant="header" />

            {/* Solid Notification Bell */}
            <NotificationBell />

            {/* Public Entrant Form Shortcut */}
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
            >
              <span>Live Form</span>
              <ExternalLink className="h-3 w-3" />
            </Link>

            {/* Super Admin Synced Profile Badge */}
            <UserProfileBadge variant="admin" />

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 dark:hover:border-red-900/50 transition-colors shadow-2xs cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
