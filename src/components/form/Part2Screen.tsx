"use client";

import React, { useEffect } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { useMultiStepForm } from "@/context/MultiStepFormContext";
import { DerivativePersonBlock } from "./DerivativePersonBlock";
import {
  Users,
  Heart,
  Baby,
  ArrowLeft,
  ArrowRight,
  Info,
} from "lucide-react";
import { DVFormData } from "@/types/form";

export const Part2Screen: React.FC = () => {
  const {
    shouldIncludeSpouse,
    numberOfChildren,
    prevStep,
    nextStep,
  } = useMultiStepForm();

  const {
    control,
    setValue,
    getValues,
    formState: { isSubmitting },
  } = useFormContext<DVFormData>();

  // Manage dynamic child blocks via useFieldArray
  const { fields, append, remove } = useFieldArray({
    control,
    name: "children",
  });

  // Sync spouse default state when spouse is required
  useEffect(() => {
    if (shouldIncludeSpouse) {
      const currentSpouse = getValues("spouse");
      if (!currentSpouse) {
        setValue("spouse", {
          name: {
            lastName: "",
            firstName: "",
            middleName: "",
            noFirstName: false,
            noMiddleName: false,
          },
          dob: {
            month: "",
            day: "" as any,
            year: "" as any,
          },
          gender: "FEMALE",
          birthCity: "",
          birthCityUnknown: false,
          birthCountry: "",
          photo: null,
        });
      }
    }
  }, [shouldIncludeSpouse, getValues, setValue]);

  // Synchronize field array length with the integer from "Number of Children"
  useEffect(() => {
    const currentCount = fields.length;
    const targetCount = Math.max(0, numberOfChildren);

    if (currentCount < targetCount) {
      const diff = targetCount - currentCount;
      for (let i = 0; i < diff; i++) {
        append({
          name: {
            lastName: "",
            firstName: "",
            middleName: "",
            noFirstName: false,
            noMiddleName: false,
          },
          dob: {
            month: "",
            day: "" as any,
            year: "" as any,
          },
          gender: "MALE",
          birthCity: "",
          birthCityUnknown: false,
          birthCountry: "",
          photo: null,
        });
      }
    } else if (currentCount > targetCount) {
      for (let i = currentCount - 1; i >= targetCount; i--) {
        remove(i);
      }
    }
  }, [numberOfChildren, fields.length, append, remove]);

  const handleProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await nextStep();
    if (!success) {
      // Scroll to the first validation error
      const firstError = document.querySelector('[aria-invalid="true"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    <form onSubmit={handleProceed} noValidate className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/60 dark:bg-indigo-950/20 p-6 shadow-xs transition-colors">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shrink-0 shadow-sm">
            <Users className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="inline-flex items-center flex-wrap gap-2 text-xl font-bold text-slate-900 dark:text-white">
              <span>Part 2 — Derivatives (Spouse & Children)</span>
              <span className="inline-flex items-center rounded-md bg-indigo-100/90 dark:bg-indigo-900/40 px-2.5 py-0.5 text-xs font-semibold text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs leading-none">
                ክፍል 2 — ተቀጥላዎች: ባለቤትና ልጆች
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Official regulations require listing your spouse and all unmarried living children
              under 21 years of age. Failure to list qualifying derivatives will result in disqualification.
            </p>
          </div>
        </div>
      </div>

      {/* Derivative Status Notification */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4.5 flex flex-wrap items-center justify-between gap-4 text-xs transition-colors">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>
            Derivatives to provide:{" "}
            <strong className="text-slate-900 dark:text-white">
              {shouldIncludeSpouse ? "1 Spouse (ባለቤት)" : "No Spouse required"}
            </strong>{" "}
            and{" "}
            <strong className="text-slate-900 dark:text-white">
              {numberOfChildren} {numberOfChildren === 1 ? "Child (ልጅ)" : "Children (ልጆች)"}
            </strong>
          </span>
        </div>
        <button
          type="button"
          onClick={prevStep}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold hover:underline"
        >
          Modify Part 1 Status (ክፍል 1ን ያሻሽሉ)
        </button>
      </div>

      {/* 1. Spouse Block (Rendered conditionally) */}
      {shouldIncludeSpouse && (
        <section aria-labelledby="spouse-section">
          <DerivativePersonBlock
            prefix="spouse"
            title="14. Spouse Information"
            amharicTitle="የባለቤት መረጃ"
            subtitle="Provide details for your spouse. Even if your spouse does not plan to immigrate, official DV rules require listing them unless they are already a U.S. citizen or LPR."
            icon={Heart}
            photoLabel="Spouse Photograph"
            amharicPhotoLabel="የባለቤት ፎቶግራፍ"
          />
        </section>
      )}

      {/* 2. Children Blocks (Rendered conditionally based on numberOfChildren integer) */}
      {numberOfChildren > 0 && (
        <div className="space-y-8">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <Baby className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="inline-flex items-center flex-wrap gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <span>
                Children Information ({numberOfChildren}{" "}
                {numberOfChildren === 1 ? "Child" : "Children"} declared)
              </span>
              <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs leading-none">
                የልጆች መረጃ
              </span>
            </h3>
          </div>

          {fields.map((field, index) => {
            const childNumber = index + 1;
            const prefix = `children.${index}`;

            return (
              <section
                key={field.id}
                aria-labelledby={`child-section-${childNumber}`}
              >
                <DerivativePersonBlock
                  prefix={prefix}
                  title={`Child #${childNumber} Information`}
                  amharicTitle={`የልጅ #${childNumber} መረጃ`}
                  subtitle={`Enter complete details and an individual photograph for child #${childNumber}.`}
                  icon={Baby}
                  photoLabel={`Child #${childNumber} Photograph`}
                  amharicPhotoLabel={`የልጅ #${childNumber} ፎቶግራፍ`}
                />
              </section>
            );
          })}
        </div>
      )}

      {/* Navigation & Submit CTA */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
        <button
          type="button"
          onClick={prevStep}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Part 1 (ወደ ክፍል 1 ይመለሱ)</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 active:scale-[0.99] transition-all disabled:opacity-50"
        >
          <span>Continue to Review & Submit (ይገምግሙና ያስገቡ)</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
};
