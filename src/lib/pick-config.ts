import { COMMUNITY_URL } from "~/lib/constants";

export const PICK_PROGRAM = {
  winnersPerMonth: 3,
  firstEligibleMonth: "2026-08",
  firstEligibleDate: "2026-08-01",
  launchDate: "2026-08-16",
  timeZone: "Europe/Berlin",
  currentCycle: {
    label: "August 2026",
    closesAt: "2026-08-31T23:59:59+02:00",
    announcementDisplay: "the first week of September 2026",
  },
  linkedInGroupUrl: COMMUNITY_URL,
  organizer: {
    name: "Ugurlabs UG (haftungsbeschränkt)",
    address: "Fährstraße 217, 40221 Düsseldorf, Germany",
  },
  recognitionPostAuthor: "Ugur Koc",
  contact: {
    email: "support@ugurlabs.com",
  },
  selection: {
    acceptanceWindowBusinessDays: 3,
  },
  prize: {
    subscriptionName: "Claude Pro",
    durationMonths: 1,
    maxReimbursementEurPerWinner: 25,
    claimWindowDays: 30,
    delivery: "reimbursement",
  },
} as const;
