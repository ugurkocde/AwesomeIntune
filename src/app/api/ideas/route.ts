import { NextResponse, type NextRequest } from "next/server";
import { toolRequestSchema } from "~/lib/schemas/tool-request";
import { verifyTurnstileToken } from "~/lib/turnstile";
import { createToolRequestIssue, getIssueStatuses } from "~/lib/github";
import { supabase } from "~/lib/supabase";
import type { ToolRequestWithVotes, RequestStatus } from "~/types/request";

interface ToolRequestRow {
  id: string;
  title: string;
  description: string;
  use_case: string | null;
  category: string | null;
  github_issue_number: number;
  github_issue_url: string;
  status: RequestStatus;
  fulfilled_tool_id: string | null;
  created_at: string;
  updated_at: string;
}

interface VoteCountRow {
  request_id: string;
  vote_count: number;
}

// Cache for GET requests
let cachedRequests: ToolRequestWithVotes[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 30 * 1000; // 30 seconds cache

// Public idea list. POST stays uncached. Status sync still runs on CDN revalidation.
const GET_CACHE_CONTROL = "public, s-maxage=300, stale-while-revalidate=600";
// Degraded or read-your-writes responses must not be stored on the shared cache.
const PRIVATE_NO_STORE = "private, no-store";

function isDefaultList(
  status: string | null,
  category: string | null,
  sort: string
): boolean {
  return !status && !category && sort === "votes";
}

// GET - Fetch all tool requests with vote counts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const sort = searchParams.get("sort") ?? "votes"; // 'votes' or 'newest'
  // Post-submit refresh adds `fresh` so it misses the shared CDN entry.
  const bypassCache = searchParams.has("fresh");
  const defaultList = isDefaultList(status, category, sort);

  try {
    const now = Date.now();

    // Return cached value if still valid and no specific filters
    if (
      !bypassCache &&
      cachedRequests !== null &&
      now - cacheTimestamp < CACHE_DURATION_MS &&
      defaultList
    ) {
      return NextResponse.json(
        { requests: cachedRequests, total: cachedRequests.length },
        {
          headers: {
            "Cache-Control": GET_CACHE_CONTROL,
          },
        }
      );
    }

    // Build query
    let query = supabase.from("tool_requests").select(
      "id, title, description, use_case, category, github_issue_number, github_issue_url, status, fulfilled_tool_id, created_at, updated_at"
    );

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }
    if (category) {
      query = query.eq("category", category);
    }

    // Apply sorting
    if (sort === "newest") {
      query = query.order("created_at", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data: requests, error: requestsError } = await query;

    if (requestsError) {
      console.error("Error fetching tool requests:", requestsError);
      throw requestsError;
    }

    // Sync GitHub issue statuses for open/closed items
    const requestsList = (requests as ToolRequestRow[]) ?? [];
    const itemsToSync = requestsList.filter(
      (r) => r.status === "open" || r.status === "closed"
    );

    if (itemsToSync.length > 0) {
      const issueNumbers = itemsToSync.map((r) => r.github_issue_number);
      const githubStatuses = await getIssueStatuses(issueNumbers);

      // Find items that need updating
      const updates: { id: string; newStatus: "open" | "closed" }[] = [];
      for (const item of itemsToSync) {
        const githubState = githubStatuses.get(item.github_issue_number);
        if (githubState && githubState !== item.status) {
          updates.push({ id: item.id, newStatus: githubState });
        }
      }

      // Batch update out-of-sync items
      if (updates.length > 0) {
        for (const update of updates) {
          await supabase
            .from("tool_requests")
            .update({ status: update.newStatus, updated_at: new Date().toISOString() })
            .eq("id", update.id);

          // Update local data
          const item = requestsList.find((r) => r.id === update.id);
          if (item) {
            item.status = update.newStatus;
          }
        }
        // Invalidate cache since we updated data
        cachedRequests = null;
      }
    }

    // Fetch vote counts
    const { data: voteCounts, error: voteError } = await supabase
      .from("tool_request_vote_counts")
      .select("request_id, vote_count");

    if (voteError) {
      console.error("Error fetching vote counts:", voteError);
      // A previous complete default list is safe to show, but must not refresh the CDN.
      if (!bypassCache && defaultList && cachedRequests !== null) {
        return NextResponse.json(
          { requests: cachedRequests, total: cachedRequests.length },
          { headers: { "Cache-Control": PRIVATE_NO_STORE } }
        );
      }
    }

    // Create vote count map
    const voteCountMap: Record<string, number> = {};
    if (!voteError) {
      for (const row of (voteCounts as VoteCountRow[]) ?? []) {
        voteCountMap[row.request_id] = row.vote_count;
      }
    }

    // Combine requests with vote counts
    const requestsWithVotes: ToolRequestWithVotes[] = (
      (requests as ToolRequestRow[]) ?? []
    ).map((req) => ({
      ...req,
      vote_count: voteCountMap[req.id] ?? 0,
    }));

    // Sort by votes if requested
    if (sort === "votes" && !voteError) {
      requestsWithVotes.sort((a, b) => b.vote_count - a.vote_count);
    }

    // Only a complete default list may seed the in-memory cache.
    if (!voteError && defaultList) {
      cachedRequests = requestsWithVotes;
      cacheTimestamp = now;
    }

    return NextResponse.json(
      { requests: requestsWithVotes, total: requestsWithVotes.length },
      {
        headers: {
          "Cache-Control":
            bypassCache || voteError ? PRIVATE_NO_STORE : GET_CACHE_CONTROL,
        },
      }
    );
  } catch (error) {
    console.error("Error in GET /api/ideas:", error);

    // The snapshot is the unfiltered votes list. Never store it under another URL.
    if (!bypassCache && defaultList && cachedRequests !== null) {
      return NextResponse.json(
        { requests: cachedRequests, total: cachedRequests.length },
        {
          headers: {
            "Cache-Control": PRIVATE_NO_STORE,
          },
        }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new tool request
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;

    // Validate the request data
    const result = toolRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { turnstileToken, ...requestData } = result.data;

    // Verify Turnstile CAPTCHA
    const isValidToken = await verifyTurnstileToken(turnstileToken);

    if (!isValidToken) {
      return NextResponse.json(
        { error: "CAPTCHA verification failed. Please try again." },
        { status: 400 }
      );
    }

    // Create GitHub issue
    const issue = await createToolRequestIssue(requestData);

    // Insert into Supabase
    const { data: insertedRequest, error: insertError } = await supabase
      .from("tool_requests")
      .insert({
        title: requestData.title,
        description: requestData.description,
        use_case: requestData.use_case ?? null,
        category: requestData.category ?? null,
        github_issue_number: issue.number,
        github_issue_url: issue.html_url,
        status: "open",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Error inserting tool request:", insertError);
      // GitHub issue was created but DB insert failed
      // Return success with the issue info anyway
      return NextResponse.json({
        success: true,
        message:
          "Tool idea submitted successfully! Your idea is being tracked on GitHub.",
        issueNumber: issue.number,
        issueUrl: issue.html_url,
        requestId: null,
      });
    }

    // Supabase is intentionally untyped in this project; the insert selects only `id`.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const requestId = (insertedRequest as { id: string }).id;

    // Initialize vote count for the new request
    await supabase.from("tool_request_vote_counts").insert({
      request_id: requestId,
      vote_count: 0,
    });

    // Invalidate cache
    cachedRequests = null;

    return NextResponse.json({
      success: true,
      message:
        "Tool idea submitted successfully! Your idea is being tracked on GitHub.",
      issueNumber: issue.number,
      issueUrl: issue.html_url,
      requestId: requestId,
    });
  } catch (error) {
    console.error("Submit tool request error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
