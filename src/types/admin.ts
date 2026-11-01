import { DVFormData } from "./form";

export interface AgentProfile {
  phoneNumber: string;
  stationaryName: string;
  city?: string;
  subCityDistrict?: string;
  notes?: string;
}

export interface AgentUser {
  id: string;
  username: string;
  password?: string;
  role: "AGENT" | "SUPER_ADMIN";
  isActive: boolean;
  createdAt: string;
  profile: AgentProfile;
  totalSubmissions: number;
  lastActive?: string;
}

export interface SubmissionSummary {
  id: string;
  confirmationNumber: string;
  applicantName: string;
  applicantFirstName?: string;
  applicantLastName?: string;
  stationaryName: string;
  agentId: string;
  agentUsername: string;
  maritalStatus: string;
  maritalStatusRaw?: string;
  childrenCount: number;
  submittedAt: string;
  status: "PENDING_REVIEW" | "SUBMITTED" | "APPROVED" | "FLAGGED";
  photoUrl: string;
  spousePhotoUrl?: string;
  childrenPhotoUrls?: string[];
  contactEmail?: string;
  contactPhone?: string;
  formData?: DVFormData;
  isFilled?: boolean;
  isPaid?: boolean;
  filledStatus?: "FILLED" | "UNFILLED";
  paymentStatus?: "PAID" | "UNPAID";
  paidAt?: string;
  paymentReference?: string;
  paymentMethod?: string;
  paymentAmount?: number;
  receiptUrl?: string | null;
  receiptFileName?: string | null;
  dvPdfUrl?: string | null;
  dvPdfFileName?: string | null;
  dvPdfUploadedAt?: string | null;
}

export interface PaymentSettings {
  feePerForm: number;
  currency: string;
  cbeAccountNumber: string;
  cbeAccountName: string;
  telebirrPhone: string;
  telebirrName: string;
  paymentNotice?: string;
  updatedAt?: string;
}

export interface UpdatePaymentSettingsDTO {
  feePerForm?: number;
  cbeAccountNumber?: string;
  cbeAccountName?: string;
  telebirrPhone?: string;
  telebirrName?: string;
  paymentNotice?: string;
}

export interface CreateAgentDTO {
  username: string;
  password: string;
  stationaryName: string;
  phoneNumber: string;
  city?: string;
  subCityDistrict?: string;
  notes?: string;
}

export interface UpdateAgentDTO {
  id: string;
  stationaryName: string;
  phoneNumber: string;
  username?: string;
  password?: string;
  city?: string;
  subCityDistrict?: string;
  notes?: string;
  isActive?: boolean;
}

export interface ReportPaymentDTO {
  applicationId: string;
  paymentMethod: "CBE" | "TELEBIRR";
  paymentReference?: string;
  receiptUrl?: string;
  receiptFileName?: string;
  paymentAmount?: number;
}

export interface ServerActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SubmissionConfirmationData {
  applicationId: string;
  confirmationNumber: string;
  applicantName: string;
  agentId: string;
  submittedAt: string;
  derivativesCount: number;
  derivatives?: Array<{
    id: string;
    type: string;
    name: string;
  }>;
}

export interface DVFormPayload {
  primaryEntrant: {
    name: {
      lastName: string;
      firstName?: string;
      middleName?: string;
      noFirstName?: boolean;
      noMiddleName?: boolean;
    };
    gender: "MALE" | "FEMALE" | string;
    dob:
      | {
          month: string | number;
          day: string | number;
          year: string | number;
        }
      | string
      | Date;
    birthCity: string;
    birthCityUnknown?: boolean;
    birthCountry: string;
    countryOfEligibilitySame?: "YES" | "NO" | string;
    alternativeCountryOfEligibility?: string;
    photoUrl?: string;
    mailingAddress: {
      inCareOf?: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      districtStateCounty: string;
      postalCode?: string;
      noPostalCode?: boolean;
      country: string;
    };
    currentCountry: string;
    phoneNumber?: string;
    email: string;
    educationLevel: string;
    maritalStatus: string;
    numberOfChildren?: number;
  };
  spouse?: {
    name: {
      lastName: string;
      firstName?: string;
      middleName?: string;
      noFirstName?: boolean;
      noMiddleName?: boolean;
    };
    gender: "MALE" | "FEMALE" | string;
    dob:
      | {
          month: string | number;
          day: string | number;
          year: string | number;
        }
      | string
      | Date;
    birthCity: string;
    birthCityUnknown?: boolean;
    birthCountry: string;
    photoUrl?: string;
  } | null;
  children?: Array<{
    name: {
      lastName: string;
      firstName?: string;
      middleName?: string;
      noFirstName?: boolean;
      noMiddleName?: boolean;
    };
    gender: "MALE" | "FEMALE" | string;
    dob:
      | {
          month: string | number;
          day: string | number;
          year: string | number;
        }
      | string
      | Date;
    birthCity: string;
    birthCityUnknown?: boolean;
    birthCountry: string;
    photoUrl?: string;
  }>;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  stationaryName: string;
  timestamp: string;
  relativeTime: string;
  isRead: boolean;
  submissionId?: string;
  type: "SUBMISSION" | "AGENT" | "SYSTEM";
}
