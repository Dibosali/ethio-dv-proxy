"use client";

import React, { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { FullNameBlock } from "./FullNameBlock";
import { DateOfBirthBlock } from "./DateOfBirthBlock";
import { FormInput } from "@/components/ui/FormInput";
import { FormSelect } from "@/components/ui/FormSelect";
import { FormRadioGroup } from "@/components/ui/FormRadioGroup";
import { FormCheckbox } from "@/components/ui/FormCheckbox";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { COUNTRIES } from "@/lib/constants/countries";
import { cn } from "@/lib/utils";
import { User, LucideIcon } from "lucide-react";

export interface DerivativePersonBlockProps {
  prefix: string; // e.g. "spouse" | `children.${index}`
  title: string;
  amharicTitle?: string;
  subtitle?: string;
  icon?: LucideIcon;
  photoLabel?: string;
  amharicPhotoLabel?: string;
  disabled?: boolean;
  className?: string;
}

export const DerivativePersonBlock: React.FC<DerivativePersonBlockProps> = ({
  prefix,
  title,
  amharicTitle,
  subtitle,
  icon: HeaderIcon = User,
  photoLabel = "Photograph",
  amharicPhotoLabel = "ፎቶግራፍ",
  disabled = false,
  className,
}) => {
  const { setValue, control } = useFormContext();

  const birthCityPath = `${prefix}.birthCity`;
  const birthCityUnknownPath = `${prefix}.birthCityUnknown`;

  // Watch Birth City Unknown
  const birthCityUnknown = useWatch({
    control,
    name: birthCityUnknownPath,
  });

  // Reactive Effect: When Birth City Unknown is checked, clear the input
  useEffect(() => {
    if (birthCityUnknown) {
      setValue(birthCityPath, "", {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [birthCityUnknown, birthCityPath, setValue]);

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn transition-colors",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3.5 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shrink-0">
          <HeaderIcon className="h-6 w-6" />
        </div>
        <div>
          <h3 className="inline-flex items-center flex-wrap gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <span>{title}</span>
            {amharicTitle && (
              <span className="inline-flex items-center rounded-md bg-indigo-50/90 dark:bg-indigo-950/50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs leading-none">
                {amharicTitle}
              </span>
            )}
          </h3>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* 1. Name */}
      <FullNameBlock
        prefix={`${prefix}.name`}
        legend="Full Legal Name"
        amharicLegend="ሙሉ ህጋዊ ስም"
        description="Must match the derivative applicant's official passport or birth certificate."
        disabled={disabled}
      />

      {/* 2. Gender */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-4.5 space-y-2">
        <FormRadioGroup
          name={`${prefix}.gender`}
          label="Gender"
          amharicLabel="ጾታ"
          orientation="horizontal"
          options={[
            { value: "MALE", label: "Male", amharicLabel: "ወንድ" },
            { value: "FEMALE", label: "Female", amharicLabel: "ሴት" },
          ]}
          required
          disabled={disabled}
        />
      </div>

      {/* 3. Date of Birth */}
      <DateOfBirthBlock
        prefix={`${prefix}.dob`}
        legend="Date of Birth"
        amharicLegend="የትውልድ ቀን"
        description="Format: Month, Day, Year as indicated on the official birth certificate."
        disabled={disabled}
      />

      {/* 4. Birth City & Birth Country */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        {/* Birth City */}
        <div className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-4.5">
          <FormInput
            name={birthCityPath}
            label="City of Birth"
            amharicLabel="የተወለዱበት ከተማ"
            placeholder={
              birthCityUnknown ? "Birth City Unknown" : "e.g. Hawassa (የተወለዱበት ከተማ)"
            }
            required={!birthCityUnknown}
            disabled={disabled || Boolean(birthCityUnknown)}
            description="Enter city/town only. Do not enter country or district."
          />

          <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <FormCheckbox
              name={birthCityUnknownPath}
              label="Birth City Unknown"
              amharicLabel="የተወለዱበት ከተማ አይታወቅም"
              disabled={disabled}
              onChangeCustom={(checked) => {
                if (checked) {
                  setValue(birthCityPath, "", {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }
              }}
            />
          </div>
        </div>

        {/* Birth Country */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-4.5">
          <FormSelect
            name={`${prefix}.birthCountry`}
            label="Country of Birth"
            amharicLabel="የተወለዱበት አገር"
            placeholder="Select Country of Birth (የተወለዱበትን አገር ይምረጡ)"
            options={COUNTRIES}
            required
            disabled={disabled}
            description="Use current name of country where place of birth is located."
          />
        </div>
      </div>

      {/* 5. Photograph */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-4.5">
        <ImageUploader
          name={`${prefix}.photo`}
          label={`${photoLabel} (${amharicPhotoLabel})`}
          description="Recent color photograph taken within the last 6 months complying with DV photo requirements."
          aspectRatioLabel="600x600 px square"
          required
          disabled={disabled}
        />
      </div>
    </div>
  );
};
