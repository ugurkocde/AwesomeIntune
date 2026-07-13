import { NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";
import { enforceRateLimit } from "~/lib/rate-limit";
import { getVoterIdentity, voterCookieHeader } from "~/lib/voter-identity";

interface RequestVoteCountRow {
  request_id: string;
  vote_count: number;
}

// Cache vote counts to reduce database load
let cachedCounts: Record<string, number> | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 10 * 1000; // 10 seconds cache

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
          "Cache-Control": "no-store",
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
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error in GET /api/ideas/votes:", error);

    // Return cached data if available, even if stale
    if (cachedCounts !== null) {
      return NextResponse.json(cachedCounts, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Record or remove a vote for a request (action: "remove" toggles off)
export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, "ideas-votes", 30, 60 * 1000);
    if (limited) return limited;

    const body = (await request.json()) as {
      requestId?: string;
      voterId?: string;
      action?: string;
    };
    const { requestId, voterId, action } = body;

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

    // Bind the vote to a signed httpOnly cookie identity so repeat votes
    // from the same browser dedupe server-side, regardless of the
    // client-supplied voterId
    const voter = getVoterIdentity(request);

    if (action === "remove") {
      // A fresh identity cannot have an existing vote to remove
      if (voter.isNew) {
        return NextResponse.json(
          { success: true, result: "not_voted" },
          { headers: { "Set-Cookie": voterCookieHeader(voter.id) } }
        );
      }

      const removeResponse = await supabase.rpc("remove_request_vote", {
        p_request_id: requestId,
        p_voter_id: voter.id,
      });

      if (removeResponse.error) {
        console.error("Error removing request vote:", removeResponse.error);
        return NextResponse.json(
          { error: "Failed to remove vote" },
          { status: 500 }
        );
      }

      const removeResult = removeResponse.data as string;

      // Update cached count immediately for this request (optimistic update)
      if (removeResult === "removed" && cachedCounts !== null) {
        cachedCounts[requestId] = Math.max((cachedCounts[requestId] ?? 1) - 1, 0);
      }

      return NextResponse.json({ success: true, result: removeResult });
    }

    // Use the record_request_vote function for atomic operation
    const response = await supabase.rpc("record_request_vote", {
      p_request_id: requestId,
      p_voter_id: voter.id,
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

    const headers = voter.isNew
      ? { "Set-Cookie": voterCookieHeader(voter.id) }
      : undefined;

    return NextResponse.json(
      {
        success: true,
        result: isNewVote ? "voted" : "already_voted",
      },
      { headers }
    );
  } catch (error) {
    console.error("Error in POST /api/ideas/votes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
