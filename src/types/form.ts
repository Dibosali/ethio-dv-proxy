export type Gender = "MALE" | "FEMALE";

export interface FullNameData {
  lastName: string;
  firstName: string;
  middleName: string;
  noFirstName: boolean;
  noMiddleName: boolean;
}

export interface DateOfBirthData {
  month: string;
  day: string;
  year: string;
}

export interface MailingAddressData {
  inCareOf?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  districtStateCounty: string;
  postalCode?: string;
  noPostalCode: boolean;
  country: string;
}

export type MaritalStatus =
  | "UNMARRIED"
  | "MARRIED_NON_LPR"
  | "MARRIED_LPR"
  | "DIVORCED"
  | "WIDOWED"
  | "LEGALLY_SEPARATED";

export type EducationLevel =
  | "PRIMARY_ONLY"
  | "HIGH_SCHOOL_NO_DEGREE"
  | "HIGH_SCHOOL_DEGREE"
  | "VOCATIONAL_SCHOOL"
  | "SOME_UNIVERSITY"
  | "UNIVERSITY_DEGREE"
  | "SOME_GRADUATE"
  | "MASTERS_DEGREE"
  | "SOME_DOCTORATE"
  | "DOCTORATE_DEGREE";

export interface DerivativePersonData {
  name: FullNameData;
  dob: DateOfBirthData;
  gender: Gender;
  birthCity: string;
  birthCityUnknown: boolean;
  birthCountry: string;
  photo?: File | null;
}

export interface PrimaryEntrantData {
  name: FullNameData;
  gender: Gender;
  dob: DateOfBirthData;
  birthCity: string;
  birthCityUnknown: boolean;
  birthCountry: string;
  countryOfEligibilitySame: "YES" | "NO";
  alternativeCountryOfEligibility?: string;
  photo?: File | null;
  mailingAddress: MailingAddressData;
  currentCountry: string;
  phoneNumber?: string;
  email: string;
  confirmEmail: string;
  educationLevel: EducationLevel;
  maritalStatus: MaritalStatus;
  enterSpouseInfo?: boolean;
  numberOfChildren: number;
}

export interface DVFormData {
  primaryEntrant: PrimaryEntrantData;
  spouse?: DerivativePersonData;
  children: DerivativePersonData[];
}
