import { NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";

interface ToolViewCountRow {
  tool_id: string;
  view_count: number;
}

// Cache view counts to reduce database load under high traffic
let cachedCounts: Record<string, number> | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 30 * 1000; // 30 seconds cache (can be longer now since reads are fast)

// Function to fetch view counts from the counter table (pre-aggregated)
async function fetchViewCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("tool_view_counts")
    .select("tool_id, view_count");

  if (error) {
    console.error("Error fetching view counts:", error);
    throw error;
  }

  // Build counts object from counter table
  const counts: Record<string, number> = {};
  for (const row of (data as ToolViewCountRow[]) ?? []) {
    counts[row.tool_id] = row.view_count;
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

// POST - Record a view for a tool using UPSERT on counter table
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

    // Use raw SQL for atomic increment via UPSERT
    const { error } = await supabase.rpc("increment_view_count", {
      p_tool_id: toolId,
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
