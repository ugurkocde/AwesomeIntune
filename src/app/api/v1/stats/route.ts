import { NextResponse, type NextRequest } from "next/server";
import { getAllTools, getUniqueAuthorsCount } from "~/lib/tools.server";
import { supabase } from "~/lib/supabase";
import {
  validateApiKey,
  getApiKeyFromRequest,
  createApiErrorResponse,
  API_SECURITY_HEADERS,
} from "~/lib/api-auth";
import type { ToolCategory, ToolType } from "~/types/tool";

// Cache for stats
let cachedStats: object | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 60 * 1000; // 60 seconds

export async function GET(request: NextRequest) {
  // Validate API key
  const apiKey = getApiKeyFromRequest(request);
  const authResult = await validateApiKey(apiKey);

  if (!authResult.valid) {
    return createApiErrorResponse(authResult);
  }

  try {
    const now = Date.now();

    // Return cached data if valid
    if (cachedStats && now - cacheTimestamp < CACHE_DURATION_MS) {
      return NextResponse.json(
        { data: cachedStats },
        {
          headers: {
            ...API_SECURITY_HEADERS,
            "Cache-Control": "public, max-age=60, stale-while-revalidate=30",
            "X-RateLimit-Remaining": String(authResult.remainingRequests ?? 0),
          },
        }
      );
    }

    // Get all tools
    const tools = getAllTools();

    // Count by category
    const categoryBreakdown: Record<ToolCategory, number> = {
      reporting: 0,
      automation: 0,
      packaging: 0,
      troubleshooting: 0,
      security: 0,
      configuration: 0,
      monitoring: 0,
      migration: 0,
      other: 0,
    };

    // Count by type
    const typeBreakdown: Record<ToolType, number> = {
      "powershell-module": 0,
      "powershell-script": 0,
      "web-app": 0,
      "desktop-app": 0,
      "browser-extension": 0,
      "cli-tool": 0,
      "api-wrapper": 0,
      documentation: 0,
      other: 0,
    };

    for (const tool of tools) {
      categoryBreakdown[tool.category]++;
      typeBreakdown[tool.type]++;
    }

    // Get total views
    const { data: viewResults } = await supabase
      .from("tool_view_counts")
      .select("view_count");

    const viewData = viewResults as { view_count: number }[] | null;
    const totalViews =
      viewData?.reduce((sum, v) => sum + (v.view_count ?? 0), 0) ?? 0;

    // Get total votes
    const { data: voteResults } = await supabase
      .from("tool_vote_counts")
      .select("vote_count");

    const voteData = voteResults as { vote_count: number }[] | null;
    const totalVotes =
      voteData?.reduce((sum, v) => sum + (v.vote_count ?? 0), 0) ?? 0;

    // Build stats object
    const stats = {
      totalTools: tools.length,
      totalAuthors: getUniqueAuthorsCount(tools),
      totalViews,
      totalVotes,
      categoryBreakdown,
      typeBreakdown,
      lastUpdated: new Date().toISOString(),
    };

    // Update cache
    cachedStats = stats;
    cacheTimestamp = now;

    return NextResponse.json(
      { data: stats },
      {
        headers: {
          ...API_SECURITY_HEADERS,
          "Cache-Control": "public, max-age=60, stale-while-revalidate=30",
          "X-RateLimit-Remaining": String(authResult.remainingRequests ?? 0),
        },
      }
    );
  } catch (_error) {
    console.error("API error in stats");
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500, headers: API_SECURITY_HEADERS }
    );
  }
}
