"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import {
  Bell,
  Check,
  CheckCheck,
  FileCheck2,
  Store,
  Clock,
  X,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const NotificationBell: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotification,
  } = useAdmin();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border transition-all focus:outline-none cursor-pointer",
          isOpen
            ? "border-blue-500 bg-blue-600/20 text-blue-500 dark:text-blue-400 shadow-md shadow-blue-500/20"
            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white shadow-xs"
        )}
        aria-label="Open notifications menu"
        aria-expanded={isOpen}
      >
        <Bell className="h-4.5 w-4.5 sm:h-5 sm:w-5" />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white shadow-md shadow-red-500/40 ring-2 ring-white dark:ring-slate-950 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu - 100% Solid Opaque Background */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl z-50 overflow-hidden animate-fadeIn">
          {/* Header - Solid Opaque */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 py-3 bg-slate-50 dark:bg-slate-950">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Notifications</span>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-red-500/15 dark:bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400 border border-red-500/30">
                  {unreadCount} unread
                </span>
              ) : (
                <span className="rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  All caught up
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsAsRead}
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
                <Bell className="h-8 w-8 mx-auto text-slate-400 dark:text-slate-600 stroke-[1.5]" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationAsRead(notif.id)}
                  className={cn(
                    "group relative p-3.5 transition-colors cursor-pointer flex items-start gap-3",
                    notif.isRead
                      ? "bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 opacity-80"
                      : "bg-blue-50/60 dark:bg-blue-950/25 hover:bg-blue-100/60 dark:hover:bg-blue-950/40"
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border mt-0.5",
                      notif.type === "SUBMISSION"
                        ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30"
                        : "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30"
                    )}
                  >
                    {notif.type === "SUBMISSION" ? (
                      <FileCheck2 className="h-4 w-4" />
                    ) : (
                      <Store className="h-4 w-4" />
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">
                        {notif.title}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="h-2.5 w-2.5" />
                          <span>{notif.relativeTime}</span>
                        </span>
                        {!notif.isRead && (
                          <span
                            className="h-2 w-2 rounded-full bg-blue-500"
                            title="Unread"
                          />
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug font-normal">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50">
                        <Store className="h-2.5 w-2.5 text-slate-500 dark:text-slate-400" />
                        <span className="truncate max-w-[150px]">
                          {notif.stationaryName}
                        </span>
                      </span>

                      {notif.submissionId && (
                        <Link
                          href={`/admin/submissions/${notif.submissionId}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            markNotificationAsRead(notif.id);
                            setIsOpen(false);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 hover:underline"
                        >
                          <span>Review Form</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Clear Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(notif.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition-opacity"
                    title="Dismiss"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer - Solid Opaque */}
          <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-time submission webhook listener</span>
            </span>
            <Link
              href="/admin/submissions"
              onClick={() => setIsOpen(false)}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              All submissions →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
