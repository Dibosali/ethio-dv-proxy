"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ThemeToggleProps {
  className?: string;
  variant?: "header" | "pill" | "icon";
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  variant = "header",
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        toggleTheme();
      }}
      className={cn(
        "relative flex h-8 sm:h-9 items-center justify-center rounded-xl border transition-all select-none focus:outline-none cursor-pointer",
        isDark
          ? "border-slate-800 bg-slate-900/90 text-amber-400 hover:border-slate-700 hover:bg-slate-800"
          : "border-slate-200 bg-white text-indigo-600 hover:border-slate-300 hover:bg-slate-100 shadow-xs",
        variant === "header" ? "px-2.5 sm:px-3 gap-1.5 sm:gap-2 text-xs font-semibold" : "w-8 sm:w-9 px-0",
        className
      )}
      title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
      aria-label="Toggle theme mode"
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" />
          {variant === "header" && (
            <span className="text-slate-300 font-medium">Light</span>
          )}
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-indigo-600 transition-transform hover:-rotate-12" />
          {variant === "header" && (
            <span className="text-slate-700 dark:text-slate-300 font-medium">Dark</span>
          )}
        </>
      )}
    </button>
  );
};
