"use client";

import React, { useState } from "react";
import { useAdmin, formatAgentCredentialsText } from "@/context/AdminContext";
import { AgentUser } from "@/types/admin";
import {
  Store,
  Phone,
  Copy,
  Check,
  Share2,
  Trash2,
  Power,
  Key,
  Calendar,
  Building,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EditAgentModal } from "@/components/admin/EditAgentModal";

export const AgentList: React.FC = () => {
  const { agents, toggleAgentStatus, deleteAgent } = useAdmin();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingAgent, setEditingAgent] = useState<AgentUser | null>(null);

  const handleCopy = (agent: AgentUser) => {
    const text = formatAgentCredentialsText({
      username: agent.username,
      password: agent.password,
      stationaryName: agent.profile.stationaryName,
      phoneNumber: agent.profile.phoneNumber,
    });
    navigator.clipboard.writeText(text);
    setCopiedId(agent.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getWhatsAppLink = (agent: AgentUser) => {
    const text = formatAgentCredentialsText({
      username: agent.username,
      password: agent.password,
      stationaryName: agent.profile.stationaryName,
      phoneNumber: agent.profile.phoneNumber,
    });
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Registered Proxy Stations ({agents.length})
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Manage physical shops & credential access
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {agents.map((agent) => {
          const isCopied = copiedId === agent.id;

          return (
            <div
              key={agent.id}
              className={cn(
                "rounded-2xl border p-4 sm:p-5 transition-all shadow-sm flex flex-col justify-between space-y-3.5",
                agent.isActive
                  ? "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-blue-400 dark:hover:border-slate-700"
                  : "border-slate-200 dark:border-slate-800/60 bg-slate-100 dark:bg-slate-950/60 opacity-70"
              )}
            >
              {/* Top Row: Shop Name & Status */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {agent.profile.stationaryName}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Phone className="h-3 w-3 text-slate-400" />
                      <span>{agent.profile.phoneNumber}</span>
                      {agent.profile.city && (
                        <>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span>{agent.profile.city}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border",
                      agent.isActive
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                        : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30"
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        agent.isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                      )}
                    />
                    <span>{agent.isActive ? "Active" : "Disabled"}</span>
                  </span>
                </div>
              </div>

              {/* Middle Row: Credential Pill Box */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 p-3 text-xs font-mono space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-sans text-[11px]">Username:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold select-all">
                    {agent.username}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-sans text-[11px]">Password:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold select-all">
                    {agent.password || "••••••••••••"}
                  </span>
                </div>
                {agent.profile.subCityDistrict && (
                  <div className="pt-1 text-[10px] text-slate-500 dark:text-slate-400 font-sans border-t border-slate-200 dark:border-slate-800/80">
                    📍 {agent.profile.subCityDistrict}
                  </div>
                )}
              </div>

              {/* Bottom Row: Metrics & Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200 dark:border-slate-800/60 text-xs">
                <div className="text-slate-500 dark:text-slate-400 flex items-center gap-2 text-[11px]">
                  <span>
                    Submissions:{" "}
                    <strong className="text-slate-900 dark:text-white font-bold">
                      {agent.totalSubmissions}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>{agent.lastActive || "Recently"}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCopy(agent)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all",
                      isCopied
                        ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                    )}
                    title="Copy Credentials to Clipboard"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <a
                    href={getWhatsAppLink(agent)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                    title="Send Credentials via WhatsApp"
                  >
                    <Share2 className="h-3 w-3" />
                    <span>WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setEditingAgent(agent)}
                    className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
                    title="Edit Stationery Details"
                  >
                    <Pencil className="h-3 w-3" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleAgentStatus(agent.id)}
                    className="rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    title={agent.isActive ? "Disable Agent" : "Enable Agent"}
                  >
                    <Power className="h-3 w-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteAgent(agent.id)}
                    className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-1 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
                    title="Remove Agent"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Agent Modal */}
      <EditAgentModal
        agent={editingAgent}
        isOpen={!!editingAgent}
        onClose={() => setEditingAgent(null)}
      />
    </div>
  );
};
