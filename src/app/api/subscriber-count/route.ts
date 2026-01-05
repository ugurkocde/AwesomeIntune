import { NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";

// Cache the count for 5 minutes to reduce database load
let cachedCount: number | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  try {
    const now = Date.now();

    // Return cached value if still valid
    if (cachedCount !== null && now - cacheTimestamp < CACHE_DURATION_MS) {
      return NextResponse.json({ count: cachedCount });
    }

    // Query confirmed subscribers count
    const { count, error } = await supabase
      .from("subscribers")
      .select("*", { count: "exact", head: true })
      .eq("confirmed", true);

    if (error) {
      console.error("Failed to fetch subscriber count:", error);
      // Return cached value if available, otherwise 0
      return NextResponse.json({ count: cachedCount ?? 0 });
    }

    // Update cache
    cachedCount = count ?? 0;
    cacheTimestamp = now;

    return NextResponse.json({ count: cachedCount });
  } catch (error) {
    console.error("Subscriber count error:", error);
    return NextResponse.json({ count: cachedCount ?? 0 });
  }
}
