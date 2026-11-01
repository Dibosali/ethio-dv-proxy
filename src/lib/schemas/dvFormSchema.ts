import { z } from "zod";

// Helper for image file validation
const imageFileSchema = z
  .any()
  .refine((file) => file !== null && file !== undefined, {
    message: "Photograph is required",
  })
  .refine(
    (file) => {
      if (!file) return false;
      // In browser environment, check instance of File
      if (typeof window !== "undefined" && file instanceof File) {
        return ["image/jpeg", "image/png", "image/webp"].includes(file.type);
      }
      return true;
    },
    { message: "Image must be JPEG, PNG, or WebP format" }
  );

// Reusable Full Name Schema (guarantees uppercase strings)
export const fullNameSchema = z
  .object({
    lastName: z
      .string()
      .trim()
      .min(1, "Last / Family Name is strictly required")
      .transform((val) => val.toUpperCase()),
    firstName: z
      .string()
      .trim()
      .default("")
      .transform((val) => val.toUpperCase()),
    middleName: z
      .string()
      .trim()
      .default("")
      .transform((val) => val.toUpperCase()),
    noFirstName: z.boolean().default(false),
    noMiddleName: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (!data.noFirstName && (!data.firstName || data.firstName.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["firstName"],
        message: "First name is required unless 'No First Name' is checked",
      });
    }
  });

// Reusable Date of Birth Schema
export const dateOfBirthSchema = z
  .object({
    month: z.string().min(1, "Month is required"),
    day: z.coerce
      .number({ invalid_type_error: "Day must be a number" })
      .min(1, "Day must be between 1 and 31")
      .max(31, "Day must be between 1 and 31"),
    year: z.coerce
      .number({ invalid_type_error: "Year must be a number" })
      .min(1900, "Year must be 1900 or later")
      .max(new Date().getFullYear(), `Year cannot be in the future`),
  })
  .superRefine((data, ctx) => {
    const monthNum = parseInt(data.month, 10);
    const dayNum = data.day;
    const yearNum = data.year;

    if (!isNaN(monthNum) && !isNaN(dayNum) && !isNaN(yearNum)) {
      const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
      if (dayNum > daysInMonth) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["day"],
          message: `Selected month only has ${daysInMonth} days`,
        });
      }
    }
  });

// Reusable Mailing Address Schema
export const mailingAddressSchema = z
  .object({
    inCareOf: z.string().trim().optional(),
    addressLine1: z.string().trim().min(1, "Address Line 1 is required"),
    addressLine2: z.string().trim().optional(),
    city: z.string().trim().min(1, "City / Town is required"),
    districtStateCounty: z
      .string()
      .trim()
      .min(1, "District / County / Province / State is required"),
    postalCode: z.string().trim().default(""),
    noPostalCode: z.boolean().default(false),
    country: z.string().min(1, "Country is required"),
  })
  .superRefine((data, ctx) => {
    if (
      !data.noPostalCode &&
      (!data.postalCode || data.postalCode.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["postalCode"],
        message: "Postal code is required unless 'No Postal / Zip Code' is checked",
      });
    }
  });

// Single Derivative Person Schema (used for Spouse and Children)
export const derivativePersonSchema = z
  .object({
    name: fullNameSchema,
    gender: z.enum(["MALE", "FEMALE"], {
      required_error: "Please select gender",
    }),
    dob: dateOfBirthSchema,
    birthCity: z.string().trim().default(""),
    birthCityUnknown: z.boolean().default(false),
    birthCountry: z.string().min(1, "Country of birth is required"),
    photo: imageFileSchema,
  })
  .superRefine((data, ctx) => {
    if (
      !data.birthCityUnknown &&
      (!data.birthCity || data.birthCity.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["birthCity"],
        message: "Birth city is required unless 'Birth City Unknown' is checked",
      });
    }
  });

