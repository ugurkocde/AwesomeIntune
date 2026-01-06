import { NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";

interface ToolViewSummaryRow {
  tool_id: string;
  total_views: number;
}

// Cache view counts to reduce database load under high traffic
let cachedCounts: Record<string, number> | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 15 * 1000; // 15 seconds cache

// Function to fetch view counts from the summary view (pre-aggregated by database)
async function fetchViewCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("tool_views_summary")
    .select("tool_id, total_views");

  if (error) {
    console.error("Error fetching view counts:", error);
    throw error;
  }

  // Build counts object from pre-aggregated summary
  const counts: Record<string, number> = {};
  for (const row of (data as ToolViewSummaryRow[]) ?? []) {
    counts[row.tool_id] = row.total_views;
  }

  return counts;
}

// GET - Fetch view counts for all tools (cached)
export async function GET() {
  try {
    const now = Date.now();

    // Return cached value if still valid
    if (cachedCounts !== null && now - cacheTimestamp < CACHE_DURATION_MS) {
      return NextResponse.json(cachedCounts, {
        headers: {
          "Cache-Control": "public, max-age=15, stale-while-revalidate=10",
        },
      });
    }

    // Fetch fresh data
    const counts = await fetchViewCounts();

    // Update cache
    cachedCounts = counts;
    cacheTimestamp = now;

    return NextResponse.json(counts, {
      headers: {
        "Cache-Control": "public, max-age=15, stale-while-revalidate=10",
      },
    });
  } catch (error) {
    console.error("Error in GET /api/views:", error);

    // Return cached data if available, even if stale
    if (cachedCounts !== null) {
      return NextResponse.json(cachedCounts, {
        headers: {
          "Cache-Control": "public, max-age=15",
        },
      });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Record a view for a tool
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { toolId?: string };
    const { toolId } = body;

    if (!toolId || typeof toolId !== "string") {
      return NextResponse.json(
        { error: "toolId is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("tool_views").insert({
      tool_id: toolId,
    });

    if (error) {
      console.error("Error recording view:", error);
      return NextResponse.json(
        { error: "Failed to record view" },
        { status: 500 }
      );
    }

    // Update cached count immediately for this tool (optimistic update)
    if (cachedCounts !== null) {
      cachedCounts[toolId] = (cachedCounts[toolId] ?? 0) + 1;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in POST /api/views:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
