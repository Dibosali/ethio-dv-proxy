"use client";

import React, { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { FormInput } from "@/components/ui/FormInput";
import { FormSelect } from "@/components/ui/FormSelect";
import { FormCheckbox } from "@/components/ui/FormCheckbox";
import { COUNTRIES } from "@/lib/constants/countries";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

export interface MailingAddressBlockProps {
  prefix: string; // e.g. "primaryEntrant.mailingAddress"
  legend?: string;
  amharicLegend?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const MailingAddressBlock: React.FC<MailingAddressBlockProps> = ({
  prefix,
  legend = "8. Mailing Address",
  amharicLegend = "የፖስታ አድራሻ",
  description = "Provide an address where you can reliably receive postal correspondence.",
  disabled = false,
  className,
}) => {
  const { setValue, control } = useFormContext();

  const postalCodePath = `${prefix}.postalCode`;
  const noPostalCodePath = `${prefix}.noPostalCode`;

  // Watch "No Postal Code" checkbox
  const noPostalCode = useWatch({ control, name: noPostalCodePath });

  // Clear postal code when override checkbox is active
  useEffect(() => {
    if (noPostalCode) {
      setValue(postalCodePath, "", {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [noPostalCode, postalCodePath, setValue]);

  return (
    <fieldset
      className={cn(
        "rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5 transition-colors",
        className
      )}
    >
      <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
          <MapPin className="h-5 w-5" />
        </div>
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
      </div>

      <div className="space-y-4">
        {/* In Care Of (Optional) */}
        <FormInput
          name={`${prefix}.inCareOf`}
          label="a. In Care Of (Optional)"
          amharicLabel="በ... ስም / ተወካይ"
          placeholder="e.g. John Doe / Family Representative"
          disabled={disabled}
        />

        {/* Address Line 1 */}
        <FormInput
          name={`${prefix}.addressLine1`}
          label="b. Address Line 1"
          amharicLabel="የመንገድ አድራሻ 1"
          placeholder="Street address, P.O. Box, company name"
          required
          disabled={disabled}
        />

        {/* Address Line 2 (Optional) */}
        <FormInput
          name={`${prefix}.addressLine2`}
          label="c. Address Line 2 (Optional)"
          amharicLabel="የመንገድ አድራሻ 2"
          placeholder="Apartment, suite, unit, building, floor"
          disabled={disabled}
        />

        {/* City / Town & District / County / Province / State */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            name={`${prefix}.city`}
            label="d. City / Town"
            amharicLabel="ከተማ"
            placeholder="e.g. Addis Ababa"
            required
            disabled={disabled}
          />

          <FormInput
            name={`${prefix}.districtStateCounty`}
            label="e. District / County / Province / State"
            amharicLabel="ክፍለ ከተማ / ዞን / ክልል"
            placeholder="e.g. Bole Sub-City"
            required
            disabled={disabled}
          />
        </div>

        {/* Postal Code & Country */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div className="space-y-2">
            <FormInput
              name={postalCodePath}
              label="f. Postal Code / Zip Code"
              amharicLabel="የፖስታ ኮድ"
              placeholder={noPostalCode ? "No Postal Code" : "e.g. 1000"}
              required={!noPostalCode}
              disabled={disabled || Boolean(noPostalCode)}
            />
            <FormCheckbox
              name={noPostalCodePath}
              label="No Postal / Zip Code"
              amharicLabel="የፖስታ ኮድ የለም"
              description="Check this box if your local jurisdiction does not use postal codes."
              disabled={disabled}
              onChangeCustom={(checked) => {
                if (checked) {
                  setValue(postalCodePath, "", {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }
              }}
            />
          </div>

          <FormSelect
            name={`${prefix}.country`}
            label="g. Country"
            amharicLabel="አገር"
            placeholder="Select Country (አገር ይምረጡ)"
            options={COUNTRIES}
            required
            disabled={disabled}
          />
        </div>
      </div>
    </fieldset>
  );
};
