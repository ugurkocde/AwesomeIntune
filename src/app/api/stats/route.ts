import { NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";
import { getAllTools } from "~/lib/tools.server";

interface ToolViewCountRow {
  tool_id: string;
  view_count: number;
}

// Cache stats to reduce database and filesystem load
let cachedStats: { toolCount: number; totalViews: number } | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 60 * 1000; // 60 seconds cache

async function fetchTotalViews(): Promise<number> {
  const { data, error } = await supabase
    .from("tool_view_counts")
    .select("view_count");

  if (error) {
    console.error("Error fetching view counts:", error);
    return 0;
  }

  // Sum all view counts
  return (data as ToolViewCountRow[])?.reduce(
    (sum, row) => sum + (row.view_count || 0),
    0
  ) ?? 0;
}

export async function GET() {
  try {
    const now = Date.now();

    // Return cached value if still valid
    if (cachedStats !== null && now - cacheTimestamp < CACHE_DURATION_MS) {
      return NextResponse.json(cachedStats, {
        headers: {
          "Cache-Control": "public, max-age=30, stale-while-revalidate=30",
        },
      });
    }

    // Fetch fresh data
    const [tools, totalViews] = await Promise.all([
      Promise.resolve(getAllTools()),
      fetchTotalViews(),
    ]);

    const stats = {
      toolCount: tools.length,
      totalViews,
    };

    // Update cache
    cachedStats = stats;
    cacheTimestamp = now;

    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "public, max-age=30, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("Error in GET /api/stats:", error);

    // Return cached data if available, even if stale
    if (cachedStats !== null) {
      return NextResponse.json(cachedStats, {
        headers: {
          "Cache-Control": "public, max-age=30",
        },
      });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
