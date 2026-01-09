import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAllTools } from "~/lib/tools.server";
import { supabase } from "~/lib/supabase";
import {
  validateApiKey,
  getApiKeyFromRequest,
  createApiErrorResponse,
  API_SECURITY_HEADERS,
} from "~/lib/api-auth";
import type { ToolCategory, ToolType } from "~/types/tool";

// Cache for tools data
let cachedTools: ReturnType<typeof getAllTools> | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 60 * 1000; // 60 seconds

// Valid categories and types for validation
const VALID_CATEGORIES = [
  "reporting",
  "automation",
  "packaging",
  "troubleshooting",
  "security",
  "configuration",
  "monitoring",
  "migration",
  "other",
] as const;

const VALID_TYPES = [
  "powershell-module",
  "powershell-script",
  "web-app",
  "desktop-app",
  "browser-extension",
  "cli-tool",
  "api-wrapper",
  "documentation",
  "other",
] as const;

// Query parameter schema with enum validation
const querySchema = z.object({
  category: z.enum(VALID_CATEGORIES).optional(),
  type: z.enum(VALID_TYPES).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  sort: z.enum(["newest", "popular", "votes", "name"]).default("newest"),
});

export async function GET(request: NextRequest) {
  // Validate API key
  const apiKey = getApiKeyFromRequest(request);
  const authResult = await validateApiKey(apiKey);

  if (!authResult.valid) {
    return createApiErrorResponse(authResult);
  }

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params = {
      category: searchParams.get("category") ?? undefined,
      type: searchParams.get("type") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      offset: searchParams.get("offset") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
    };

    const queryResult = querySchema.safeParse(params);
    if (!queryResult.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_PARAMS",
            message: "Invalid query parameters",
          },
        },
        { status: 400, headers: API_SECURITY_HEADERS }
      );
    }

    const { category, type, limit, offset, sort } = queryResult.data;

    // Get tools (with caching)
    const now = Date.now();
    if (!cachedTools || now - cacheTimestamp > CACHE_DURATION_MS) {
      cachedTools = getAllTools();
      cacheTimestamp = now;
    }

    let tools = [...cachedTools];

    // Apply filters
    if (category) {
      tools = tools.filter((t) => t.category === (category as ToolCategory));
    }
    if (type) {
      tools = tools.filter((t) => t.type === (type as ToolType));
    }

    // Get vote and view counts for sorting
    let voteCounts: Record<string, number> = {};
    let viewCounts: Record<string, number> = {};

    if (sort === "votes" || sort === "popular") {
      const { data: votes } = await supabase
        .from("tool_vote_counts")
        .select("tool_id, vote_count");
      const voteData = votes as { tool_id: string; vote_count: number }[] | null;
      if (voteData) {
        voteCounts = Object.fromEntries(
          voteData.map((v) => [v.tool_id, v.vote_count])
        );
      }
    }

    if (sort === "popular") {
      const { data: views } = await supabase
        .from("tool_view_counts")
        .select("tool_id, view_count");
      const viewData = views as { tool_id: string; view_count: number }[] | null;
      if (viewData) {
        viewCounts = Object.fromEntries(
          viewData.map((v) => [v.tool_id, v.view_count])
        );
      }
    }

    // Apply sorting
    switch (sort) {
      case "newest":
        tools.sort(
          (a, b) =>
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        );
        break;
      case "votes":
        tools.sort(
          (a, b) => (voteCounts[b.id] ?? 0) - (voteCounts[a.id] ?? 0)
        );
        break;
      case "popular":
        // Combine views and votes for popularity
        tools.sort((a, b) => {
          const scoreA = (viewCounts[a.id] ?? 0) + (voteCounts[a.id] ?? 0) * 10;
          const scoreB = (viewCounts[b.id] ?? 0) + (voteCounts[b.id] ?? 0) * 10;
          return scoreB - scoreA;
        });
        break;
      case "name":
        tools.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    const total = tools.length;

    // Apply pagination
    tools = tools.slice(offset, offset + limit);

    // Helper to compute security status
    const getSecurityStatus = (tool: (typeof tools)[0]) => {
      // No source code available (e.g., web apps without repo)
      if (!tool.repoUrl) {
        return "curated";
      }
      // No security check data
      if (!tool.securityCheck) {
        return "pending";
      }
      // No files were scanned
      if (tool.securityCheck.filesScanned === 0) {
        return "not_scanned";
      }
      // All checks passed
      if (tool.securityCheck.passed === tool.securityCheck.total) {
        return "verified";
      }
      // Some checks failed
      return "warning";
    };

    // Format response (exclude internal fields, add stats)
    const formattedTools = tools.map((tool) => ({
      id: tool.id,
      name: tool.name,
      description: tool.description,
      category: tool.category,
      type: tool.type,
      author: tool.author,
      authors: tool.authors,
      dateAdded: tool.dateAdded,
      repoUrl: tool.repoUrl,
      downloadUrl: tool.downloadUrl,
      websiteUrl: tool.websiteUrl,
      keywords: tool.keywords,
      votes: voteCounts[tool.id] ?? 0,
      views: viewCounts[tool.id] ?? 0,
      securityStatus: getSecurityStatus(tool),
      securityCheck: tool.securityCheck ? {
        passed: tool.securityCheck.passed,
        total: tool.securityCheck.total,
        filesScanned: tool.securityCheck.filesScanned,
        lastChecked: tool.securityCheck.lastChecked,
      } : null,
    }));

    return NextResponse.json(
      {
        data: formattedTools,
        meta: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
      {
        headers: {
          ...API_SECURITY_HEADERS,
          "Cache-Control": "public, max-age=30, stale-while-revalidate=30",
          "X-RateLimit-Remaining": String(authResult.remainingRequests ?? 0),
        },
      }
    );
  } catch (_error) {
    console.error("API error in tools list");
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
