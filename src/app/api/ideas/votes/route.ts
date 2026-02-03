import { NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";

interface RequestVoteCountRow {
  request_id: string;
  vote_count: number;
}

// Cache vote counts to reduce database load
let cachedCounts: Record<string, number> | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 30 * 1000; // 30 seconds cache

// Function to fetch vote counts from the counter table
async function fetchVoteCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("tool_request_vote_counts")
    .select("request_id, vote_count");

  if (error) {
    console.error("Error fetching request vote counts:", error);
    throw error;
  }

  const counts: Record<string, number> = {};
  for (const row of (data as RequestVoteCountRow[]) ?? []) {
    counts[row.request_id] = row.vote_count;
  }

  return counts;
}

// GET - Fetch vote counts for all requests (cached)
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
    const counts = await fetchVoteCounts();

    // Update cache
    cachedCounts = counts;
    cacheTimestamp = now;

    return NextResponse.json(counts, {
      headers: {
        "Cache-Control": "public, max-age=15, stale-while-revalidate=10",
      },
    });
  } catch (error) {
    console.error("Error in GET /api/ideas/votes:", error);

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

// POST - Record a vote for a request
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      requestId?: string;
      voterId?: string;
    };
    const { requestId, voterId } = body;

    if (!requestId || typeof requestId !== "string") {
      return NextResponse.json(
        { error: "requestId is required" },
        { status: 400 }
      );
    }

    if (!voterId || typeof voterId !== "string") {
      return NextResponse.json(
        { error: "voterId is required" },
        { status: 400 }
      );
    }

    // Validate voterId format (should be a UUID)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(voterId)) {
      return NextResponse.json(
        { error: "Invalid voterId format" },
        { status: 400 }
      );
    }

    // Validate requestId format (should be a UUID)
    if (!uuidRegex.test(requestId)) {
      return NextResponse.json(
        { error: "Invalid requestId format" },
        { status: 400 }
      );
    }

    // Use the record_request_vote function for atomic operation
    const response = await supabase.rpc("record_request_vote", {
      p_request_id: requestId,
      p_voter_id: voterId,
    });

    if (response.error) {
      console.error("Error recording request vote:", response.error);
      return NextResponse.json(
        { error: "Failed to record vote" },
        { status: 500 }
      );
    }

    const result = response.data as string;
    const isNewVote = result === "voted";

    // Update cached count immediately for this request (optimistic update)
    if (isNewVote && cachedCounts !== null) {
      cachedCounts[requestId] = (cachedCounts[requestId] ?? 0) + 1;
    }

    return NextResponse.json({
      success: true,
      result: isNewVote ? "voted" : "already_voted",
    });
  } catch (error) {
    console.error("Error in POST /api/ideas/votes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
