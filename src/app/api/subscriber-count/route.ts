import { NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";

// Cache the count for 5 minutes to reduce database load
let cachedCount: number | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// Public aggregate. Do not CDN-cache a fallback 0 when the database is down.
const CACHE_CONTROL = "public, s-maxage=300, stale-while-revalidate=600";

function jsonCount(count: number, cache: boolean) {
  return NextResponse.json(
    { count },
    cache ? { headers: { "Cache-Control": CACHE_CONTROL } } : undefined
  );
}

export async function GET() {
  try {
    const now = Date.now();

    // Return cached value if still valid
    if (cachedCount !== null && now - cacheTimestamp < CACHE_DURATION_MS) {
      return jsonCount(cachedCount, true);
    }

    // Query total subscribers count (all email addresses)
    const { count, error } = await supabase
      .from("subscribers")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Failed to fetch subscriber count:", error);
      // Return cached value if available, otherwise 0
      if (cachedCount !== null) {
        return jsonCount(cachedCount, true);
      }
      return jsonCount(0, false);
    }

    // Update cache
    cachedCount = count ?? 0;
    cacheTimestamp = now;

    return jsonCount(cachedCount, true);
  } catch (error) {
    console.error("Subscriber count error:", error);
    if (cachedCount !== null) {
      return jsonCount(cachedCount, true);
    }
    return jsonCount(0, false);
  }
}
