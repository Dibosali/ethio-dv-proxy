"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useAdmin,
  generateSecurePassword,
  formatAgentCredentialsText,
} from "@/context/AdminContext";
import { AgentUser } from "@/types/admin";
import {
  KeyRound,
  Store,
  Phone,
  User,
  Sparkles,
  Copy,
  Check,
  Eye,
  EyeOff,
  Send,
  Share2,
  Building,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createProxyAgent } from "@/actions/agent";

const createAgentSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and dashes"
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
  stationaryName: z
    .string()
    .trim()
    .min(2, "Stationary / Business Name is required"),
  phoneNumber: z
    .string()
    .trim()
    .min(9, "Valid contact phone number is required"),
  city: z.string().trim().optional(),
  subCityDistrict: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

type CreateAgentFormData = z.infer<typeof createAgentSchema>;

export interface CreateAgentFormProps {
  onSuccess?: (agent: AgentUser) => void;
  className?: string;
}

export const CreateAgentForm: React.FC<CreateAgentFormProps> = ({
  onSuccess,
  className,
}) => {
  const { addAgent } = useAdmin();
  const [showPassword, setShowPassword] = useState(false);
  const [createdAgent, setCreatedAgent] = useState<AgentUser | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [savedToDb, setSavedToDb] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAgentFormData>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      username: "",
      password: "",
      stationaryName: "",
      phoneNumber: "+251 ",
      city: "Addis Ababa",
      subCityDistrict: "",
      notes: "",
    },
  });

  const watchedStationary = watch("stationaryName");
  const watchedPassword = watch("password");

  // Auto-generate strong secure password
  const handleAutoGeneratePassword = () => {
    const pwd = generateSecurePassword(14);
    setValue("password", pwd, { shouldValidate: true, shouldDirty: true });
    setShowPassword(true);
  };

  // Auto-generate username from stationary name
  const handleSuggestUsername = () => {
    if (!watchedStationary) return;
    const cleanSlug = watchedStationary
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 18);
    setValue("username", `${cleanSlug}_dv`, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onSubmit = async (data: CreateAgentFormData) => {
    setServerError(null);
    setIsSubmittingAction(true);

    try {
      // 1. Call Super Admin Server Action to write to remote Neon PostgreSQL
      const response = await createProxyAgent({
        username: data.username,
        password: data.password,
        stationaryName: data.stationaryName,
        phoneNumber: data.phoneNumber,
        city: data.city,
        subCityDistrict: data.subCityDistrict,
        notes: data.notes,
      });

      if (!response.success) {
        setServerError(response.error || "Failed to create proxy agent in database.");
        setIsSubmittingAction(false);
        return;
      }

      const realId = (response.data as any)?.id || `agt-${Date.now()}`;
      setSavedToDb(true);

      const newAgent = addAgent({
        id: realId,
        username: data.username,
        password: data.password,
        isActive: true,
        profile: {
          stationaryName: data.stationaryName,
          phoneNumber: data.phoneNumber,
          city: data.city,
          subCityDistrict: data.subCityDistrict,
          notes: data.notes,
        },
      });

      setCreatedAgent(newAgent);
      setIsCopied(false);
      if (onSuccess) {
        onSuccess(newAgent);
      }
    } catch (err: any) {
      console.error("Agent creation failed:", err);
      setServerError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleCopyCredentials = (agent: AgentUser) => {
    const text = formatAgentCredentialsText({
      username: agent.username,
      password: agent.password,
      stationaryName: agent.profile.stationaryName,
      phoneNumber: agent.profile.phoneNumber,
    });

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const getWhatsAppShareLink = (agent: AgentUser) => {
    const text = formatAgentCredentialsText({
      username: agent.username,
      password: agent.password,
      stationaryName: agent.profile.stationaryName,
      phoneNumber: agent.profile.phoneNumber,
    });
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Success Modal / Banner after agent generation */}
      {createdAgent && (
        <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-50 via-white to-slate-50 dark:from-emerald-950/60 dark:via-slate-900 dark:to-slate-950 p-6 sm:p-7 shadow-xl shadow-emerald-950/10 dark:shadow-emerald-950/30 space-y-5 animate-fadeIn">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Proxy Agent Created Successfully!
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-400/90">
                  Ready to share credentials with{" "}
                  <strong>{createdAgent.profile.stationaryName}</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setCreatedAgent(null);
                reset();
              }}
              className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white underline cursor-pointer"
            >
              Create Another Agent
            </button>
          </div>

          {/* Formatted Credential Card */}
          <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/90 p-4 font-mono text-xs text-slate-800 dark:text-slate-200 space-y-2.5 shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  // AGENT ACCESS PAYLOAD
                </span>
                {savedToDb ? (
                  <span className="rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 text-[10px] font-sans border border-emerald-500/30">
                    Neon PostgreSQL Synced
                  </span>
                ) : (
                  <span className="rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 text-[10px] font-sans border border-amber-500/30">
                    Local Session
                  </span>
                )}
              </div>
              <span>ID: {createdAgent.id}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Stationary / Shop:</span>
                <p className="font-bold text-slate-900 dark:text-white">
                  {createdAgent.profile.stationaryName}
                </p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Username:</span>
                <p className="font-bold text-blue-600 dark:text-blue-400">
                  {createdAgent.username}
                </p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Password:</span>
                <p className="font-bold text-amber-600 dark:text-amber-400 select-all">
                  {createdAgent.password}
                </p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Registered Phone:</span>
                <p className="font-bold text-slate-900 dark:text-white">
                  {createdAgent.profile.phoneNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Actions: Copy & WhatsApp Share */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => handleCopyCredentials(createdAgent)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-md focus:outline-none cursor-pointer",
                isCopied
                  ? "bg-emerald-500 text-white shadow-emerald-500/20"
                  : "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20"
              )}
            >
              {isCopied ? (
                <>
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>Credentials Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Credentials</span>
                </>
              )}
            </button>

            <a
              href={getWhatsAppShareLink(createdAgent)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 px-5 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors shadow-2xs"
            >
              <Share2 className="h-4 w-4" />
              <span>Share via WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 sm:p-8 shadow-xl space-y-6"
      >
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Register New Proxy Agent
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate secure terminal credentials for physical shops, cyber
                centers, and stationary stores.
              </p>
            </div>
          </div>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/30 p-4 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Creation Error</p>
              <p className="text-rose-600 dark:text-rose-300/90 mt-0.5">{serverError}</p>
            </div>
          </div>
        )}

        {/* Section 1: Agent Business Profile */}
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            1. Stationary / Business Profile
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Stationary Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <label
                htmlFor="stationaryName"
                className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                <span>Stationary / Business Name *</span>
                {watchedStationary && (
                  <button
                    type="button"
                    onClick={handleSuggestUsername}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-normal cursor-pointer"
                  >
                    Suggest Username from Name
                  </button>
                )}
              </label>
              <div className="relative">
                <input
                  id="stationaryName"
                  type="text"
                  placeholder="e.g. Bole Star Stationery & Cyber Center"
                  {...register("stationaryName")}
                  className={cn(
                    "w-full rounded-xl border bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-slate-900 transition-colors",
                    errors.stationaryName
                      ? "border-red-500 focus:ring-red-500/30"
                      : "border-slate-300 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/20"
                  )}
                />
              </div>
              {errors.stationaryName && (
                <p className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errors.stationaryName.message}</span>
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label
                htmlFor="phoneNumber"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Primary Phone Number *
              </label>
              <div className="relative">
                <input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+251 91 123 4567"
                  {...register("phoneNumber")}
                  className={cn(
                    "w-full rounded-xl border bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-slate-900 transition-colors",
                    errors.phoneNumber
                      ? "border-red-500 focus:ring-red-500/30"
                      : "border-slate-300 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/20"
                  )}
                />
              </div>
              {errors.phoneNumber && (
                <p className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errors.phoneNumber.message}</span>
                </p>
              )}
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <label
                htmlFor="city"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                City / Region
              </label>
              <input
                id="city"
                type="text"
                placeholder="e.g. Addis Ababa"
                {...register("city")}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Sub-City / District */}
            <div className="space-y-1.5 sm:col-span-2">
              <label
                htmlFor="subCityDistrict"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Physical Shop Address / Landmark
              </label>
              <input
                id="subCityDistrict"
                type="text"
                placeholder="e.g. Bole Sub-City, Next to Edna Mall, Ground Floor"
                {...register("subCityDistrict")}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Terminal Access Credentials */}
        <div className="space-y-4 pt-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            2. Terminal Credentials
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Username */}
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Agent Username *
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  placeholder="e.g. bole_star_dv"
                  {...register("username")}
                  className={cn(
                    "w-full rounded-xl border bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-slate-900 transition-colors",
                    errors.username
                      ? "border-red-500 focus:ring-red-500/30"
                      : "border-slate-300 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/20"
                  )}
                />
              </div>
              {errors.username && (
                <p className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errors.username.message}</span>
                </p>
              )}
            </div>

            {/* Password + Auto-generate button */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Access Password *
                </label>
                <button
                  type="button"
                  onClick={handleAutoGeneratePassword}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 transition-colors cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Auto-generate Secure</span>
                </button>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter or generate password"
                  {...register("password")}
                  className={cn(
                    "w-full rounded-xl border bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 pr-10 text-sm text-slate-900 dark:text-white font-mono placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-slate-900 transition-colors",
                    errors.password
                      ? "border-red-500 focus:ring-red-500/30"
                      : "border-slate-300 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/20"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errors.password.message}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Notes (Optional) */}
        <div className="space-y-1.5 pt-1">
          <label htmlFor="notes" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Stationary Verification Notes (Internal Admin Use)
          </label>
          <textarea
            id="notes"
            rows={2}
            placeholder="e.g. Verified trade license, certified passport photo camera on site..."
            {...register("notes")}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800/80">
          <button
            type="submit"
            disabled={isSubmitting || isSubmittingAction}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
          >
            {isSubmitting || isSubmittingAction ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Saving to Neon Database...</span>
              </>
            ) : (
              <>
                <KeyRound className="h-4 w-4" />
                <span>Generate & Save Agent Credentials</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
