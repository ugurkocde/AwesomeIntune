import { NextResponse, type NextRequest } from "next/server";
import { toolRequestSchema } from "~/lib/schemas/tool-request";
import { verifyTurnstileToken } from "~/lib/turnstile";
import { createToolRequestIssue } from "~/lib/github";
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
  submitter_email: string | null;
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

// GET - Fetch all tool requests with vote counts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const sort = searchParams.get("sort") ?? "votes"; // 'votes' or 'newest'

    const now = Date.now();

    // Return cached value if still valid and no specific filters
    if (
      cachedRequests !== null &&
      now - cacheTimestamp < CACHE_DURATION_MS &&
      !status &&
      !category &&
      sort === "votes"
    ) {
      return NextResponse.json(
        { requests: cachedRequests, total: cachedRequests.length },
        {
          headers: {
            "Cache-Control": "public, max-age=15, stale-while-revalidate=10",
          },
        }
      );
    }

    // Build query
    let query = supabase.from("tool_requests").select("*");

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

    // Fetch vote counts
    const { data: voteCounts, error: voteError } = await supabase
      .from("tool_request_vote_counts")
      .select("request_id, vote_count");

    if (voteError) {
      console.error("Error fetching vote counts:", voteError);
    }

    // Create vote count map
    const voteCountMap: Record<string, number> = {};
    for (const row of (voteCounts as VoteCountRow[]) ?? []) {
      voteCountMap[row.request_id] = row.vote_count;
    }

    // Combine requests with vote counts
    const requestsWithVotes: ToolRequestWithVotes[] = (
      (requests as ToolRequestRow[]) ?? []
    ).map((req) => ({
      ...req,
      vote_count: voteCountMap[req.id] ?? 0,
    }));

    // Sort by votes if requested
    if (sort === "votes") {
      requestsWithVotes.sort((a, b) => b.vote_count - a.vote_count);
    }

    // Update cache if no filters
    if (!status && !category && sort === "votes") {
      cachedRequests = requestsWithVotes;
      cacheTimestamp = now;
    }

    return NextResponse.json(
      { requests: requestsWithVotes, total: requestsWithVotes.length },
      {
        headers: {
          "Cache-Control": "public, max-age=15, stale-while-revalidate=10",
        },
      }
    );
  } catch (error) {
    console.error("Error in GET /api/requests:", error);

    // Return cached data if available, even if stale
    if (cachedRequests !== null) {
      return NextResponse.json(
        { requests: cachedRequests, total: cachedRequests.length },
        {
          headers: {
            "Cache-Control": "public, max-age=15",
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
          "Tool request submitted successfully! Your request is being tracked on GitHub.",
        issueNumber: issue.number,
        issueUrl: issue.html_url,
        requestId: null,
      });
    }

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
        "Tool request submitted successfully! Your request is being tracked on GitHub.",
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
