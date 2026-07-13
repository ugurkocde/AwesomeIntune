import { NextResponse } from "next/server";

interface RateLimitBucket {
  timestamps: number[];
  windowMs: number;
}

// In-memory sliding window rate limiter keyed by route name + client IP.
// Best effort per server instance; a warm serverless instance keeps state
// between requests, which is enough to blunt abusive loops.
const buckets = new Map<string, RateLimitBucket>();

const CLEANUP_INTERVAL_MS = 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleBuckets(now: number): void {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, bucket] of buckets) {
    const newest = bucket.timestamps[bucket.timestamps.length - 1];
    if (newest === undefined || now - newest > bucket.windowMs) {
      buckets.delete(key);
    }
  }
}

/**
 * Extract the client IP from the request, preferring the first value of
 * x-forwarded-for (set by Vercel's proxy).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

/**
 * Check and record a hit against a sliding window rate limit.
 * Never throws - on any internal error the request is allowed through.
 */
export function checkRateLimit(
  name: string,
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  try {
    const now = Date.now();
    cleanupStaleBuckets(now);

    const bucketKey = `${name}:${key}`;
    const existing = buckets.get(bucketKey);
    const timestamps = (existing?.timestamps ?? []).filter(
      (t) => now - t < windowMs
    );

    if (timestamps.length >= limit) {
      buckets.set(bucketKey, { timestamps, windowMs });
      const oldest = timestamps[0] ?? now;
      const retryAfterSeconds = Math.max(
        Math.ceil((oldest + windowMs - now) / 1000),
        1
      );
      return { allowed: false, retryAfterSeconds };
    }

    timestamps.push(now);
    buckets.set(bucketKey, { timestamps, windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  } catch {
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

/**
 * Convenience wrapper: returns a 429 response when the per-IP limit for the
 * named route is exceeded, or null when the request may proceed.
 */
export function enforceRateLimit(
  request: Request,
  name: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  const result = checkRateLimit(name, getClientIp(request), limit, windowMs);

  if (result.allowed) {
    return null;
  }

  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfterSeconds),
      },
    }
  );
}
