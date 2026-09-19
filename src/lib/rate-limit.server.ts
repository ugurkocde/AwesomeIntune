import { NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";
import { enforceRateLimit, getClientIp } from "~/lib/rate-limit";

// After a failed RPC, stop trying until this timestamp to avoid adding latency
// to every request. The durable limiter is retried once the cooldown passes,
// so a temporary Supabase outage does not permanently downgrade the instance.
const DURABLE_RETRY_COOLDOWN_MS = 5 * 60 * 1000;
let durableRetryAt = 0;

/**
 * Rate limit a public server route, preferring the durable Supabase-backed
 * limiter so the limit holds across serverless instances and cold starts.
 * Falls back to the per-instance in-memory limiter while the store is
 * unavailable. Never throws.
 */
export async function enforceDurableRateLimit(
  request: Request,
  name: string,
  limit: number,
  windowMs: number
): Promise<NextResponse | null> {
  if (Date.now() >= durableRetryAt) {
    const key = `${name}:${getClientIp(request)}`;

    try {
      const response = await supabase.rpc("consume_rate_limit", {
        p_bucket: key,
        p_limit: limit,
        p_window_seconds: Math.ceil(windowMs / 1000),
      });

      if (response.error) throw response.error;

      const allowed = response.data as boolean | null;
      if (allowed === true) return null;

      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(windowMs / 1000)) },
        }
      );
    } catch {
      durableRetryAt = Date.now() + DURABLE_RETRY_COOLDOWN_MS;
    }
  }

  return enforceRateLimit(request, name, limit, windowMs);
}
