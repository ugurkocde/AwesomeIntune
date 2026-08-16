import { COMMUNITY_URL } from "~/lib/constants";

export const PICK_PROGRAM = {
  firstEligibleMonth: "2026-08",
  firstEligibleDate: "2026-08-01",
  launchDate: "2026-08-16",
  timeZone: "Europe/Berlin",
  linkedInGroupUrl: COMMUNITY_URL,
  organizer: {
    name: "Ugurlabs UG (haftungsbeschränkt)",
    address: "Fährstraße 217, 40221 Düsseldorf, Germany",
  },
  jury: {
    lead: "Ugur Koc",
  },
  contact: {
    email: "support@ugurlabs.com",
  },
  prize: {
    subscriptionName: "Claude Pro",
    durationMonths: 3,
    approximateValueEur: 60,
    delivery: "reimbursement",
  },
} as const;
