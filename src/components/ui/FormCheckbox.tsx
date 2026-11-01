"use client";

import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Check, AlertCircle } from "lucide-react";
import { getNestedError } from "./FormInput";

export interface FormCheckboxProps {
  name: string;
  label: React.ReactNode;
  amharicLabel?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  onChangeCustom?: (checked: boolean) => void;
}

export const FormCheckbox: React.FC<FormCheckboxProps> = ({
  name,
  label,
  amharicLabel,
  description,
  disabled,
  className,
  onChangeCustom,
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const errorMessage = getNestedError(errors, name);
  const checkboxId = `checkbox-${name.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  const errorId = `${checkboxId}-error`;
  const descId = `${checkboxId}-desc`;

  return (
    <div className={cn("w-full space-y-1", className)}>
      <Controller
        name={name}
        control={control}
        defaultValue={false}
        render={({ field }) => {
          const isChecked = Boolean(field.value);

          return (
            <label
              htmlFor={checkboxId}
              className={cn(
                "group flex cursor-pointer items-start gap-2.5 select-none",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              <div className="relative mt-0.5 flex items-center justify-center">
                <input
                  type="checkbox"
                  id={checkboxId}
                  checked={isChecked}
                  disabled={disabled}
                  aria-invalid={Boolean(errorMessage)}
                  aria-describedby={
                    errorMessage ? errorId : description ? descId : undefined
                  }
                  onChange={(e) => {
                    const nextVal = e.target.checked;
                    field.onChange(nextVal);
                    if (onChangeCustom) {
                      onChangeCustom(nextVal);
                    }
                  }}
                  onBlur={field.onBlur}
                  className="peer sr-only"
                />
                <div
                  className={cn(
                    "h-4 w-4 rounded border transition-all flex items-center justify-center",
                    isChecked
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 group-hover:border-slate-400 dark:group-hover:border-slate-600 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-1",
                    disabled && "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400"
                  )}
                >
                  {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
              </div>

              <div className="text-sm">
                <div className="inline-flex items-center flex-wrap gap-1.5">
                  <span
                    className={cn(
                      "font-semibold text-slate-700 dark:text-slate-300",
                      isChecked && "text-slate-900 dark:text-white"
                    )}
                  >
                    {label}
                  </span>
                  {amharicLabel && (
                    <span className="inline-flex items-center rounded-md bg-indigo-50/90 dark:bg-indigo-950/50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs leading-none">
                      {amharicLabel}
                    </span>
                  )}
                </div>
                {description && (
                  <p id={descId} className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            </label>
          );
        }}
      />

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
};