// Part 1 Primary Entrant Schema
export const primaryEntrantSchema = z
  .object({
    name: fullNameSchema,
    gender: z.enum(["MALE", "FEMALE"], {
      required_error: "Please select your gender",
    }),
    dob: dateOfBirthSchema,
    birthCity: z.string().trim().default(""),
    birthCityUnknown: z.boolean().default(false),
    birthCountry: z.string().min(1, "Please select your birth country"),
    countryOfEligibilitySame: z.enum(["YES", "NO"], {
      required_error: "Please confirm your eligibility claim",
    }),
    alternativeCountryOfEligibility: z.string().optional(),
    photo: imageFileSchema,
    mailingAddress: mailingAddressSchema,
    currentCountry: z.string().min(1, "Country where you live today is required"),
    phoneNumber: z.string().trim().optional(),
    email: z.string().trim().email("Please enter a valid email address"),
    confirmEmail: z
      .string()
      .trim()
      .email("Please confirm your email address"),
    educationLevel: z.enum(
      [
        "PRIMARY_ONLY",
        "HIGH_SCHOOL_NO_DEGREE",
        "HIGH_SCHOOL_DEGREE",
        "VOCATIONAL_SCHOOL",
        "SOME_UNIVERSITY",
        "UNIVERSITY_DEGREE",
        "SOME_GRADUATE",
        "MASTERS_DEGREE",
        "SOME_DOCTORATE",
        "DOCTORATE_DEGREE",
      ],
      { required_error: "Please select your highest level of educational achievement" }
    ),
    maritalStatus: z.enum(
      [
        "UNMARRIED",
        "MARRIED_NON_LPR",
        "MARRIED_LPR",
        "DIVORCED",
        "WIDOWED",
        "LEGALLY_SEPARATED",
      ],
      { required_error: "Please select your marital status" }
    ),
    enterSpouseInfo: z.boolean().default(false),
    numberOfChildren: z.coerce
      .number({ invalid_type_error: "Must enter a valid number" })
      .int("Number of children must be a whole integer")
      .min(0, "Number of children cannot be negative"),
  })
  .superRefine((data, ctx) => {
    // 1. Birth City unknown check
    if (
      !data.birthCityUnknown &&
      (!data.birthCity || data.birthCity.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["birthCity"],
        message: "Birth city is required unless 'Birth City Unknown' is checked",
      });
    }

    // 2. Alternative Country of Eligibility check
    if (
      data.countryOfEligibilitySame === "NO" &&
      (!data.alternativeCountryOfEligibility ||
        data.alternativeCountryOfEligibility.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["alternativeCountryOfEligibility"],
        message:
          "Alternative country of eligibility is required when claiming from another country",
      });
    }

    // 3. Confirm Email match check
    if (data.email.toLowerCase() !== data.confirmEmail.toLowerCase()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmEmail"],
        message: "Email addresses do not match",
      });
    }
  });

// Complete DV Form Schema (Combining Part 1 and conditional Part 2 Derivatives)
export const dvFormSchema = z
  .object({
    primaryEntrant: primaryEntrantSchema,
    spouse: derivativePersonSchema.optional(),
    children: z.array(derivativePersonSchema).default([]),
  })
  .superRefine((data, ctx) => {
    const { primaryEntrant, spouse, children } = data;
    const marital = primaryEntrant.maritalStatus;
    const enterSpouse = primaryEntrant.enterSpouseInfo;
    const requiresSpouse =
      marital === "MARRIED_NON_LPR" ||
      marital === "MARRIED_LPR" ||
      (marital === "LEGALLY_SEPARATED" && enterSpouse);

    // If spouse is required, validate spouse block presence
    if (requiresSpouse && !spouse) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["spouse"],
        message: "Spouse details are required based on your marital status",
      });
    }

    // Validate children array count matches numberOfChildren
    const expectedChildrenCount = primaryEntrant.numberOfChildren || 0;
    if (expectedChildrenCount > 0 && (!children || children.length !== expectedChildrenCount)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["children"],
        message: `Expected information for ${expectedChildrenCount} children, but found ${children?.length || 0}`,
      });
    }
  });

export type DVFormSchemaType = z.infer<typeof dvFormSchema>;
