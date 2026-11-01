"use client";

import React, { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useMultiStepForm } from "@/context/MultiStepFormContext";
import { FullNameBlock } from "./FullNameBlock";
import { DateOfBirthBlock } from "./DateOfBirthBlock";
import { MailingAddressBlock } from "./MailingAddressBlock";
import { FormInput } from "@/components/ui/FormInput";
import { FormSelect } from "@/components/ui/FormSelect";
import { FormRadioGroup } from "@/components/ui/FormRadioGroup";
import { FormCheckbox } from "@/components/ui/FormCheckbox";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { COUNTRIES } from "@/lib/constants/countries";
import {
  User,
  Building2,
  Globe2,
  ShieldCheck,
  Camera,
  Mail,
  GraduationCap,
  Heart,
  Baby,
  ArrowRight,
  AlertTriangle,
  Info,
} from "lucide-react";

export const EDUCATION_OPTIONS = [
  {
    value: "PRIMARY_ONLY",
    label: "Primary school only",
    amharicLabel: "የመጀመሪያ ደረጃ ትምህርት ብቻ",
  },
  {
    value: "HIGH_SCHOOL_NO_DEGREE",
    label: "High School, no degree",
    amharicLabel: "ሁለተኛ ደረጃ - ሰርተፍኬት የሌለው",
  },
  {
    value: "HIGH_SCHOOL_DEGREE",
    label: "High School degree",
    amharicLabel: "የ12ኛ ክፍል / የሁለተኛ ደረጃ ሰርተፍኬት",
  },
  {
    value: "VOCATIONAL_SCHOOL",
    label: "Vocational School",
    amharicLabel: "የቴክኒክና ሙያ ትምህርት (TVET)",
  },
  {
    value: "SOME_UNIVERSITY",
    label: "Some University Courses",
    amharicLabel: "የዩኒቨርሲቲ ኮርሶችን የወሰደ/ች",
  },
  {
    value: "UNIVERSITY_DEGREE",
    label: "University Degree",
    amharicLabel: "የዩኒቨርሲቲ የመጀመሪያ ዲግሪ (BA/BSc)",
  },
  {
    value: "SOME_GRADUATE_LEVEL",
    label: "Some Graduate Level Courses",
    amharicLabel: "የማስተርስ ኮርሶችን የወሰደ/ች",
  },
  {
    value: "MASTERS_DEGREE",
    label: "Master's Degree",
    amharicLabel: "የማስተርስ ዲግሪ (MA/MSc)",
  },
  {
    value: "SOME_DOCTORATE_LEVEL",
    label: "Some Doctorate Level Courses",
    amharicLabel: "የዶክትሬት (PhD) ኮርሶችን የወሰደ/ች",
  },
  {
    value: "DOCTORATE_DEGREE",
    label: "Doctorate Degree",
    amharicLabel: "የዶክትሬት ዲግሪ (PhD)",
  },
];

export const MARITAL_STATUS_OPTIONS = [
  {
    value: "UNMARRIED",
    label: "Unmarried",
    amharicLabel: "ያላገባ/ች",
    description: "Never married, or marriage was legally annulled.",
  },
  {
    value: "MARRIED_NON_LPR",
    label: "Married and spouse is NOT a U.S. citizen or LPR",
    amharicLabel: "ያገባ/ች (ባለቤት የUS ዜጋ ያልሆነ/ች)",
    description:
      "Spouse details and photo must be provided in Part 2. Failure to list your spouse will result in disqualification.",
  },
  {
    value: "MARRIED_LPR",
    label: "Married and spouse IS a U.S. citizen or LPR",
    amharicLabel: "ያገባ/ች (ባለቤት የUS ዜጋ የሆነ/ች)",
    description:
      "Your spouse already has legal U.S. status; entry requires spouse details in Part 2.",
  },
  {
    value: "DIVORCED",
    label: "Divorced",
    amharicLabel: "የተፋታ/ች",
    description: "Legally divorced through a final court decree.",
  },
  {
    value: "WIDOWED",
    label: "Widowed",
    amharicLabel: "የሞተበት/ባት",
    description: "Spouse is deceased.",
  },
  {
    value: "LEGALLY_SEPARATED",
    label: "Legally Separated",
    amharicLabel: "በፍርድ ቤት በህግ የተለያየ/ች",
    description:
      "Separated under a recognized legal court order. An informal separation is not accepted.",
  },
];

