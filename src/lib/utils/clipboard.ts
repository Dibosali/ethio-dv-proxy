import { SubmissionSummary } from "@/types/admin";
import { EducationLevel, MaritalStatus } from "@/types/form";

const EDUCATION_LABELS: Record<EducationLevel, string> = {
  PRIMARY_ONLY: "Primary school only",
  HIGH_SCHOOL_NO_DEGREE: "High School, no degree",
  HIGH_SCHOOL_DEGREE: "High School degree",
  VOCATIONAL_SCHOOL: "Vocational School",
  SOME_UNIVERSITY: "Some University Courses",
  UNIVERSITY_DEGREE: "University Degree",
  SOME_GRADUATE: "Some Graduate Level Courses",
  MASTERS_DEGREE: "Master's Degree",
  SOME_DOCTORATE: "Some Doctorate Level Courses",
  DOCTORATE_DEGREE: "Doctorate Degree",
};

const MARITAL_LABELS: Record<MaritalStatus, string> = {
  UNMARRIED: "Unmarried",
  MARRIED_NON_LPR: "Married and my spouse is NOT a U.S. citizen or LPR",
  MARRIED_LPR: "Married and my spouse IS a U.S. citizen or LPR",
  DIVORCED: "Divorced",
  WIDOWED: "Widowed",
  LEGALLY_SEPARATED: "Legally Separated",
};

/**
 * Formats a full submission record into a clean, human-readable plain text string
 * suitable for clipboard pasting, printing, or sending to proxy agents.
 */
