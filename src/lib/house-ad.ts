// TenuVault is made by the maintainer of Awesome Intune. The directory shows
// it in two ways: as a normal directory entry, and as one labelled card in the
// tool grid. Both link to tenuvault.com with UTM parameters, so that site can
// tell which placement and which message a visitor came from.

const TENUVAULT_ORIGIN = "https://www.tenuvault.com";
const TENUVAULT_HOSTS = new Set(["tenuvault.com", "www.tenuvault.com"]);
const UTM_SOURCE = "awesomeintune.com";

export type HouseMessageId = "restore" | "free";
export type HousePlacement = "home_grid" | "home_list";
export type ListingPlacement = "tool_card" | "tool_page" | "compare";

export interface HouseMessage {
  id: HouseMessageId;
  headline: string;
  body: string;
  action: string;
  path: string;
}

export const HOUSE_MESSAGES: Record<HouseMessageId, HouseMessage> = {
  restore: {
    id: "restore",
    headline: "Deleted an Intune policy? Intune has no recycle bin.",
    body: "TenuVault backs up your Intune configuration and restores a deleted policy from the backup. Free for one tenant.",
    action: "See how restore works",
    path: "/intune-restore",
  },
  free: {
    id: "free",
    headline: "Back up your Intune tenant in minutes.",
    body: "TenuVault is a desktop app for Windows and macOS. Free for one tenant, with no card and no TenuVault account.",
    action: "Download free",
    path: "/download",
  },
};

export const HOUSE_MESSAGE_IDS = Object.keys(
  HOUSE_MESSAGES,
) as HouseMessageId[];
export const HOUSE_MESSAGE_KEY = "awesome-intune-house-message";

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
    message.id,
  );
}

// A directory entry's own links. Links to other sites stay exactly as their
// authors submitted them and send no referrer. Links to tenuvault.com are
// tagged and keep the referrer, because both sites have the same owner.
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
  if (!TENUVAULT_HOSTS.has(parsed.hostname)) return untouched;
  return { href: tagged(parsed, "listing", placement), rel: "noopener" };
}

type MessageStorage = Pick<Storage, "getItem" | "setItem">;

// Each visitor gets one of the messages at random and keeps it, so a click or
// a download can be credited to one message. Without usable storage the
// message is picked again on every page load.
export function pickHouseMessage(
  storage: MessageStorage | undefined,
  random: () => number = Math.random,
): HouseMessage {
  try {
    const saved = storage?.getItem(HOUSE_MESSAGE_KEY);
    if (saved && saved in HOUSE_MESSAGES) {
      return HOUSE_MESSAGES[saved as HouseMessageId];
    }
  } catch {
    // Fall through to a fresh pick.
  }
  const index = Math.min(
    HOUSE_MESSAGE_IDS.length - 1,
    Math.floor(random() * HOUSE_MESSAGE_IDS.length),
  );
  const picked = HOUSE_MESSAGES[HOUSE_MESSAGE_IDS[index]!];
  try {
    storage?.setItem(HOUSE_MESSAGE_KEY, picked.id);
  } catch {
    // The pick still holds for this page view.
  }
  return picked;
}
