const CHANGELOG_API_URL =
  "https://changelog.ugurlabs.com/api/changelog/awesomeintune?limit=20";

export const CHANGELOG_ARCHIVE_URL =
  "https://changelog.ugurlabs.com/?product=awesomeintune";
export const CHANGELOG_LAST_SEEN_KEY =
  "ugurlabs:changelog:last-seen:awesomeintune";
export const CHANGELOG_SEEN_EVENT = "awesomeintune:changelog-seen";

const CACHE_TTL_MS = 5 * 60 * 1000;

export type ChangelogEntryType = "new" | "improved" | "fixed" | "maintenance";

export interface PublicChangelogEntry {
  id: string;
  title: string;
  summary: string;
  type: ChangelogEntryType;
  publishedOn: string;
}

export interface PublicChangelogFeed {
  product: {
    id: string;
    name: string;
    websiteUrl: string;
  };
  entries: PublicChangelogEntry[];
}

interface CachedFeed {
  expiresAt: number;
  value: PublicChangelogFeed;
}

let cachedFeed: CachedFeed | null = null;
let pendingFeedRequest: Promise<PublicChangelogFeed> | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isEntryType(value: unknown): value is ChangelogEntryType {
  return (
    value === "new" ||
    value === "improved" ||
    value === "fixed" ||
    value === "maintenance"
  );
}

function parseFeed(value: unknown): PublicChangelogFeed {
  if (
    !isRecord(value) ||
    !isRecord(value.product) ||
    !Array.isArray(value.entries)
  ) {
    throw new Error("The changelog service returned an unexpected response.");
  }

  const { product } = value;
  if (
    typeof product.id !== "string" ||
    typeof product.name !== "string" ||
    typeof product.websiteUrl !== "string"
  ) {
    throw new Error("The changelog service returned invalid product details.");
  }

  const entries = value.entries.map((entry) => {
    if (
      !isRecord(entry) ||
      typeof entry.id !== "string" ||
      typeof entry.title !== "string" ||
      typeof entry.summary !== "string" ||
      !isEntryType(entry.type) ||
      typeof entry.publishedOn !== "string"
    ) {
      throw new Error("The changelog service returned an invalid update.");
    }

    return {
      id: entry.id,
      title: entry.title,
      summary: entry.summary,
      type: entry.type,
      publishedOn: entry.publishedOn,
    };
  });

  return {
    product: {
      id: product.id,
      name: product.name,
      websiteUrl: product.websiteUrl,
    },
    entries,
  };
}

async function requestFeed(): Promise<PublicChangelogFeed> {
  const requestUrl = new URL(CHANGELOG_API_URL);
  requestUrl.searchParams.set(
    "cacheKey",
    String(Math.floor(Date.now() / CACHE_TTL_MS)),
  );

  const response = await fetch(requestUrl, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("The changelog service is temporarily unavailable.");
  }

  return parseFeed(await response.json());
}

export function getPublicChangelog(): Promise<PublicChangelogFeed> {
  if (cachedFeed && cachedFeed.expiresAt > Date.now()) {
    return Promise.resolve(cachedFeed.value);
  }

  if (pendingFeedRequest) return pendingFeedRequest;

  pendingFeedRequest = requestFeed()
    .then((feed) => {
      cachedFeed = {
        expiresAt: Date.now() + CACHE_TTL_MS,
        value: feed,
      };
      return feed;
    })
    .finally(() => {
      pendingFeedRequest = null;
    });

  return pendingFeedRequest;
}

export function getEntryUrl(entryId: string): string {
  return `${CHANGELOG_ARCHIVE_URL}#change-${encodeURIComponent(entryId.toLowerCase())}`;
}
