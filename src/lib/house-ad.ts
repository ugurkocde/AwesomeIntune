// TenuVault is made by the maintainer of Awesome Intune. The directory shows
// it in two ways: as a normal directory entry, and as one labelled row in the
// tool list. Both link to tenuvault.com with UTM parameters, so that site can
// tell which placement and which message a visitor came from.

const TENUVAULT_ORIGIN = "https://www.tenuvault.com";
const TENUVAULT_DOMAIN = "tenuvault.com";
const UTM_SOURCE = "awesomeintune.com";

export type HouseMessageId = "restore" | "free";
export type HousePlacement = "home_grid" | "home_list";
export type ListingPlacement = "tool_card" | "tool_page" | "compare";

export interface HouseMessage {
  id: HouseMessageId;
  // Sent as utm_content and with the click event. The number goes up when
  // the wording changes, so results for old and new wording stay apart.
  tag: string;
  headline: string;
  body: string;
  action: string;
  path: string;
}

export const HOUSE_MESSAGES: Record<HouseMessageId, HouseMessage> = {
  restore: {
    id: "restore",
    tag: "restore_v1",
    headline: "Deleted an Intune policy? Intune has no recycle bin.",
    body: "TenuVault backs up your Intune configuration and restores a deleted policy from the backup. Free for one tenant.",
    action: "See how restore works",
    path: "/intune-restore",
  },
  free: {
    id: "free",
    tag: "free_v1",
    headline: "Back up your Intune configuration in minutes.",
    body: "TenuVault is a desktop app for Windows and macOS. Free for one tenant, with no card and no TenuVault account.",
    action: "Download free",
    path: "/download",
  },
};

export const HOUSE_MESSAGE_IDS = Object.keys(
  HOUSE_MESSAGES,
) as HouseMessageId[];

function tagged(
  url: URL,
  medium: string,
  campaign: string,
  content?: string,
): string {
  url.searchParams.set("utm_source", UTM_SOURCE);
  url.searchParams.set("utm_medium", medium);
  url.searchParams.set("utm_campaign", campaign);
  if (content) url.searchParams.set("utm_content", content);
  return url.toString();
}

export function houseAdUrl(
  message: HouseMessage,
  placement: HousePlacement,
): string {
  return tagged(
    new URL(message.path, TENUVAULT_ORIGIN),
    "house_ad",
    placement,
    message.tag,
  );
}

function isTenuVault(url: URL): boolean {
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  const host = url.hostname.replace(/\.$/, "");
  return host === TENUVAULT_DOMAIN || host.endsWith(`.${TENUVAULT_DOMAIN}`);
}

// A directory entry's own links. Links to other sites stay exactly as their
// authors submitted them and send no referrer. Links to tenuvault.com and its
// subdomains are tagged and keep the referrer, because both sites have the
// same owner.
export function listingLink(
  url: string,
  placement: ListingPlacement,
): { href: string; rel: string } {
  const untouched = { href: url, rel: "noopener noreferrer" };
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return untouched;
  }
  if (!isTenuVault(parsed)) return untouched;
  return { href: tagged(parsed, "listing", placement), rel: "noopener" };
}

// The messages take turns by calendar day (Berlin time), so each one is shown
// on every weekday over two weeks and their clicks can be compared. Nothing
// is stored in the visitor's browser for this.
export function houseMessageFor(now: Date): HouseMessage {
  return HOUSE_MESSAGES[HOUSE_MESSAGE_IDS[dayIndex(now)]!];
}

function dayIndex(now: Date): number {
  const count = HOUSE_MESSAGE_IDS.length;
  let dayNumber: number;
  try {
    // Read the parts by name: the layout of a formatted date string is locale
    // data, not something to rely on.
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Berlin",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);
    const part = (type: "year" | "month" | "day") =>
      Number(parts.find((p) => p.type === type)?.value);
    dayNumber = Date.UTC(part("year"), part("month") - 1, part("day"));
  } catch {
    // A browser without time zone data falls back to the UTC day.
    dayNumber = now.getTime();
  }
  const day = Math.floor(dayNumber / 86_400_000);
  return Number.isFinite(day) ? ((day % count) + count) % count : 0;
}
