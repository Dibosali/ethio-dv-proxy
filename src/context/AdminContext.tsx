"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  AgentUser,
  AdminNotification,
  SubmissionSummary,
  PaymentSettings,
  UpdateAgentDTO,
  ReportPaymentDTO,
} from "@/types/admin";
import { DVFormData } from "@/types/form";
import {
  getPaymentSettingsAction,
  updatePaymentSettingsAction,
} from "@/actions/settings";
import {
  getProxyAgents,
  toggleAgentStatus as toggleAgentStatusAction,
  deleteProxyAgent as deleteProxyAgentAction,
  updateProxyAgent as updateProxyAgentAction,
} from "@/actions/agent";
import {
  recordPaymentAction,
  toggleSubmissionPaidAction,
  toggleSubmissionFilledAction,
} from "@/actions/submission";

export function generateSecurePassword(length = 14): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "!@#$%&*";
  const all = upper + lower + numbers + symbols;

  let password =
    upper[Math.floor(Math.random() * upper.length)] +
    lower[Math.floor(Math.random() * lower.length)] +
    numbers[Math.floor(Math.random() * numbers.length)] +
    symbols[Math.floor(Math.random() * symbols.length)];

  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  return password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
}

export function formatAgentCredentialsText(agent: {
  username: string;
  password?: string;
  stationaryName: string;
  phoneNumber: string;
  portalUrl?: string;
}): string {
  const url = agent.portalUrl || "https://dv-proxy.gov.et/agent/login";
  return `╔═══════════════════════════════════════════════╗
║  🌍 DV-2026 PROXY AGENT ACCESS CREDENTIALS    ║
╚═══════════════════════════════════════════════╝

🏢 Stationary / Shop: ${agent.stationaryName}
👤 Username: ${agent.username}
🔑 Password: ${agent.password || "[Saved Securely]"}
📞 Registered Phone: ${agent.phoneNumber}
🌐 Agent Login Portal: ${url}

⚠️ SECURITY INSTRUCTIONS:
1. Log in immediately and confirm your physical terminal.
2. Only authorized personnel at ${agent.stationaryName} should use this account.
3. All entrant forms processed will be permanently associated with your shop ID.

Generated: ${new Date().toLocaleDateString("en-US", { dateStyle: "medium" })}`;
}

