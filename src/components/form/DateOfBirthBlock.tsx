"use client";

import React from "react";
import { FormInput } from "@/components/ui/FormInput";
import { FormSelect } from "@/components/ui/FormSelect";
import { cn } from "@/lib/utils";

export interface DateOfBirthBlockProps {
  prefix: string; // e.g. "primaryEntrant.dob" | "spouse.dob" | `children.${index}.dob`
  legend?: string;
  amharicLegend?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

const MONTH_OPTIONS = [
  { value: "01", label: "01 - January (ጃንዋሪ)" },
  { value: "02", label: "02 - February (ፌብሩዋሪ)" },
  { value: "03", label: "03 - March (ማርች)" },
  { value: "04", label: "04 - April (ኤፕሪል)" },
  { value: "05", label: "05 - May (ሜይ)" },
  { value: "06", label: "06 - June (ጁን)" },
  { value: "07", label: "07 - July (ጁላይ)" },
  { value: "08", label: "08 - August (ኦገስት)" },
  { value: "09", label: "09 - September (ሴፕቴምበር)" },
  { value: "10", label: "10 - October (ኦክቶበር)" },
  { value: "11", label: "11 - November (ኖቬምበር)" },
  { value: "12", label: "12 - December (ዲሴምበር)" },
];

export const DateOfBirthBlock: React.FC<DateOfBirthBlockProps> = ({
  prefix,
  legend = "Date of Birth",
  amharicLegend = "የትውልድ ቀን",
  description = "Format: Month, Day, Year as indicated on your birth certificate (በግሪጎሪያን አቆጣጠር).",
  disabled = false,
  className,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <fieldset
      className={cn(
        "rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4 transition-colors",
        className
      )}
    >
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
        {/* Month */}
        <div>
          <FormSelect
            name={`${prefix}.month`}
            label="Month"
            amharicLabel="ወር"
            placeholder="Select Month (ወር ይምረጡ)"
            options={MONTH_OPTIONS}
            required
            disabled={disabled}
          />
        </div>

        {/* Day */}
        <div>
          <FormInput
            name={`${prefix}.day`}
            label="Day"
            amharicLabel="ቀን"
            type="number"
            placeholder="DD (1-31)"
            min={1}
            max={31}
            required
            disabled={disabled}
          />
        </div>

        {/* Year */}
        <div>
          <FormInput
            name={`${prefix}.year`}
            label="Year"
            amharicLabel="ዓመት"
            type="number"
            placeholder={`YYYY (e.g. ${currentYear - 25})`}
            min={1900}
            max={currentYear}
            required
            disabled={disabled}
          />
        </div>
      </div>
    </fieldset>
  );
};
