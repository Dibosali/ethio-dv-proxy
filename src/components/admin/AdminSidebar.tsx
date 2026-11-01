"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";
import { cn } from "@/lib/utils";
import { EthioDvLogo } from "@/components/ui/EthioDvLogo";
import {
  LayoutDashboard,
  Users,
  FileCheck2,
  Settings,
  Shield,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  amharicTitle?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    amharicTitle: "ዳሽቦርድ",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Agent Management",
    amharicTitle: "የኤጀንት አስተዳደር",
    href: "/admin/agents",
    icon: Users,
    badge: "Active",
  },
  {
    title: "Submissions",
    amharicTitle: "ማመልከቻዎች",
    href: "/admin/submissions",
    icon: FileCheck2,
  },
  {
    title: "Settings",
    amharicTitle: "ቅንብሮች",
    href: "/admin/settings",
    icon: Settings,
  },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Header Bar with Hamburger */}
      <div className="lg:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <EthioDvLogo size="xs" />
          <div>
            <h1 className="text-xs font-bold text-slate-900 dark:text-white tracking-wide">
              Ethio DV Super Admin
            </h1>
            <p className="text-[9px] text-slate-500 dark:text-slate-400">Proxy Gateway Portal</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Retractable Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 shadow-xl transition-all duration-300 ease-in-out lg:static lg:translate-x-0 shrink-0",
          mobileOpen ? "translate-x-0 w-56" : "-translate-x-full",
          // Desktop retracted vs expanded widths
          isSidebarCollapsed ? "lg:w-16" : "lg:w-56"
        )}
      >
        {/* Brand / Logo Header */}
        <div
          className={cn(
            "flex h-14 items-center border-b border-slate-200 dark:border-slate-800/80 px-3 transition-all",
            isSidebarCollapsed ? "justify-center" : "justify-between"
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            {isSidebarCollapsed ? (
              <EthioDvLogo size="xs" />
            ) : (
              <>
                <EthioDvLogo size="xs" />
                <div className="min-w-0 overflow-hidden animate-fadeIn">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900 dark:text-white tracking-tight">
                      ETHIO DV
                    </span>
                    <span className="rounded-full bg-blue-500/15 px-1.5 py-0.2 text-[9px] font-bold text-blue-700 dark:text-blue-400 border border-blue-500/30">
                      SUPER
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                    Control Room
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Retract / Expand Button (Desktop) */}
          <button
            type="button"
            onClick={toggleSidebar}
            className={cn(
              "hidden lg:flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs",
              isSidebarCollapsed && "mt-1"
            )}
            title={isSidebarCollapsed ? "Expand sidebar" : "Retract sidebar"}
            aria-label="Toggle sidebar width"
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="h-3.5 w-3.5" />
            ) : (
              <PanelLeftClose className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-thin">
          {!isSidebarCollapsed && (
            <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Navigation
            </div>
          )}

          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={isSidebarCollapsed ? item.title : undefined}
                className={cn(
                  "group relative flex items-center rounded-xl transition-all duration-150 select-none",
                  isSidebarCollapsed
                    ? "justify-center h-10 w-full"
                    : "justify-between px-2.5 py-2 text-xs font-medium",
                  active
                    ? "bg-blue-50 dark:bg-blue-600/20 text-blue-700 dark:text-white border border-blue-200 dark:border-blue-500/40 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <div
                  className={cn(
                    "flex items-center",
                    isSidebarCollapsed ? "justify-center" : "gap-2"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg transition-colors shrink-0",
                      active
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>

                  {!isSidebarCollapsed && (
                    <div className="min-w-0">
                      <span className="block leading-tight font-semibold truncate text-xs">
                        {item.title}
                      </span>
                      {item.amharicTitle && (
                        <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-normal">
                          {item.amharicTitle}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {!isSidebarCollapsed && (
                  <div className="flex items-center gap-1">
                    {item.badge && (
                      <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        {item.badge}
                      </span>
                    )}
                    {active && <ChevronRight className="h-3.5 w-3.5 text-blue-500" />}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom User Profile */}
        <div className="border-t border-slate-200 dark:border-slate-800/80 p-2 space-y-1.5 bg-slate-50/60 dark:bg-slate-950/80">
          {!isSidebarCollapsed ? (
            <>
              <Link
                href="/"
                target="_blank"
                className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  <span>Public Form</span>
                </span>
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </Link>

              <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 p-1.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-[10px] font-bold text-white shadow-xs">
                  SA
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-bold text-slate-900 dark:text-white leading-tight">
                    Super Admin
                  </p>
                  <p className="truncate text-[9px] text-slate-500 dark:text-slate-400 font-medium">Root Authority</p>
                </div>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-0.5">
              <Link
                href="/"
                target="_blank"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Open Public Form"
              >
                <ExternalLink className="h-3 w-3" />
              </Link>
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white shadow-xs"
                title="Super Admin (Root)"
              >
                SA
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