export function formatSubmissionToPlainText(submission: SubmissionSummary): string {
  const f = submission.formData;
  const p = f?.primaryEntrant;
  const spouse = f?.spouse;
  const children = f?.children || [];

  const submissionDateFormatted = (() => {
    try {
      return new Date(submission.submittedAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return submission.submittedAt;
    }
  })();

  const lines: string[] = [
    "================================================================================",
    "            ELECTRONIC DIVERSITY VISA ENTRY (DV-2026) APPLICANT RECORD          ",
    "================================================================================",
    `Confirmation Number : ${submission.confirmationNumber}`,
    `Processing Station  : ${submission.stationaryName} (@${submission.agentUsername})`,
    `Station Contact     : ${submission.contactPhone || "Registered on file"}`,
    `Submission Date     : ${submissionDateFormatted}`,
    `System Status       : ${submission.status}`,
    "--------------------------------------------------------------------------------",
    "",
    "============================= PART 1: PRIMARY ENTRANT ==========================",
  ];

  if (p) {
    const lastName = p.name.lastName || "N/A";
    const firstName = p.name.noFirstName ? "(No First Name)" : p.name.firstName || "N/A";
    const middleName = p.name.noMiddleName ? "(No Middle Name)" : p.name.middleName || "N/A";

    lines.push(
      `1. Full Name           : ${lastName}, ${firstName} ${middleName}`.trim(),
      `   - Last / Family Name: ${lastName}`,
      `   - First / Given Name: ${firstName}`,
      `   - Middle Name       : ${middleName}`,
      `2. Gender              : ${p.gender === "MALE" ? "Male" : "Female"}`,
      `3. Date of Birth       : ${p.dob.month}/${p.dob.day}/${p.dob.year} (MM/DD/YYYY)`,
      `4. Birth City          : ${p.birthCityUnknown ? "Unknown" : p.birthCity || "N/A"}`,
      `5. Birth Country       : ${p.birthCountry || "N/A"}`,
      `6. Eligibility Country : ${
        p.countryOfEligibilitySame === "YES"
          ? `Same as Country of Birth (${p.birthCountry})`
          : `Claimed under: ${p.alternativeCountryOfEligibility || "N/A"}`
      }`,
      "7. Entrant Photograph  : Submitted and verified on record",
      `8. Mailing Address     :`,
      `   - In Care Of        : ${p.mailingAddress.inCareOf || "(None)"}`,
      `   - Address Line 1    : ${p.mailingAddress.addressLine1}`,
      `   - Address Line 2    : ${p.mailingAddress.addressLine2 || "(None)"}`,
      `   - City / Town       : ${p.mailingAddress.city}`,
      `   - District / County : ${p.mailingAddress.districtStateCounty}`,
      `   - Postal / Zip Code : ${
        p.mailingAddress.noPostalCode ? "No Postal/Zip Code" : p.mailingAddress.postalCode || "N/A"
      }`,
      `   - Country           : ${p.mailingAddress.country}`,
      `9. Current Country     : ${p.currentCountry}`,
      `10. Contact Info       :`,
      `    - Phone Number     : ${p.phoneNumber || "(Optional - Not provided)"}`,
      `    - Email Address    : ${p.email}`,
      `11. Education Level    : ${EDUCATION_LABELS[p.educationLevel] || p.educationLevel}`,
      `12. Marital Status     : ${MARITAL_LABELS[p.maritalStatus] || submission.maritalStatus}`,
      `13. Number of Children : ${p.numberOfChildren}`
    );
  } else {
    // Fallback if formData is missing
    lines.push(
      `Primary Name        : ${submission.applicantName}`,
      `Marital Status      : ${submission.maritalStatus}`,
      `Number of Children  : ${submission.childrenCount}`,
      `Contact Email       : ${submission.contactEmail || "N/A"}`,
      `Contact Phone       : ${submission.contactPhone || "N/A"}`
    );
  }

  lines.push("", "=========================== PART 2: DERIVATIVES ============================");

  // Spouse Section
  if (spouse) {
    const sLastName = spouse.name.lastName || "N/A";
    const sFirstName = spouse.name.noFirstName ? "(No First Name)" : spouse.name.firstName || "N/A";
    const sMiddleName = spouse.name.noMiddleName ? "(No Middle Name)" : spouse.name.middleName || "N/A";

    lines.push(
      "[SPOUSE INFORMATION]",
      `Name               : ${sLastName}, ${sFirstName} ${sMiddleName}`.trim(),
      `Gender             : ${spouse.gender === "MALE" ? "Male" : "Female"}`,
      `Date of Birth      : ${spouse.dob.month}/${spouse.dob.day}/${spouse.dob.year} (MM/DD/YYYY)`,
      `City of Birth      : ${spouse.birthCityUnknown ? "Unknown" : spouse.birthCity || "N/A"}`,
      `Country of Birth   : ${spouse.birthCountry || "N/A"}`,
      "Photograph         : Submitted on record",
      ""
    );
  } else {
    lines.push("Spouse Information : None required (Unmarried / Separated / Not claimed)", "");
  }

  // Children Section
  if (children.length > 0) {
    lines.push(`[CHILDREN INFORMATION - TOTAL: ${children.length}]`);
    children.forEach((child, idx) => {
      const cLastName = child.name.lastName || "N/A";
      const cFirstName = child.name.noFirstName ? "(No First Name)" : child.name.firstName || "N/A";
      const cMiddleName = child.name.noMiddleName ? "(No Middle Name)" : child.name.middleName || "N/A";

      lines.push(
        `--- Child ${idx + 1} ---`,
        `Name             : ${cLastName}, ${cFirstName} ${cMiddleName}`.trim(),
        `Gender           : ${child.gender === "MALE" ? "Male" : "Female"}`,
        `Date of Birth    : ${child.dob.month}/${child.dob.day}/${child.dob.year} (MM/DD/YYYY)`,
        `City of Birth    : ${child.birthCityUnknown ? "Unknown" : child.birthCity || "N/A"}`,
        `Country of Birth : ${child.birthCountry || "N/A"}`,
        "Photograph       : Submitted on record"
      );
    });
  } else {
    lines.push("Children Information : 0 Children registered");
  }

  lines.push(
    "",
    "================================================================================",
    `END OF RECORD [Generated: ${new Date().toISOString()}]`,
    "================================================================================"
  );

  return lines.join("\n");
}
