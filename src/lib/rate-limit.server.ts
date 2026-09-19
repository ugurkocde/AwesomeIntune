import { NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";
import { enforceRateLimit, getClientIp } from "~/lib/rate-limit";

// null: not yet known, true: reachable, false: disabled for this instance.
// The first RPC failure stops further round trips and uses the in-memory
// limiter, so an unapplied migration or Supabase outage does not add latency.
let durableAvailable: boolean | null = null;

/**
 * Rate limit a public server route, preferring the durable Supabase-backed
 * limiter so the limit holds across serverless instances and cold starts.
 * Falls back to the per-instance in-memory limiter when the store is
 * unavailable. Never throws.
 */
export async function enforceDurableRateLimit(
  request: Request,
  name: string,
  limit: number,
  windowMs: number
): Promise<NextResponse | null> {
  if (durableAvailable !== false) {
    const key = `${name}:${getClientIp(request)}`;

    try {
      const response = await supabase.rpc("consume_rate_limit", {
        p_bucket: key,
        p_limit: limit,
        p_window_seconds: Math.ceil(windowMs / 1000),
      });

      if (response.error) throw response.error;

      durableAvailable = true;
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
      durableAvailable = false;
    }
  }

  return enforceRateLimit(request, name, limit, windowMs);
}
