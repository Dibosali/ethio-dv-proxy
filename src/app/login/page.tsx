"use client";

import React, { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { EthioDvLogo } from "@/components/ui/EthioDvLogo";
import {
  Shield,
  KeyRound,
  Store,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in, redirect based on role
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      if (session.user.role === "SUPER_ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password) {
      setErrorMessage("Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        username: username.trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMessage(res.error);
        setLoading(false);
      } else if (res?.ok) {
        // Query session to route to proper portal
        // NextAuth will update session, triggering the useEffect above or fallback
        const callback = searchParams.get("callbackUrl");
        if (callback && !callback.includes("/login")) {
          router.push(callback);
        } else {
          router.refresh();
        }
      } else {
        setErrorMessage("Authentication failed. Please check your credentials.");
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  const handleQuickFill = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      {/* Top Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 sticky top-0 z-20 backdrop-blur-md px-4 sm:px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <EthioDvLogo size="sm" priority />
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Ethio DV Proxy Portal
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Official Proxy Terminal & Super Admin Portal
              </p>
            </div>
          </div>

          <ThemeToggle variant="header" />
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="max-w-md w-full space-y-6">
          {/* Card */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl dark:shadow-2xl space-y-6">
            {/* Header / Seal */}
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-1">
                <EthioDvLogo size="lg" priority />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Authorized Terminal Login
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                Sign in with credentials issued by the Super Admin to access the entrant application form or control room.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="flex items-start gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-xs text-rose-700 dark:text-rose-300 animate-fadeIn">
                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="username"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Terminal Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. bole_star_stationery or superadmin"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter terminal password"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/25 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Terminal</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>Quick Fill Demo Credentials</span>
              </div>

              <div className="grid grid-cols-1 gap-2 text-xs">
                {/* Super Admin */}
                <button
                  type="button"
                  onClick={() =>
                    handleQuickFill("superadmin", "SuperAdmin2026!")
                  }
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-blue-400 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold text-[10px]">
                      SA
                    </span>
                    <div className="min-w-0 truncate">
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">
                        Super Admin
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        superadmin
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                    Fill & Log In →
                  </span>
                </button>

                {/* Proxy Agent: Bole Star */}
                <button
                  type="button"
                  onClick={() =>
                    handleQuickFill(
                      "bole_star_stationery",
                      "Dv2026#BoleStar9!"
                    )
                  }
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-blue-400 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold text-[10px]">
                      BS
                    </span>
                    <div className="min-w-0 truncate">
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">
                        Bole Star Stationery & Cyber
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        bole_star_stationery
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                    Fill & Log In →
                  </span>
                </button>

                {/* Proxy Agent: Kazanchis */}
                <button
                  type="button"
                  onClick={() =>
                    handleQuickFill(
                      "kazanchis_express_dv",
                      "Dv2026#KazExp4$"
                    )
                  }
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-blue-400 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                      KE
                    </span>
                    <div className="min-w-0 truncate">
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">
                        Kazanchis Express Photo & Print
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        kazanchis_express_dv
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                    Fill & Log In →
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>Electronic Diversity Visa Proxy System • Restricted Authorization Area</p>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-3">
            <div className="h-9 w-9 rounded-full border-3 border-blue-600 border-t-transparent animate-spin" />
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Loading Authentication Portal...
            </p>
          </div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
