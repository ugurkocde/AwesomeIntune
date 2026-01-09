import { NextResponse, type NextRequest } from "next/server";
import { getToolById } from "~/lib/tools.server";
import { supabase } from "~/lib/supabase";
import {
  validateApiKey,
  getApiKeyFromRequest,
  createApiErrorResponse,
  API_SECURITY_HEADERS,
} from "~/lib/api-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Validate API key
  const apiKey = getApiKeyFromRequest(request);
  const authResult = await validateApiKey(apiKey);

  if (!authResult.valid) {
    return createApiErrorResponse(authResult);
  }

  try {
    const { id } = await params;
    const tool = getToolById(id);

    if (!tool) {
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Tool not found",
          },
        },
        { status: 404, headers: API_SECURITY_HEADERS }
      );
    }

    // Get vote and view counts
    const [voteResult, viewResult] = await Promise.all([
      supabase
        .from("tool_vote_counts")
        .select("vote_count")
        .eq("tool_id", id)
        .single(),
      supabase
        .from("tool_view_counts")
        .select("view_count")
        .eq("tool_id", id)
        .single(),
    ]);

    const voteData = voteResult.data as { vote_count: number } | null;
    const viewData = viewResult.data as { view_count: number } | null;
    const votes = voteData?.vote_count ?? 0;
    const views = viewData?.view_count ?? 0;

    // Compute security status
    const getSecurityStatus = () => {
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

    // Format response
    const formattedTool = {
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
      screenshots: tool.screenshots,
      votes,
      views,
      securityStatus: getSecurityStatus(),
      securityCheck: tool.securityCheck ? {
        passed: tool.securityCheck.passed,
        total: tool.securityCheck.total,
        filesScanned: tool.securityCheck.filesScanned,
        lastChecked: tool.securityCheck.lastChecked,
        forceApproved: tool.securityCheck.forceApproved,
        aiSummary: tool.securityCheck.aiSummary,
        checks: tool.securityCheck.checks,
      } : null,
    };

    return NextResponse.json(
      { data: formattedTool },
      {
        headers: {
          ...API_SECURITY_HEADERS,
          "Cache-Control": "public, max-age=60, stale-while-revalidate=30",
          "X-RateLimit-Remaining": String(authResult.remainingRequests ?? 0),
        },
      }
    );
  } catch (_error) {
    console.error("API error in tools/[id]");
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