export const Part1Screen: React.FC = () => {
  const { nextStep } = useMultiStepForm();
  const {
    setValue,
    control,
    formState: { isSubmitting },
  } = useFormContext();

  // Watch reactive fields
  const birthCityUnknown = useWatch({
    control,
    name: "primaryEntrant.birthCityUnknown",
  });
  const countryOfEligibilitySame = useWatch({
    control,
    name: "primaryEntrant.countryOfEligibilitySame",
  });
  const maritalStatus = useWatch({
    control,
    name: "primaryEntrant.maritalStatus",
  });
  const numberOfChildren = useWatch({
    control,
    name: "primaryEntrant.numberOfChildren",
  });

  // Reactive Effect: When Birth City Unknown is checked, clear and disable birthCity
  useEffect(() => {
    if (birthCityUnknown) {
      setValue("primaryEntrant.birthCity", "", {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [birthCityUnknown, setValue]);

  // Reactive Effect: Set alternative country to birth country if YES
  const birthCountry = useWatch({
    control,
    name: "primaryEntrant.birthCountry",
  });

  useEffect(() => {
    if (countryOfEligibilitySame === "YES" && birthCountry) {
      setValue(
        "primaryEntrant.alternativeCountryOfEligibility",
        birthCountry,
        { shouldValidate: true }
      );
    }
  }, [countryOfEligibilitySame, birthCountry, setValue]);

  const handleProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await nextStep();
    if (!success) {
      // Scroll smoothly to the first invalid field
      const firstError = document.querySelector('[aria-invalid="true"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        (firstError as HTMLElement).focus?.();
      }
    }
  };

  const isBypassed =
    maritalStatus === "UNMARRIED" && Number(numberOfChildren || 0) === 0;

  return (
    <form onSubmit={handleProceed} noValidate className="space-y-8 animate-fadeIn">
      {/* Header Information */}
      <div className="rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/20 p-6 shadow-xs transition-colors">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 shadow-sm">
            <User className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="inline-flex items-center flex-wrap gap-2 text-xl font-bold text-slate-900 dark:text-white">
              <span>Part 1 — Entrant Information</span>
              <span className="inline-flex items-center rounded-md bg-blue-100/90 dark:bg-blue-900/40 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs leading-none">
                ክፍል 1 — የአመልካች መረጃ
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Complete all fields accurately for the primary applicant. Information
              must match your official passport and government records.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Name */}
      <section aria-labelledby="section-name">
        <FullNameBlock
          prefix="primaryEntrant.name"
          legend="1. Entrant Full Legal Name"
          amharicLegend="የአመልካች ሙሉ ህጋዊ ስም"
          description="Provide your name as listed on your valid passport or government-issued identification."
        />
      </section>

      {/* 2. Gender */}
      <section
        aria-labelledby="section-gender"
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-3 transition-colors"
      >
        <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 id="section-gender" className="inline-flex items-center flex-wrap gap-2 text-base font-bold text-slate-900 dark:text-white">
              <span>2. Gender</span>
              <span className="inline-flex items-center rounded-md bg-indigo-50/90 dark:bg-indigo-950/50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs leading-none">
                ጾታ
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Select your legal biological gender.</p>
          </div>
        </div>

        <FormRadioGroup
          name="primaryEntrant.gender"
          orientation="horizontal"
          options={[
            { value: "MALE", label: "Male", amharicLabel: "ወንድ" },
            { value: "FEMALE", label: "Female", amharicLabel: "ሴት" },
          ]}
          required
        />
      </section>

      {/* 3. Date of Birth */}
      <section aria-labelledby="section-dob">
        <DateOfBirthBlock
          prefix="primaryEntrant.dob"
          legend="3. Date of Birth"
          amharicLegend="የትውልድ ቀን"
          description="Enter your birth date in Month, Day, Year format."
        />
      </section>

      {/* 4. City Where You Were Born */}
      <section
        aria-labelledby="section-birth-city"
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 transition-colors"
      >
        <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 id="section-birth-city" className="inline-flex items-center flex-wrap gap-2 text-base font-bold text-slate-900 dark:text-white">
              <span>4. City Where You Were Born</span>
              <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs leading-none">
                የተወለዱበት ከተማ
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter the city, town, or village of birth. Do not enter district or country.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <FormInput
            name="primaryEntrant.birthCity"
            label="City of Birth"
            amharicLabel="የተወለዱበት ከተማ"
            placeholder={birthCityUnknown ? "Birth City Unknown" : "e.g. Addis Ababa (የተወለዱበት ከተማ)"}
            required={!birthCityUnknown}
            disabled={Boolean(birthCityUnknown)}
          />

          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800">
            <FormCheckbox
              name="primaryEntrant.birthCityUnknown"
              label="Birth City Unknown"
              amharicLabel="የተወለዱበት ከተማ አይታወቅም"
              description="Check this box only if the city of birth is not known and does not appear on your birth certificate."
              onChangeCustom={(checked) => {
                if (checked) {
                  setValue("primaryEntrant.birthCity", "", {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }
              }}
            />
          </div>
        </div>
      </section>

      {/* 5. Country Where You Were Born */}
      <section
        aria-labelledby="section-birth-country"
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 transition-colors"
      >
        <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <Globe2 className="h-5 w-5" />
          </div>
          <div>
            <h3 id="section-birth-country" className="inline-flex items-center flex-wrap gap-2 text-base font-bold text-slate-900 dark:text-white">
              <span>5. Country Where You Were Born</span>
              <span className="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 shadow-2xs leading-none">
                የተወለዱበት አገር
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Use the current name of the country where the place of birth is located.
            </p>
          </div>
        </div>

        <FormSelect
          name="primaryEntrant.birthCountry"
          label="Country of Birth"
          amharicLabel="የተወለዱበት አገር"
          placeholder="Select Country of Birth (የተወለዱበትን አገር ይምረጡ)"
          options={COUNTRIES}
          required
        />
      </section>

      {/* 6. Country of Eligibility for the DV Program */}
      <section
        aria-labelledby="section-eligibility"
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5 transition-colors"
      >
        <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 id="section-eligibility" className="inline-flex items-center flex-wrap gap-2 text-base font-bold text-slate-900 dark:text-white">
              <span>6. Country of Eligibility for the DV Program</span>
              <span className="inline-flex items-center rounded-md bg-cyan-50 dark:bg-cyan-950/50 px-2.5 py-0.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-800/60 shadow-2xs leading-none">
                ለDV ፕሮግራም ብቁ የሆኑበት አገር
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your country of eligibility will normally be the same as your country of birth.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <FormRadioGroup
            name="primaryEntrant.countryOfEligibilitySame"
            label="Are you claiming eligibility based on the country where you were born?"
            amharicLabel="ብቁነትዎን በሚጠይቁበት አገር ነው የተወለዱት?"
            options={[
              {
                value: "YES",
                label: "Yes",
                amharicLabel: "አዎ",
                description: "I am claiming eligibility based on my country of birth.",
              },
              {
                value: "NO",
                label: "No",
                amharicLabel: "አይ",
                description:
                  "I am claiming eligibility based on the country of birth of my spouse or parent.",
              },
            ]}
            required
          />

          {countryOfEligibilitySame === "NO" && (
            <div className="rounded-xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50/50 dark:bg-cyan-950/30 p-4.5 space-y-3 animate-fadeIn">
              <div className="flex items-start gap-2.5">
                <Info className="h-4 w-4 text-cyan-700 dark:text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-xs text-cyan-900 dark:text-cyan-200 leading-relaxed">
                  If claiming through spouse or parent, you must select that country below.
                </p>
              </div>

              <FormSelect
                name="primaryEntrant.alternativeCountryOfEligibility"
                label="Country of Alternate Eligibility"
                amharicLabel="አማራጭ ብቁ የሆኑበት አገር"
                placeholder="Select Alternative Country (አማራጭ አገር ይምረጡ)"
                options={COUNTRIES}
                required
              />
            </div>
          )}
        </div>
      </section>

      {/* 7. Entrant Photograph */}
      <section
        aria-labelledby="section-photo"
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 transition-colors"
      >
        <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <h3 id="section-photo" className="inline-flex items-center flex-wrap gap-2 text-base font-bold text-slate-900 dark:text-white">
              <span>7. Entrant Photograph</span>
              <span className="inline-flex items-center rounded-md bg-purple-50 dark:bg-purple-950/50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 shadow-2xs leading-none">
                የአመልካች ፎቶግራፍ
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Recent color photograph taken within the last 6 months complying with official DV standards.
            </p>
          </div>
        </div>

        <ImageUploader
          name="primaryEntrant.photo"
          label="Primary Entrant Photo (የአመልካች ፎቶግራፍ)"
          description="Photo must be square (600x600 px), in focus, with a plain white or light background, no glasses, and neutral facial expression."
          required
        />
      </section>

      {/* 8. Mailing Address */}
      <section aria-labelledby="section-address">
        <MailingAddressBlock prefix="primaryEntrant.mailingAddress" />
      </section>

      {/* 9. Country Where You Live Today */}
      <section
        aria-labelledby="section-current-country"
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 transition-colors"
      >
        <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
            <Globe2 className="h-5 w-5" />
          </div>
          <div>
            <h3 id="section-current-country" className="inline-flex items-center flex-wrap gap-2 text-base font-bold text-slate-900 dark:text-white">
              <span>9. Country Where You Live Today</span>
              <span className="inline-flex items-center rounded-md bg-teal-50 dark:bg-teal-950/50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60 shadow-2xs leading-none">
                አሁን የሚኖሩበት አገር
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Country where you currently reside on the date of this application.
            </p>
          </div>
        </div>

        <FormSelect
          name="primaryEntrant.currentCountry"
          label="Current Residence Country"
          amharicLabel="አሁን የሚኖሩበት አገር"
          placeholder="Select Current Country of Residence (የሚኖሩበትን አገር ይምረጡ)"
          options={COUNTRIES}
          required
        />
      </section>

      {/* 10. Contact Details: Phone & Email Match */}
      <section
        aria-labelledby="section-contact"
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5 transition-colors"
      >
        <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h3 id="section-contact" className="inline-flex items-center flex-wrap gap-2 text-base font-bold text-slate-900 dark:text-white">
              <span>10. Contact Information</span>
              <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 shadow-2xs leading-none">
                የመገናኛ መረጃ
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct and valid contact information. Your email will receive status updates.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Phone Number (Optional) */}
          <FormInput
            name="primaryEntrant.phoneNumber"
            label="a. Phone Number (Optional)"
            amharicLabel="ስልክ ቁጥር"
            type="tel"
            placeholder="e.g. +251 91 123 4567"
            description="Include country code and area code if available."
          />

          {/* Email Address & Confirm Email Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              name="primaryEntrant.email"
              label="b. E-mail Address"
              amharicLabel="ኢሜይል አድራሻ"
              type="email"
              placeholder="e.g. applicant@example.com"
              required
              autoComplete="email"
            />

            <FormInput
              name="primaryEntrant.confirmEmail"
              label="c. Confirm E-mail Address"
              amharicLabel="ኢሜይል አድራሻዎን ያረጋግጡ"
              type="email"
              placeholder="e.g. applicant@example.com"
              required
              autoComplete="email"
            />
          </div>
        </div>
      </section>

      {/* 11. Highest Level of Education */}
      <section
        aria-labelledby="section-education"
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 transition-colors"
      >
        <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h3 id="section-education" className="inline-flex items-center flex-wrap gap-2 text-base font-bold text-slate-900 dark:text-white">
              <span>11. Highest Level of Education Achieved</span>
              <span className="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 shadow-2xs leading-none">
                ከፍተኛ የትምህርት ደረጃ
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You must have at least a high school education or its equivalent, or two years of qualifying work experience.
            </p>
          </div>
        </div>

        <FormRadioGroup
          name="primaryEntrant.educationLevel"
          options={EDUCATION_OPTIONS}
          required
        />
      </section>

      {/* 12. Marital Status */}
      <section
        aria-labelledby="section-marital"
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5 transition-colors"
      >
        <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <h3 id="section-marital" className="inline-flex items-center flex-wrap gap-2 text-base font-bold text-slate-900 dark:text-white">
              <span>12. What is your current marital status?</span>
              <span className="inline-flex items-center rounded-md bg-rose-50 dark:bg-rose-950/50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 shadow-2xs leading-none">
                የጋብቻ ሁኔታዎ ምንድነው?
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              State your legal status as of today. Misrepresenting marital status leads to automatic disqualification.
            </p>
          </div>
        </div>

        <FormRadioGroup
          name="primaryEntrant.maritalStatus"
          options={MARITAL_STATUS_OPTIONS}
          required
        />

        {/* Conditional Sub-checkbox: If Legally Separated, render "Enter Spouse Information" */}
        {maritalStatus === "LEGALLY_SEPARATED" && (
          <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/30 p-4.5 space-y-3 animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed">
                Legal separation is a status when a court has formally ordered a legal separation.
                If you have a formal legal separation agreement, you are not required to list your spouse.
                However, if you wish to enter spouse details, check the box below:
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-rose-200 dark:border-rose-800">
              <FormCheckbox
                name="primaryEntrant.enterSpouseInfo"
                label="Enter Spouse Information"
                amharicLabel="የባለቤትዎን መረጃ ያስገቡ"
                description="Check to include your spouse in Part 2 derivatives."
              />
            </div>
          </div>
        )}
      </section>

      {/* 13. Number of Children */}
      <section
        aria-labelledby="section-children"
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 transition-colors"
      >
        <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Baby className="h-5 w-5" />
          </div>
          <div>
            <h3 id="section-children" className="inline-flex items-center flex-wrap gap-2 text-base font-bold text-slate-900 dark:text-white">
              <span>13. Number of Children</span>
              <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs leading-none">
                የልጆች ብዛት
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter the number of all living unmarried children under 21 years of age.
            </p>
          </div>
        </div>

        <div className="max-w-xs space-y-2">
          <FormInput
            name="primaryEntrant.numberOfChildren"
            label="Total Number of Children"
            amharicLabel="አጠቃላይ የልጆች ብዛት"
            type="number"
            min={0}
            max={20}
            required
            description="Enter 0 if you have no children under 21."
          />
        </div>
      </section>

      {/* Navigation & Submit CTA */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
        <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
          {isBypassed ? (
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              ✓ Unmarried with 0 children: Part 2 will be bypassed directly to Review.
            </span>
          ) : (
            <span>
              All information will be verified before continuing to Part 2 (Derivatives).
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 active:scale-[0.99] transition-all disabled:opacity-50"
        >
          <span>
            {isBypassed ? "Review & Submit (ይገምግሙና ያስገቡ)" : "Continue to Part 2 (ወደ ክፍል 2 ይቀጥሉ)"}
          </span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
};