// Reusable SVG placeholder avatar data URL for local offline testing
const makeSampleAvatar = (text: string, bg1 = "#2563eb", bg2 = "#4f46e5") =>
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${encodeURIComponent(
    bg1
  )}"/><stop offset="100%" stop-color="${encodeURIComponent(
    bg2
  )}"/></linearGradient></defs><rect width="600" height="600" fill="url(%23g)"/><circle cx="300" cy="240" r="110" fill="%23ffffff" fill-opacity="0.95"/><path d="M120 540 C120 400, 200 370, 300 370 C400 370, 480 400, 480 540 Z" fill="%23ffffff" fill-opacity="0.95"/><text x="300" y="270" font-family="Arial,sans-serif" font-size="60" font-weight="bold" fill="%231e293b" text-anchor="middle">${encodeURIComponent(
    text
  )}</text></svg>`;

const INITIAL_MOCK_AGENTS: AgentUser[] = [
  {
    id: "agt-001",
    username: "bole_star_stationery",
    password: "Dv2026#BoleStar9!",
    role: "AGENT",
    isActive: true,
    createdAt: "2026-10-15T09:30:00Z",
    totalSubmissions: 42,
    lastActive: "10 mins ago",
    profile: {
      stationaryName: "Bole Star Stationery & Cyber",
      phoneNumber: "+251 91 123 4567",
      city: "Addis Ababa",
      subCityDistrict: "Bole Sub-City, Next to Edna Mall",
      notes: "High volume proxy station with certified photo equipment.",
    },
  },
  {
    id: "agt-002",
    username: "kazanchis_express_dv",
    password: "Dv2026#KazExp4$",
    role: "AGENT",
    isActive: true,
    createdAt: "2026-10-18T14:15:00Z",
    totalSubmissions: 28,
    lastActive: "1 hour ago",
    profile: {
      stationaryName: "Kazanchis Express Photo & Print",
      phoneNumber: "+251 92 888 9911",
      city: "Addis Ababa",
      subCityDistrict: "Kirkos, Near UNECA",
      notes: "Dedicated passport photo studio.",
    },
  },
  {
    id: "agt-003",
    username: "piazza_digital_hub",
    password: "Dv2026#Piazza77!",
    role: "AGENT",
    isActive: true,
    createdAt: "2026-10-22T11:00:00Z",
    totalSubmissions: 15,
    lastActive: "3 hours ago",
    profile: {
      stationaryName: "Piazza Central Bookshop & Cyber",
      phoneNumber: "+251 94 555 1234",
      city: "Addis Ababa",
      subCityDistrict: "Arada, Commercial Bank Building",
      notes: "Historical bookshop with modern internet branch.",
    },
  },
];

const INITIAL_MOCK_SUBMISSIONS: SubmissionSummary[] = [
  {
    id: "sub-1001",
    confirmationNumber: "20261AB98214K7",
    applicantName: "ABEBE BIKILA KEBEDE",
    stationaryName: "Bole Star Stationery & Cyber",
    agentId: "agt-001",
    agentUsername: "bole_star_stationery",
    maritalStatus: "Married (Non-U.S. Citizen)",
    maritalStatusRaw: "MARRIED_NON_LPR",
    childrenCount: 2,
    submittedAt: "2026-10-29T14:32:00Z",
    status: "SUBMITTED",
    photoUrl: makeSampleAvatar("AB", "#1e40af", "#3b82f6"),
    spousePhotoUrl: makeSampleAvatar("TK", "#047857", "#10b981"),
    childrenPhotoUrls: [
      makeSampleAvatar("DK", "#b45309", "#f59e0b"),
      makeSampleAvatar("HK", "#6d28d9", "#8b5cf6"),
    ],
    contactEmail: "abebe.kebede.official@gmail.com",
    contactPhone: "+251 91 123 4567",
    formData: {
      primaryEntrant: {
        name: {
          lastName: "KEBEDE",
          firstName: "ABEBE",
          middleName: "BIKILA",
          noFirstName: false,
          noMiddleName: false,
        },
        gender: "MALE",
        dob: { month: "07", day: "14", year: "1991" },
        birthCity: "Addis Ababa",
        birthCityUnknown: false,
        birthCountry: "Ethiopia",
        countryOfEligibilitySame: "YES",
        mailingAddress: {
          addressLine1: "Bole Sub-City, Woreda 03, House 412",
          city: "Addis Ababa",
          districtStateCounty: "Addis Ababa",
          postalCode: "1000",
          noPostalCode: false,
          country: "Ethiopia",
        },
        currentCountry: "Ethiopia",
        phoneNumber: "+251 91 123 4567",
        email: "abebe.kebede.official@gmail.com",
        confirmEmail: "abebe.kebede.official@gmail.com",
        educationLevel: "UNIVERSITY_DEGREE",
        maritalStatus: "MARRIED_NON_LPR",
        numberOfChildren: 2,
      },
      spouse: {
        name: {
          lastName: "KEBEDE",
          firstName: "TIGIST",
          middleName: "ASSEFA",
          noFirstName: false,
          noMiddleName: false,
        },
        dob: { month: "03", day: "22", year: "1994" },
        gender: "FEMALE",
        birthCity: "Hawassa",
        birthCityUnknown: false,
        birthCountry: "Ethiopia",
      },
      children: [
        {
          name: {
            lastName: "KEBEDE",
            firstName: "DAWIT",
            middleName: "ABEBE",
            noFirstName: false,
            noMiddleName: false,
          },
          dob: { month: "11", day: "05", year: "2018" },
          gender: "MALE",
          birthCity: "Addis Ababa",
          birthCityUnknown: false,
          birthCountry: "Ethiopia",
        },
        {
          name: {
            lastName: "KEBEDE",
            firstName: "HELEN",
            middleName: "ABEBE",
            noFirstName: false,
            noMiddleName: false,
          },
          dob: { month: "02", day: "19", year: "2021" },
          gender: "FEMALE",
          birthCity: "Addis Ababa",
          birthCityUnknown: false,
          birthCountry: "Ethiopia",
        },
      ],
    },
  },
  {
    id: "sub-1002",
    confirmationNumber: "20261CD45902M1",
    applicantName: "SELAMAWIT HAILE GEBRE",
    stationaryName: "Kazanchis Express Photo & Print",
    agentId: "agt-002",
    agentUsername: "kazanchis_express_dv",
    maritalStatus: "Unmarried",
    maritalStatusRaw: "UNMARRIED",
    childrenCount: 0,
    submittedAt: "2026-10-29T11:15:00Z",
    status: "SUBMITTED",
    photoUrl: makeSampleAvatar("SH", "#be123c", "#f43f5e"),
    contactEmail: "selamawit.haile@yahoo.com",
    contactPhone: "+251 92 888 9911",
    formData: {
      primaryEntrant: {
        name: {
          lastName: "GEBRE",
          firstName: "SELAMAWIT",
          middleName: "HAILE",
          noFirstName: false,
          noMiddleName: false,
        },
        gender: "FEMALE",
        dob: { month: "12", day: "03", year: "1996" },
        birthCity: "Mekelle",
        birthCityUnknown: false,
        birthCountry: "Ethiopia",
        countryOfEligibilitySame: "YES",
        mailingAddress: {
          addressLine1: "Kirkos Sub-City, Near UNECA",
          city: "Addis Ababa",
          districtStateCounty: "Addis Ababa",
          noPostalCode: true,
          country: "Ethiopia",
        },
        currentCountry: "Ethiopia",
        phoneNumber: "+251 92 888 9911",
        email: "selamawit.haile@yahoo.com",
        confirmEmail: "selamawit.haile@yahoo.com",
        educationLevel: "MASTERS_DEGREE",
        maritalStatus: "UNMARRIED",
        numberOfChildren: 0,
      },
      children: [],
    },
  },
  {
    id: "sub-1003",
    confirmationNumber: "20261EF77190P9",
    applicantName: "YOHANNES TESFAYE TADESSE",
    stationaryName: "Bole Star Stationery & Cyber",
    agentId: "agt-001",
    agentUsername: "bole_star_stationery",
    maritalStatus: "Married (Non-U.S. Citizen)",
    maritalStatusRaw: "MARRIED_NON_LPR",
    childrenCount: 1,
    submittedAt: "2026-10-28T16:45:00Z",
    status: "APPROVED",
    photoUrl: makeSampleAvatar("YT", "#0f766e", "#14b8a6"),
    spousePhotoUrl: makeSampleAvatar("MT", "#9333ea", "#a855f7"),
    childrenPhotoUrls: [makeSampleAvatar("NT", "#ca8a04", "#eab308")],
    contactEmail: "yohannes.tesfaye@outlook.com",
    contactPhone: "+251 91 555 4321",
    formData: {
      primaryEntrant: {
        name: {
          lastName: "TADESSE",
          firstName: "YOHANNES",
          middleName: "TESFAYE",
          noFirstName: false,
          noMiddleName: false,
        },
        gender: "MALE",
        dob: { month: "04", day: "18", year: "1989" },
        birthCity: "Bahir Dar",
        birthCityUnknown: false,
        birthCountry: "Ethiopia",
        countryOfEligibilitySame: "YES",
        mailingAddress: {
          addressLine1: "Kebele 04, Lake View Road",
          city: "Bahir Dar",
          districtStateCounty: "Amhara",
          noPostalCode: true,
          country: "Ethiopia",
        },
        currentCountry: "Ethiopia",
        phoneNumber: "+251 91 555 4321",
        email: "yohannes.tesfaye@outlook.com",
        confirmEmail: "yohannes.tesfaye@outlook.com",
        educationLevel: "UNIVERSITY_DEGREE",
        maritalStatus: "MARRIED_NON_LPR",
        numberOfChildren: 1,
      },
      spouse: {
        name: {
          lastName: "TADESSE",
          firstName: "MERON",
          middleName: "TSEGAYE",
          noFirstName: false,
          noMiddleName: false,
        },
        dob: { month: "09", day: "11", year: "1993" },
        gender: "FEMALE",
        birthCity: "Gondar",
        birthCityUnknown: false,
        birthCountry: "Ethiopia",
      },
      children: [
        {
          name: {
            lastName: "TADESSE",
            firstName: "NATHAN",
            middleName: "YOHANNES",
            noFirstName: false,
            noMiddleName: false,
          },
          dob: { month: "06", day: "30", year: "2020" },
          gender: "MALE",
          birthCity: "Bahir Dar",
          birthCityUnknown: false,
          birthCountry: "Ethiopia",
        },
      ],
    },
  },
  {
    id: "sub-1004",
    confirmationNumber: "20261GH33881Q2",
    applicantName: "BETELHEM MEKONNEN ALEMU",
    stationaryName: "Piazza Central Bookshop & Cyber",
    agentId: "agt-003",
    agentUsername: "piazza_digital_hub",
    maritalStatus: "Unmarried",
    maritalStatusRaw: "UNMARRIED",
    childrenCount: 0,
    submittedAt: "2026-10-28T10:20:00Z",
    status: "PENDING_REVIEW",
    photoUrl: makeSampleAvatar("BM", "#c2410c", "#f97316"),
    contactEmail: "betty.mekonnen@gmail.com",
    contactPhone: "+251 94 555 1234",
    formData: {
      primaryEntrant: {
        name: {
          lastName: "ALEMU",
          firstName: "BETELHEM",
          middleName: "MEKONNEN",
          noFirstName: false,
          noMiddleName: false,
        },
        gender: "FEMALE",
        dob: { month: "08", day: "29", year: "1998" },
        birthCity: "Addis Ababa",
        birthCityUnknown: false,
        birthCountry: "Ethiopia",
        countryOfEligibilitySame: "YES",
        mailingAddress: {
          addressLine1: "Arada Sub-City, Piazza Commercial Center",
          city: "Addis Ababa",
          districtStateCounty: "Addis Ababa",
          noPostalCode: true,
          country: "Ethiopia",
        },
        currentCountry: "Ethiopia",
        phoneNumber: "+251 94 555 1234",
        email: "betty.mekonnen@gmail.com",
        confirmEmail: "betty.mekonnen@gmail.com",
        educationLevel: "HIGH_SCHOOL_DEGREE",
        maritalStatus: "UNMARRIED",
        numberOfChildren: 0,
      },
      children: [],
    },
  },
  {
    id: "sub-1005",
    confirmationNumber: "20261JK99234R8",
    applicantName: "DAWIT SOLOMON WORKU",
    stationaryName: "Kazanchis Express Photo & Print",
    agentId: "agt-002",
    agentUsername: "kazanchis_express_dv",
    maritalStatus: "Married (Non-U.S. Citizen)",
    maritalStatusRaw: "MARRIED_NON_LPR",
    childrenCount: 3,
    submittedAt: "2026-10-27T15:10:00Z",
    status: "SUBMITTED",
    photoUrl: makeSampleAvatar("DS", "#1d4ed8", "#60a5fa"),
    spousePhotoUrl: makeSampleAvatar("HW", "#be185d", "#f472b6"),
    childrenPhotoUrls: [
      makeSampleAvatar("SW", "#047857", "#34d399"),
      makeSampleAvatar("EW", "#d97706", "#fbbf24"),
      makeSampleAvatar("MW", "#7c3aed", "#a78bfa"),
    ],
    contactEmail: "dawit.solomon.worku@gmail.com",
    contactPhone: "+251 92 111 2233",
    formData: {
      primaryEntrant: {
        name: {
          lastName: "WORKU",
          firstName: "DAWIT",
          middleName: "SOLOMON",
          noFirstName: false,
          noMiddleName: false,
        },
        gender: "MALE",
        dob: { month: "01", day: "15", year: "1985" },
        birthCity: "Dire Dawa",
        birthCityUnknown: false,
        birthCountry: "Ethiopia",
        countryOfEligibilitySame: "YES",
        mailingAddress: {
          addressLine1: "Kazanchis, Guinea Conakry St.",
          city: "Addis Ababa",
          districtStateCounty: "Addis Ababa",
          postalCode: "1000",
          noPostalCode: false,
          country: "Ethiopia",
        },
        currentCountry: "Ethiopia",
        phoneNumber: "+251 92 111 2233",
        email: "dawit.solomon.worku@gmail.com",
        confirmEmail: "dawit.solomon.worku@gmail.com",
        educationLevel: "UNIVERSITY_DEGREE",
        maritalStatus: "MARRIED_NON_LPR",
        numberOfChildren: 3,
      },
      spouse: {
        name: {
          lastName: "WORKU",
          firstName: "HIWOT",
          middleName: "BERHANE",
          noFirstName: false,
          noMiddleName: false,
        },
        dob: { month: "05", day: "19", year: "1988" },
        gender: "FEMALE",
        birthCity: "Dire Dawa",
        birthCityUnknown: false,
        birthCountry: "Ethiopia",
      },
      children: [
        {
          name: {
            lastName: "WORKU",
            firstName: "SAMUEL",
            middleName: "DAWIT",
            noFirstName: false,
            noMiddleName: false,
          },
          dob: { month: "09", day: "12", year: "2015" },
          gender: "MALE",
          birthCity: "Addis Ababa",
          birthCityUnknown: false,
          birthCountry: "Ethiopia",
        },
        {
          name: {
            lastName: "WORKU",
            firstName: "EDEN",
            middleName: "DAWIT",
            noFirstName: false,
            noMiddleName: false,
          },
          dob: { month: "03", day: "08", year: "2018" },
          gender: "FEMALE",
          birthCity: "Addis Ababa",
          birthCityUnknown: false,
          birthCountry: "Ethiopia",
        },
        {
          name: {
            lastName: "WORKU",
            firstName: "MICHAEL",
            middleName: "DAWIT",
            noFirstName: false,
            noMiddleName: false,
          },
          dob: { month: "12", day: "01", year: "2022" },
          gender: "MALE",
          birthCity: "Addis Ababa",
          birthCityUnknown: false,
          birthCountry: "Ethiopia",
        },
      ],
    },
  },
  {
    id: "sub-1006",
    confirmationNumber: "20261LM88341S3",
    applicantName: "MERON GIRMA BEZABIH",
    stationaryName: "Piazza Central Bookshop & Cyber",
    agentId: "agt-003",
    agentUsername: "piazza_digital_hub",
    maritalStatus: "Legally Separated",
    maritalStatusRaw: "LEGALLY_SEPARATED",
    childrenCount: 1,
    submittedAt: "2026-10-27T09:40:00Z",
    status: "SUBMITTED",
    photoUrl: makeSampleAvatar("MG", "#059669", "#10b981"),
    childrenPhotoUrls: [makeSampleAvatar("EB", "#db2777", "#f472b6")],
    contactEmail: "meron.girma.bezabih@gmail.com",
    contactPhone: "+251 93 444 8877",
    formData: {
      primaryEntrant: {
        name: {
          lastName: "BEZABIH",
          firstName: "MERON",
          middleName: "GIRMA",
          noFirstName: false,
          noMiddleName: false,
        },
        gender: "FEMALE",
        dob: { month: "10", day: "04", year: "1992" },
        birthCity: "Hawassa",
        birthCityUnknown: false,
        birthCountry: "Ethiopia",
        countryOfEligibilitySame: "YES",
        mailingAddress: {
          addressLine1: "Arada, Behind Cinema Empire",
          city: "Addis Ababa",
          districtStateCounty: "Addis Ababa",
          noPostalCode: true,
          country: "Ethiopia",
        },
        currentCountry: "Ethiopia",
        phoneNumber: "+251 93 444 8877",
        email: "meron.girma.bezabih@gmail.com",
        confirmEmail: "meron.girma.bezabih@gmail.com",
        educationLevel: "UNIVERSITY_DEGREE",
        maritalStatus: "LEGALLY_SEPARATED",
        enterSpouseInfo: false,
        numberOfChildren: 1,
      },
      children: [
        {
          name: {
            lastName: "BEZABIH",
            firstName: "ELIANA",
            middleName: "MERON",
            noFirstName: false,
            noMiddleName: false,
          },
          dob: { month: "08", day: "14", year: "2019" },
          gender: "FEMALE",
          birthCity: "Hawassa",
          birthCityUnknown: false,
          birthCountry: "Ethiopia",
        },
      ],
    },
  },
];

const INITIAL_MOCK_NOTIFICATIONS: AdminNotification[] = [
  {
    id: "notif-1",
    title: "New DV Form Submitted",
    message: "New DV form submitted by Bole Star Stationery & Cyber",
    stationaryName: "Bole Star Stationery & Cyber",
    timestamp: "2026-10-29T14:32:00Z",
    relativeTime: "5 mins ago",
    isRead: false,
    submissionId: "sub-1001",
    type: "SUBMISSION",
  },
  {
    id: "notif-2",
    title: "New DV Form Submitted",
    message: "New DV form submitted by Kazanchis Express Photo & Print",
    stationaryName: "Kazanchis Express Photo & Print",
    timestamp: "2026-10-29T11:15:00Z",
    relativeTime: "42 mins ago",
    isRead: false,
    submissionId: "sub-1002",
    type: "SUBMISSION",
  },
  {
    id: "notif-3",
    title: "New DV Form Submitted",
    message: "New DV form submitted by Bole Star Stationery & Cyber",
    stationaryName: "Bole Star Stationery & Cyber",
    timestamp: "2026-10-28T16:45:00Z",
    relativeTime: "2 hours ago",
    isRead: false,
    submissionId: "sub-1003",
    type: "SUBMISSION",
  },
  {
    id: "notif-4",
    title: "New DV Form Submitted",
    message: "New DV form submitted by Piazza Central Bookshop & Cyber",
    stationaryName: "Piazza Central Bookshop & Cyber",
    timestamp: "2026-10-28T10:20:00Z",
    relativeTime: "5 hours ago",
    isRead: true,
    submissionId: "sub-1004",
    type: "SUBMISSION",
  },
  {
    id: "notif-5",
    title: "Proxy Agent Activated",
    message: "Piazza Central Bookshop & Cyber generated credentials and logged in",
    stationaryName: "Piazza Central Bookshop & Cyber",
    timestamp: "2026-10-27T08:00:00Z",
    relativeTime: "Yesterday",
    isRead: true,
    type: "AGENT",
  },
];

interface AdminContextType {
  agents: AgentUser[];
  addAgent: (
    agentData: Omit<AgentUser, "id" | "createdAt" | "totalSubmissions" | "role"> & { id?: string }
  ) => AgentUser;
  updateAgent: (data: UpdateAgentDTO) => Promise<boolean>;
  toggleAgentStatus: (agentId: string) => Promise<boolean>;
  deleteAgent: (agentId: string) => Promise<boolean>;
  refreshAgents: () => Promise<void>;

  // Submissions State (Phase 2 & 3 & 4)
  submissions: SubmissionSummary[];
  deleteSubmission: (submissionId: string) => void;
  getSubmissionById: (id: string) => SubmissionSummary | undefined;
  toggleSubmissionPaid: (id: string) => void;
  toggleSubmissionFilled: (id: string) => void;
  recordSubmissionPayment: (data: ReportPaymentDTO) => Promise<{
    success: boolean;
    error?: string;
    message?: string;
    data?: any;
  }>;

  // Payment & Billing Configuration
  paymentSettings: PaymentSettings;
  updatePaymentSettings: (data: Partial<PaymentSettings>) => Promise<boolean>;
  getStationarySubmissions: (identifier?: string) => SubmissionSummary[];
  getStationaryStats: (identifier?: string) => {
    totalSent: number;
    totalFilled: number;
    filledUnpaid: number;
    totalPaid: number;
    amountOwed: number;
    amountPaid: number;
  };

  // Retractable Sidebar State
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Notifications State (Phase 2)
  notifications: AdminNotification[];
  unreadCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotification: (id: string) => void;

  activeSidebarItem: string;
  setActiveSidebarItem: (item: string) => void;
}

const DEFAULT_PAYMENT_CONFIG: PaymentSettings = {
  feePerForm: 200,
  currency: "ETB",
  cbeAccountNumber: "1000123456789",
  cbeAccountName: "DV PROXY MANAGEMENT SERVICES",
  telebirrPhone: "+251 91 123 4567",
  telebirrName: "DV PROXY SERVICES",
  paymentNotice: "Please include your shop username in the transfer remark for instant confirmation.",
};

const AdminContext = createContext<AdminContextType | null>(null);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [agents, setAgents] = useState<AgentUser[]>(INITIAL_MOCK_AGENTS);
  const [submissions, setSubmissions] = useState<SubmissionSummary[]>(() =>
    INITIAL_MOCK_SUBMISSIONS.map((s, idx) => {
      // Create initial realistic filled & unpaid state
      // sub-1001 & sub-1003: filled & unpaid for Bole Star
      // sub-1002: filled & unpaid for Kazanchis
      // sub-1005: filled & paid
      const isFilled = idx === 0 || idx === 1 || idx === 2 || idx === 4;
      const isPaid = idx === 4;
      return {
        ...s,
        isFilled,
        isPaid,
        filledStatus: isFilled ? "FILLED" : "UNFILLED",
        paymentStatus: isPaid ? "PAID" : "UNPAID",
      };
    })
  );
  const [paymentSettings, setPaymentSettings] =
    useState<PaymentSettings>(DEFAULT_PAYMENT_CONFIG);
  const [notifications, setNotifications] = useState<AdminNotification[]>(
    INITIAL_MOCK_NOTIFICATIONS
  );
  const [activeSidebarItem, setActiveSidebarItem] =
    useState<string>("dashboard");
  const [isSidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Sync payment settings and real proxy agents with Neon DB on mount
  const refreshAgents = async () => {
    try {
      const res = await getProxyAgents();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setAgents(res.data as AgentUser[]);
      }
    } catch (err) {
      console.warn("Could not fetch remote proxy agents, using defaults.", err);
    }
  };

  const addAgent = (
    agentData: Omit<AgentUser, "id" | "createdAt" | "totalSubmissions" | "role"> & { id?: string }
  ): AgentUser => {
    const newAgent: AgentUser = {
      ...agentData,
      id: agentData.id || `agt-${Date.now().toString().slice(-4)}`,
      role: "AGENT",
      createdAt: new Date().toISOString(),
      totalSubmissions: 0,
      lastActive: "Just now",
    };
    setAgents((prev) => [newAgent, ...prev]);
    return newAgent;
  };

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await getPaymentSettingsAction();
        if (res.success && res.data) {
          setPaymentSettings(res.data);
        }
      } catch (err) {
        console.warn("Could not fetch remote payment settings, using defaults.", err);
      }
    }
    loadSettings();
    refreshAgents();
  }, []);

  const updatePaymentSettings = async (
    data: Partial<PaymentSettings>
  ): Promise<boolean> => {
    const nextSettings = { ...paymentSettings, ...data };
    setPaymentSettings(nextSettings);

    try {
      const res = await updatePaymentSettingsAction(data);
      if (res.success && res.data) {
        setPaymentSettings(res.data);
        return true;
      }
      return false;
    } catch {
      return true; // Keep local optimistic state
    }
  };

  const getStationarySubmissions = (identifier?: string): SubmissionSummary[] => {
    if (!identifier || identifier === "ALL") return submissions;
    const q = identifier.toLowerCase().trim();
    return submissions.filter(
      (s) =>
        s.stationaryName.toLowerCase().includes(q) ||
        s.agentUsername.toLowerCase().includes(q) ||
        s.agentId.toLowerCase() === q
    );
  };

  const getStationaryStats = (identifier?: string) => {
    const list = getStationarySubmissions(identifier);
    const totalSent = list.length;
    const totalFilled = list.filter((s) => s.isFilled).length;
    const filledUnpaid = list.filter((s) => s.isFilled && !s.isPaid).length;
    const totalPaid = list.filter((s) => s.isPaid).length;
    const amountOwed = filledUnpaid * paymentSettings.feePerForm;
    const amountPaid = totalPaid * paymentSettings.feePerForm;

    return {
      totalSent,
      totalFilled,
      filledUnpaid,
      totalPaid,
      amountOwed,
      amountPaid,
    };
  };

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const toggleSubmissionPaid = async (id: string) => {
    const current = submissions.find((s) => s.id === id);
    const next = !current?.isPaid;

    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            isPaid: next,
            paymentStatus: next ? "PAID" : "UNPAID",
            paidAt: next ? new Date().toISOString() : undefined,
          };
        }
        return s;
      })
    );

    try {
      await toggleSubmissionPaidAction(id, next);
    } catch (err) {
      console.warn("Could not sync payment status to Neon DB, kept local state.", err);
    }
  };

  const toggleSubmissionFilled = async (id: string) => {
    const current = submissions.find((s) => s.id === id);
    const next = !current?.isFilled;

    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            isFilled: next,
            filledStatus: next ? "FILLED" : "UNFILLED",
          };
        }
        return s;
      })
    );

    try {
      await toggleSubmissionFilledAction(id, next);
    } catch (err) {
      console.warn("Could not sync filled status to Neon DB, kept local state.", err);
    }
  };

  const recordSubmissionPayment = async (
    data: ReportPaymentDTO
  ): Promise<{ success: boolean; error?: string; message?: string; data?: any }> => {
    try {
      const res = await recordPaymentAction(data);
      if (res.success && res.data) {
        // Optimistically update matching submission in state
        setSubmissions((prev) =>
          prev.map((s) => {
            if (s.id === data.applicationId) {
              return {
                ...s,
                isPaid: true,
                paymentStatus: "PAID",
                paidAt: res.data?.paidAt || new Date().toISOString(),
                paymentMethod: data.paymentMethod,
                paymentReference: res.data?.paymentReference || data.paymentReference,
                paymentAmount: data.paymentAmount || paymentSettings.feePerForm,
                receiptUrl: res.data?.receiptUrl || data.receiptUrl,
                receiptFileName: res.data?.receiptFileName || data.receiptFileName,
              };
            }
            return s;
          })
        );
        return { success: true, message: res.message, data: res.data };
      }
      return { success: false, error: res.error || "Failed to record payment." };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to record payment." };
    }
  };

  const updateAgent = async (data: UpdateAgentDTO): Promise<boolean> => {
    // 1. Optimistically update local state
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id === data.id) {
          return {
            ...a,
            username: data.username || a.username,
            password: data.password || a.password,
            isActive: data.isActive !== undefined ? data.isActive : a.isActive,
            profile: {
              ...a.profile,
              stationaryName: data.stationaryName || a.profile.stationaryName,
              phoneNumber: data.phoneNumber || a.profile.phoneNumber,
              city: data.city !== undefined ? data.city : a.profile.city,
              subCityDistrict: data.subCityDistrict !== undefined ? data.subCityDistrict : a.profile.subCityDistrict,
              notes: data.notes !== undefined ? data.notes : a.profile.notes,
            },
          };
        }
        return a;
      })
    );

    // 2. Persist to Neon DB
    try {
      const res = await updateProxyAgentAction(data);
      if (res.success) {
        await refreshAgents();
        return true;
      }
      return false;
    } catch {
      return true; // Keep local optimistic state
    }
  };

  const toggleAgentStatus = async (agentId: string): Promise<boolean> => {
    const current = agents.find((a) => a.id === agentId);
    const next = !current?.isActive;

    setAgents((prev) =>
      prev.map((a) => (a.id === agentId ? { ...a, isActive: next } : a))
    );

    try {
      const res = await toggleAgentStatusAction(agentId, next);
      return res.success;
    } catch {
      return true;
    }
  };

  const deleteAgent = async (agentId: string): Promise<boolean> => {
    setAgents((prev) => prev.filter((a) => a.id !== agentId));
    try {
      const res = await deleteProxyAgentAction(agentId);
      return res.success;
    } catch {
      return true;
    }
  };

  const deleteSubmission = (submissionId: string) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
  };

  const getSubmissionById = (id: string) => {
    return submissions.find((s) => s.id === id);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <AdminContext.Provider
      value={{
        agents,
        addAgent,
        updateAgent,
        toggleAgentStatus,
        deleteAgent,
        refreshAgents,

        submissions,
        deleteSubmission,
        getSubmissionById,
        toggleSubmissionPaid,
        toggleSubmissionFilled,
        recordSubmissionPayment,

        paymentSettings,
        updatePaymentSettings,
        getStationarySubmissions,
        getStationaryStats,

        isSidebarCollapsed,
        toggleSidebar,
        setSidebarCollapsed,

        notifications,
        unreadCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotification,

        activeSidebarItem,
        setActiveSidebarItem,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
