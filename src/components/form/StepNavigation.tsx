"use client";

import React from "react";
import { useMultiStepForm } from "@/context/MultiStepFormContext";
import { Check, User, Users, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export const StepNavigation: React.FC = () => {
  const { currentStep, isDerivativeRequired, completedSteps, goToStep } =
    useMultiStepForm();

  const steps = isDerivativeRequired
    ? [
        { id: 1, title: "Part 1", subtitle: "Primary Entrant", icon: User },
        { id: 2, title: "Part 2", subtitle: "Derivatives", icon: Users },
        { id: 3, title: "Review", subtitle: "Verify & Submit", icon: FileCheck },
      ]
    : [
        { id: 1, title: "Part 1", subtitle: "Primary Entrant", icon: User },
        { id: 2, title: "Review", subtitle: "Verify & Submit", icon: FileCheck },
      ];

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-4 sm:p-6 mb-8 transition-colors">
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between">
          {steps.map((step, idx) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;
            const isClickable = isCompleted || step.id <= currentStep;
            const StepIcon = step.icon;

            return (
              <li
                key={step.id}
                className={cn(
                  "relative flex-1 flex items-center",
                  idx !== steps.length - 1 && "pr-4 sm:pr-8"
                )}
              >
                <div
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => isClickable && goToStep(step.id)}
                  role="button"
                  tabIndex={isClickable ? 0 : -1}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-semibold text-sm transition-all shadow-sm",
                      isCurrent
                        ? "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/40 shadow-blue-200 dark:shadow-none"
                        : isCompleted
                        ? "bg-emerald-600 text-white group-hover:bg-emerald-700"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700"
                    )}
                  >
                    {isCompleted && !isCurrent ? (
                      <Check className="h-5 w-5 stroke-[2.5]" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>

                  <div className="hidden sm:block text-left">
                    <span
                      className={cn(
                        "block text-xs font-semibold uppercase tracking-wider",
                        isCurrent
                          ? "text-blue-600 dark:text-blue-400"
                          : isCompleted
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-slate-400 dark:text-slate-500"
                      )}
                    >
                      {step.title}
                    </span>
                    <span
                      className={cn(
                        "block text-sm font-medium",
                        isCurrent
                          ? "text-slate-900 dark:text-white font-semibold"
                          : isCompleted
                          ? "text-slate-700 dark:text-slate-300"
                          : "text-slate-400 dark:text-slate-500"
                      )}
                    >
                      {step.subtitle}
                    </span>
                  </div>
                </div>

                {idx !== steps.length - 1 && (
                  <div className="hidden sm:block flex-1 ml-4 sm:ml-8 mr-4 sm:mr-8">
                    <div
                      className={cn(
                        "h-0.5 w-full rounded transition-colors",
                        completedSteps.includes(step.id)
                          ? "bg-emerald-500"
                          : "bg-slate-200 dark:bg-slate-800"
                      )}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};
