"use client";

import React, { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { FormInput } from "@/components/ui/FormInput";
import { FormCheckbox } from "@/components/ui/FormCheckbox";
import { cn } from "@/lib/utils";
import { ArrowBigUp } from "lucide-react";

export interface FullNameBlockProps {
  prefix: string; // e.g. "primaryEntrant.name" | "spouse.name" | `children.${index}.name`
  legend?: string;
  amharicLegend?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const FullNameBlock: React.FC<FullNameBlockProps> = ({
  prefix,
  legend = "Full Legal Name",
  amharicLegend = "ሙሉ ህጋዊ ስም",
  description = "Enter the name exactly as it appears on your official passport or national ID (English uppercase only).",
  disabled = false,
  className,
}) => {
  const { setValue, control } = useFormContext();

  const lastNamePath = `${prefix}.lastName`;
  const firstNamePath = `${prefix}.firstName`;
  const middleNamePath = `${prefix}.middleName`;
  const noFirstNamePath = `${prefix}.noFirstName`;
  const noMiddleNamePath = `${prefix}.noMiddleName`;

  // Watch checkbox states reactively
  const noFirstName = useWatch({ control, name: noFirstNamePath });
  const noMiddleName = useWatch({ control, name: noMiddleNamePath });

  // When "No First Name" is checked, immediately clear the first name field
  useEffect(() => {
    if (noFirstName) {
      setValue(firstNamePath, "", { shouldValidate: true, shouldDirty: true });
    }
  }, [noFirstName, firstNamePath, setValue]);

  // When "No Middle Name" is checked, immediately clear the middle name field
  useEffect(() => {
    if (noMiddleName) {
      setValue(middleNamePath, "", { shouldValidate: true, shouldDirty: true });
    }
  }, [noMiddleName, middleNamePath, setValue]);

  return (
    <fieldset
      className={cn(
        "rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4 transition-colors",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <legend className="inline-flex items-center flex-wrap gap-2 text-base font-bold text-slate-900 dark:text-white">
            <span>{legend}</span>
            {amharicLegend && (
              <span className="inline-flex items-center rounded-md bg-indigo-50/90 dark:bg-indigo-950/50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs leading-none">
                {amharicLegend}
              </span>
            )}
          </legend>
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
          )}
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 shadow-2xs">
          <ArrowBigUp className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>CAPS LOCK ON / UPPERCASE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {/* 1. Last / Family Name (Strictly Required, Uppercase) */}
        <div>
          <FormInput
            name={lastNamePath}
            label="Last / Family Name"
            amharicLabel="የአያት / የቤተሰብ ስም"
            placeholder="DOE (የአያት ስም)"
            required
            uppercase
            disabled={disabled}
            description="Strictly required as in official passport."
          />
        </div>

        {/* 2. First / Given Name (Uppercase + No First Name override) */}
        <div className="space-y-2">
          <FormInput
            name={firstNamePath}
            label="First / Given Name"
            amharicLabel="የመጀመሪያ ስም"
            placeholder={noFirstName ? "NO FIRST NAME (የመጀመሪያ ስም የለም)" : "JOHN (የመጀመሪያ ስም)"}
            required={!noFirstName}
            uppercase
            disabled={disabled || Boolean(noFirstName)}
          />
          <FormCheckbox
            name={noFirstNamePath}
            label="No First Name"
            amharicLabel="የመጀመሪያ ስም የለም"
            disabled={disabled}
            onChangeCustom={(checked) => {
              if (checked) {
                setValue(firstNamePath, "", {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }
            }}
          />
        </div>

        {/* 3. Middle Name (Uppercase + No Middle Name override) */}
        <div className="space-y-2">
          <FormInput
            name={middleNamePath}
            label="Middle Name"
            amharicLabel="የአባት ስም"
            placeholder={noMiddleName ? "NO MIDDLE NAME (የአባት ስም የለም)" : "ROBERT (የአባት ስም)"}
            uppercase
            disabled={disabled || Boolean(noMiddleName)}
          />
          <FormCheckbox
            name={noMiddleNamePath}
            label="No Middle Name"
            amharicLabel="የአባት ስም የለም"
            disabled={disabled}
            onChangeCustom={(checked) => {
              if (checked) {
                setValue(middleNamePath, "", {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }
            }}
          />
        </div>
      </div>
    </fieldset>
  );
};
