"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  useForm,
  FormProvider,
  UseFormReturn,
  FieldPath,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DVFormData } from "@/types/form";
import { dvFormSchema } from "@/lib/schemas/dvFormSchema";

export const defaultFormValues: DVFormData = {
  primaryEntrant: {
    name: {
      lastName: "",
      firstName: "",
      middleName: "",
      noFirstName: false,
      noMiddleName: false,
    },
    gender: "MALE",
    dob: {
      month: "",
      day: "",
      year: "",
    },
    birthCity: "",
    birthCityUnknown: false,
    birthCountry: "",
    countryOfEligibilitySame: "YES",
    alternativeCountryOfEligibility: "",
    photo: null,
    mailingAddress: {
      inCareOf: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      districtStateCounty: "",
      postalCode: "",
      noPostalCode: false,
      country: "",
    },
    currentCountry: "",
    phoneNumber: "",
    email: "",
    confirmEmail: "",
    educationLevel: "HIGH_SCHOOL_DEGREE",
    maritalStatus: "UNMARRIED",
    enterSpouseInfo: false,
    numberOfChildren: 0,
  },
  children: [],
};

interface MultiStepFormContextType {
  currentStep: number;
  totalSteps: number;
  isDerivativeRequired: boolean;
  shouldIncludeSpouse: boolean;
  numberOfChildren: number;
  goToStep: (step: number) => void;
  nextStep: () => Promise<boolean>;
  prevStep: () => void;
  completedSteps: number[];
  methods: UseFormReturn<DVFormData>;
  resetForm: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
}

const MultiStepFormContext = createContext<MultiStepFormContextType | null>(
  null
);

export const MultiStepFormProvider: React.FC<{
  children: React.ReactNode;
  initialValues?: Partial<DVFormData>;
}> = ({ children, initialValues }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Single persistent form instance across all multi-step transitions
  const methods = useForm<DVFormData>({
    resolver: zodResolver(dvFormSchema),
    mode: "onTouched",
    defaultValues: {
      ...defaultFormValues,
      ...initialValues,
    },
  });

  const { watch, trigger, reset } = methods;

  // Reactively track marital status and children count to determine derivative requirements
  const maritalStatus = watch("primaryEntrant.maritalStatus");
  const enterSpouseInfo = watch("primaryEntrant.enterSpouseInfo");
  const numberOfChildren = Number(watch("primaryEntrant.numberOfChildren") || 0);

  const shouldIncludeSpouse =
    maritalStatus === "MARRIED_NON_LPR" ||
    maritalStatus === "MARRIED_LPR" ||
    (maritalStatus === "LEGALLY_SEPARATED" && Boolean(enterSpouseInfo));

  const isDerivativeRequired = shouldIncludeSpouse || numberOfChildren > 0;

  // Total steps:
  // Step 1: Part 1 - Primary Entrant
  // Step 2: Part 2 - Derivatives (if required) OR Step 2: Review & Submit (if bypassed)
  // Step 3: Review & Submit (if Part 2 was required)
  const totalSteps = isDerivativeRequired ? 3 : 2;

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const nextStep = async (): Promise<boolean> => {
    if (currentStep === 1) {
      // Validate Part 1 strictly before advancing
      const isValid = await trigger("primaryEntrant" as any);
      if (!isValid) {
        return false;
      }

      setCompletedSteps((prev) =>
        prev.includes(1) ? prev : [...prev, 1]
      );

      // If no derivatives are required, skip directly to Review (Step 2)
      if (!isDerivativeRequired) {
        goToStep(2);
      } else {
        goToStep(2);
      }
      return true;
    }

    if (currentStep === 2 && isDerivativeRequired) {
      // Validate Part 2 derivatives
      const spouseValid = shouldIncludeSpouse
        ? await trigger("spouse" as any)
        : true;
      const childrenValid =
        numberOfChildren > 0 ? await trigger("children" as any) : true;

      if (!spouseValid || !childrenValid) {
        return false;
      }

      setCompletedSteps((prev) =>
        prev.includes(2) ? prev : [...prev, 2]
      );

      goToStep(3);
      return true;
    }

    return true;
  };

  const prevStep = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };

  const resetForm = () => {
    reset(defaultFormValues);
    setCurrentStep(1);
    setCompletedSteps([]);
  };

  return (
    <MultiStepFormContext.Provider
      value={{
        currentStep,
        totalSteps,
        isDerivativeRequired,
        shouldIncludeSpouse,
        numberOfChildren,
        goToStep,
        nextStep,
        prevStep,
        completedSteps,
        methods,
        resetForm,
        isSubmitting,
        setIsSubmitting,
      }}
    >
      <FormProvider {...methods}>{children}</FormProvider>
    </MultiStepFormContext.Provider>
  );
};

export const useMultiStepForm = () => {
  const context = useContext(MultiStepFormContext);
  if (!context) {
    throw new Error(
      "useMultiStepForm must be used within a MultiStepFormProvider"
    );
  }
  return context;
};
