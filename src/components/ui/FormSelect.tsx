"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { AlertCircle, ChevronDown } from "lucide-react";
import { getNestedError } from "./FormInput";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  name: string;
  label?: React.ReactNode;
  amharicLabel?: string;
  options: SelectOption[];
  placeholder?: string;
  description?: string;
  required?: boolean;
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      name,
      label,
      amharicLabel,
      options,
      placeholder = "-- Select an option --",
      description,
      required,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const {
      register,
      formState: { errors },
    } = useFormContext();

    const errorMessage = getNestedError(errors, name);
    const selectId = `select-${name.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
    const errorId = `${selectId}-error`;
    const descId = `${selectId}-desc`;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="inline-flex items-center flex-wrap gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200"
          >
            <span>{label}</span>
            {amharicLabel && (
              <span className="inline-flex items-center rounded-md bg-indigo-50/90 dark:bg-indigo-950/50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs leading-none">
                {amharicLabel}
              </span>
            )}
            {required && (
              <span className="text-red-500 font-bold ml-0.5" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          <select
            id={selectId}
            disabled={disabled}
            aria-invalid={Boolean(errorMessage)}
            aria-describedby={
              errorMessage ? errorId : description ? descId : undefined
            }
            {...register(name)}
            {...props}
            className={cn(
              "w-full appearance-none rounded-lg border bg-white dark:bg-slate-900 px-3.5 py-2.5 pr-10 text-sm text-slate-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:border-slate-200 dark:disabled:border-slate-700",
              errorMessage
                ? "border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-950"
                : "border-slate-300 dark:border-slate-700 focus:border-blue-600 focus:ring-blue-100 dark:focus:ring-blue-900/40 hover:border-slate-400 dark:hover:border-slate-600",
              className
            )}
          >
            {placeholder && (
              <option value="" disabled className="text-slate-400 dark:text-slate-500">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 dark:text-slate-400">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

        {description && !errorMessage && (
          <p id={descId} className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {description}
          </p>
        )}

        {errorMessage && (
          <p
            id={errorId}
            role="alert"
            className="flex items-center gap-1.5 text-xs font-medium text-red-600 animate-fadeIn"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect";
