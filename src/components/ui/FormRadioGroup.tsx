"use client";

import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { getNestedError } from "./FormInput";

export interface RadioOption {
  value: string;
  label: string;
  amharicLabel?: string;
  description?: string;
}

export interface FormRadioGroupProps {
  name: string;
  label?: React.ReactNode;
  amharicLabel?: string;
  options: RadioOption[];
  orientation?: "vertical" | "horizontal";
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const FormRadioGroup: React.FC<FormRadioGroupProps> = ({
  name,
  label,
  amharicLabel,
  options,
  orientation = "vertical",
  description,
  required,
  disabled,
  className,
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const errorMessage = getNestedError(errors, name);
  const groupId = `radiogroup-${name.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  const labelId = `${groupId}-label`;
  const errorId = `${groupId}-error`;
  const descId = `${groupId}-desc`;

  return (
    <div
      role="radiogroup"
      aria-labelledby={label ? labelId : undefined}
      aria-describedby={
        errorMessage ? errorId : description ? descId : undefined
      }
      aria-invalid={Boolean(errorMessage)}
      className={cn("w-full space-y-2", className)}
    >
      {label && (
        <div id={labelId} className="inline-flex items-center flex-wrap gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
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
        </div>
      )}

      {description && !errorMessage && (
        <p id={descId} className="text-xs text-slate-500 leading-relaxed">
          {description}
        </p>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div
            className={cn(
              "gap-2.5",
              orientation === "horizontal"
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                : "flex flex-col"
            )}
          >
            {options.map((option) => {
              const isSelected = field.value === option.value;
              const optionId = `${groupId}-${option.value}`;

              return (
                <label
                  key={option.value}
                  htmlFor={optionId}
                  className={cn(
                    "relative flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-all text-sm select-none",
                    isSelected
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 shadow-sm ring-1 ring-blue-600"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700",
                    disabled && "cursor-not-allowed opacity-50 bg-slate-100 dark:bg-slate-900 hover:bg-slate-100"
                  )}
                >
                  <input
                    type="radio"
                    id={optionId}
                    name={field.name}
                    value={option.value}
                    checked={isSelected}
                    disabled={disabled}
                    onChange={() => field.onChange(option.value)}
                    onBlur={field.onBlur}
                    className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 border-slate-300 dark:border-slate-700 focus:ring-blue-500 focus:ring-offset-0 disabled:cursor-not-allowed"
                  />
                  <div className="flex flex-col">
                    <div className="inline-flex items-center flex-wrap gap-1.5 font-semibold">
                      <span className={isSelected ? "text-blue-950 dark:text-blue-300 font-bold" : "text-slate-800 dark:text-slate-200"}>
                        {option.label}
                      </span>
                      {option.amharicLabel && (
                        <span className="inline-flex items-center rounded-md bg-indigo-50/90 dark:bg-indigo-950/50 px-1.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60 shadow-2xs leading-none">
                          {option.amharicLabel}
                        </span>
                      )}
                    </div>
                    {option.description && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {option.description}
                      </span>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}
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
