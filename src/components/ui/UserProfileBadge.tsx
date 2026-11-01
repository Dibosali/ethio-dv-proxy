"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  Store,
  Shield,
  User,
  ChevronDown,
  LogOut,
  BarChart3,
  ExternalLink,
  Sparkles,
  Phone,
  MapPin,
  Sun,
  Moon,
  CheckCircle2,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

export interface UserProfileBadgeProps {
  className?: string;
  variant?: "stationary" | "admin" | "compact";
  showDropdown?: boolean;
}

export const UserProfileBadge: React.FC<UserProfileBadgeProps> = ({
  className,
  variant = "stationary",
  showDropdown = true,
}) => {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const isDark = theme === "dark";

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!session?.user) {
    return null;
  }

  const isSuperAdmin = session.user.role === "SUPER_ADMIN" || variant === "admin";
  const displayName = isSuperAdmin
    ? "Super Admin"
    : session.user.stationaryName || session.user.username || "Authorized Terminal";
  const username = session.user.username || "user";
  const roleLabel = isSuperAdmin ? "Root Authority" : "Proxy Stationery Agent";

  // Avatar initials / icon
  const getInitials = () => {
    if (isSuperAdmin) return "SA";
    const clean = displayName.replace(/[^a-zA-Z0-9\s]/g, "").trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase() || "DV";
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      {/* Trigger Button / Badge */}
      <button
        type="button"
        onClick={() => showDropdown && setIsOpen(!isOpen)}
        className={cn(
          "group flex items-center gap-2 rounded-xl border transition-all select-none cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-blue-500/50",
          // Synced Card Colors across Light & Dark Mode
          "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800",
          variant === "compact" ? "p-1.5" : "px-2.5 py-1.5",
          isOpen && "border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20",
          className
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="View profile & quick settings"
      >
        {/* Avatar Badge */}
        <div className="relative shrink-0">
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg font-bold text-xs shadow-xs transition-transform group-hover:scale-105",
              isSuperAdmin
                ? "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white"
                : "bg-blue-600/15 text-blue-700 dark:text-blue-400 border border-blue-500/30 dark:bg-blue-500/20"
            )}
          >
            {isSuperAdmin ? "SA" : <Store className="h-3.5 w-3.5" />}
          </div>
          {/* Active status pulse indicator */}
          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
        </div>

        {/* Text Info */}
        {variant !== "compact" && (
          <div className="min-w-0 max-w-[120px] sm:max-w-[170px] text-left">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">
              {displayName}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
              @{username}
            </p>
          </div>
        )}

        {showDropdown && (
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200",
              isOpen && "rotate-180 text-blue-600 dark:text-blue-400"
            )}
          />
        )}
      </button>

      {/* Interactive Dropdown Menu */}
      {showDropdown && isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl z-50 animate-fadeIn space-y-2 text-xs">
          {/* Profile Card Header */}
          <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 p-3 space-y-2">
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl font-bold text-sm shadow-xs",
                  isSuperAdmin
                    ? "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white"
                    : "bg-blue-600/15 text-blue-700 dark:text-blue-400 border border-blue-500/30"
                )}
              >
                {getInitials()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-extrabold text-slate-900 dark:text-white text-xs truncate leading-tight">
                  {displayName}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  @{username}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 dark:border-slate-800/80 text-[10px]">
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                <span>Active Session</span>
              </span>
              <span className="rounded-md bg-blue-500/15 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 font-bold uppercase tracking-wider text-[9px] border border-blue-500/30">
                {session.user.role}
              </span>
            </div>
          </div>

          {/* Quick Action Navigation Links */}
          <div className="space-y-0.5">
            {!isSuperAdmin ? (
              <Link
                href="/analytics"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <BarChart3 className="h-4 w-4 text-emerald-500" />
                <div className="flex-1">
                  <p className="text-xs font-bold leading-tight">Analytics & Settlement</p>
                  <p className="text-[10px] text-slate-400">View filled forms & payment balance</p>
                </div>
              </Link>
            ) : (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Shield className="h-4 w-4 text-purple-500" />
                <div className="flex-1">
                  <p className="text-xs font-bold leading-tight">Admin Control Room</p>
                  <p className="text-[10px] text-slate-400">Manage stationaries & verify entries</p>
                </div>
              </Link>
            )}

            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Sparkles className="h-4 w-4 text-blue-500" />
              <div className="flex-1">
                <p className="text-xs font-bold leading-tight">Entrant Application Form</p>
                <p className="text-[10px] text-slate-400">Open primary registration terminal</p>
              </div>
            </Link>

            {/* Quick Dark / Light Mode Switch inside profile dropdown */}
            <button
              type="button"
              onClick={() => toggleTheme()}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                {isDark ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4 text-indigo-600" />
                )}
                <span>Theme Mode</span>
              </span>
              <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                {isDark ? "Dark" : "Light"}
              </span>
            </button>
          </div>

          {/* Sign Out Button */}
          <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out of Terminal</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
