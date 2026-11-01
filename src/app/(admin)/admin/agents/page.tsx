"use client";

import React, { useState } from "react";
import { CreateAgentForm } from "@/components/admin/CreateAgentForm";
import { AgentList } from "@/components/admin/AgentList";
import { useAdmin } from "@/context/AdminContext";
import {
  Users,
  UserPlus,
  Store,
  FileCheck2,
  ShieldCheck,
  Sparkles,
  HelpCircle,
} from "lucide-react";

export default function AgentManagementPage() {
  const { agents } = useAdmin();
  const [activeTab, setActiveTab] = useState<"list" | "create">("create");

  const totalActive = agents.filter((a) => a.isActive).length;
  const totalSubmissions = agents.reduce(
    (sum, a) => sum + (a.totalSubmissions || 0),
    0
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Proxy Agent Management
            </h1>
            <span className="rounded-lg bg-blue-500/10 px-2 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
              የኤጀንት አስተዳደር
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Provision secure credentials, monitor physical proxy stationaries, and share access keys.
          </p>
        </div>

        {/* Tab Toggle for Mobile/Desktop */}
        <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("create")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "create"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>Create Agent</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "list"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Store className="h-4 w-4" />
            <span>Stationary Directory ({agents.length})</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Active Stations
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Store className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{totalActive}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">/ {agents.length} registered</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Forms Processed
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
              <FileCheck2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {totalSubmissions}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">+14 today</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Top Stationary
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
              Bole Star Stationery
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">42 submissions</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Security Protocol
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              14-Char Random Entropy
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">SHA-256 Hashing Ready</p>
          </div>
        </div>
      </div>

      {/* Main Content Area based on Tab */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form or List */}
        <div className="xl:col-span-7 space-y-6">
          {activeTab === "create" ? (
            <div className="space-y-4">
              <CreateAgentForm
                onSuccess={() => {
                  // Keep on create or give option to view
                }}
              />
            </div>
          ) : (
            <AgentList />
          )}
        </div>

        {/* Right Column: Always keep the opposite for multi-tasking on wide screens */}
        <div className="xl:col-span-5 space-y-6">
          {activeTab === "create" ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 p-5 space-y-3 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Agent Provisioning Guidelines</span>
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
                  <li>
                    <strong>Stationary Name:</strong> Enter the exact registered business name (e.g., <em>Bole Star Stationery</em>).
                  </li>
                  <li>
                    <strong>Password Generator:</strong> Click <em>Auto-generate Secure</em> to produce high-entropy credentials that protect entrant records.
                  </li>
                  <li>
                    <strong>Sharing:</strong> Click <em>Copy Credentials</em> or <em>Share via WhatsApp</em> to immediately deliver credentials to the shop operator.
                  </li>
                  <li>
                    <strong>Account Status:</strong> Disabled agents cannot submit entrant forms through the proxy gateway.
                  </li>
                </ul>
              </div>

              {/* Show top registered stations preview */}
              <AgentList />
            </div>
          ) : (
            <div className="space-y-4">
              <CreateAgentForm />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
