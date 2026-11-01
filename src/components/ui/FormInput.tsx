"use client";

import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { AlertCircle, ArrowBigUp } from "lucide-react";

export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: React.ReactNode;
  amharicLabel?: string;
  description?: string;
  required?: boolean;
  uppercase?: boolean; // Forces input typing and stored value to uppercase
}

// Utility to retrieve nested errors like "primaryEntrant.name.lastName" or "children.0.name.lastName"
export function getNestedError(obj: any, path: string): string | undefined {
  if (!obj || !path) return undefined;
  const parts = path.split(/[.[\]]+/).filter(Boolean);
  let current = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    current = current[part];
  }
  if (typeof current === "string") return current;
  return current?.message;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      name,
      label,
      amharicLabel,
      description,
      required,
      type = "text",
      placeholder,
      disabled,
      uppercase = false,
      className,
      ...props
    },
    ref
  ) => {
    const {
      register,
      formState: { errors },
    } = useFormContext();

    const [isCapsLockPhysical, setIsCapsLockPhysical] = useState<boolean>(false);
    const [isFocused, setIsFocused] = useState<boolean>(false);

    const errorMessage = getNestedError(errors, name);
    const inputId = `field-${name.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
    const errorId = `${inputId}-error`;
    const descId = `${inputId}-desc`;

    const registered = register(name, {
      valueAsNumber: type === "number",
    });

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (typeof e.getModifierState === "function") {
        setIsCapsLockPhysical(e.getModifierState("CapsLock"));
      }
      props.onKeyDown?.(e);
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (typeof e.getModifierState === "function") {
        setIsCapsLockPhysical(e.getModifierState("CapsLock"));
      }
      props.onKeyUp?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (uppercase && typeof e.target.value === "string") {
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;
        // Transform the value to uppercase immediately
        e.target.value = e.target.value.toUpperCase();
        registered.onChange(e);
        // Preserve caret position
        if (start !== null && end !== null) {
          e.target.setSelectionRange(start, end);
        }
      } else {
        registered.onChange(e);
      }
      props.onChange?.(e);
    };

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <label
              htmlFor={inputId}
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

            {uppercase && (
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded border border-blue-200/60 dark:border-blue-800/50">
                UPPERCASE
              </span>
            )}
          </div>
        )}

        <div className="relative">
          <input
            id={inputId}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            autoCapitalize={uppercase ? "characters" : props.autoCapitalize}
            autoCorrect={uppercase ? "off" : props.autoCorrect}
            spellCheck={uppercase ? false : props.spellCheck}
            aria-invalid={Boolean(errorMessage)}
            aria-describedby={
              errorMessage ? errorId : description ? descId : undefined
            }
            {...registered}
            {...props}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onChange={handleChange}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              registered.onBlur(e);
              props.onBlur?.(e);
            }}
            className={cn(
              "w-full rounded-lg border bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:border-slate-200 dark:disabled:border-slate-700",
              uppercase && "uppercase tracking-wide font-medium pr-16",
              errorMessage
                ? "border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-950"
                : "border-slate-300 dark:border-slate-700 focus:border-blue-600 focus:ring-blue-100 dark:focus:ring-blue-900/40 hover:border-slate-400 dark:hover:border-slate-600",
              className
            )}
          />

          {uppercase && (
            <div
              className={cn(
                "pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase transition-all shadow-2xs",
                isFocused || isCapsLockPhysical
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              )}
              title="Caps Lock / Uppercase Enforced"
            >
              <ArrowBigUp className="h-3 w-3 stroke-[2.5]" />
              <span>CAPS</span>
            </div>
          )}
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

FormInput.displayName = "FormInput";
