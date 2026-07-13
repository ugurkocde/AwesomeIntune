import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import { env } from "~/env";

// Server-side voter identity bound to a signed httpOnly cookie so vote
// deduplication cannot be bypassed by rotating the client localStorage UUID.

const COOKIE_NAME = "ai_voter";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getSecret(): string {
  return env.VOTER_SECRET ?? env.SUPABASE_SERVICE_ROLE_KEY;
}

function sign(id: string): string {
  return createHmac("sha256", getSecret()).update(id).digest("hex");
}

function isValidSignature(id: string, signature: string): boolean {
  const expected = Buffer.from(sign(id), "utf-8");
  const provided = Buffer.from(signature, "utf-8");
  if (expected.length !== provided.length) return false;
  return timingSafeEqual(expected, provided);
}

export interface VoterIdentity {
  id: string;
  isNew: boolean;
}

/**
 * Read the signed voter cookie from the request. Returns the verified voter
 * id, or a fresh id (isNew: true) when the cookie is missing or invalid.
 */
export function getVoterIdentity(request: Request): VoterIdentity {
  try {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const match = new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`).exec(
      cookieHeader
    );
    const rawValue = match?.[1];

    if (rawValue) {
      const [id, signature] = decodeURIComponent(rawValue).split(".");
      if (id && signature && UUID_REGEX.test(id) && isValidSignature(id, signature)) {
        return { id, isNew: false };
      }
    }
  } catch {
    // Fall through to issuing a fresh identity
  }

  return { id: randomUUID(), isNew: true };
}

/**
 * Build the Set-Cookie header value for a voter identity.
 */
export function voterCookieHeader(id: string): string {
  const value = `${id}.${sign(id)}`;
  const secure = env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${value}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; HttpOnly; SameSite=Lax${secure}`;
}
