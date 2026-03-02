import { NextResponse, type NextRequest } from "next/server";
import { getAllTools } from "~/lib/tools.server";
import {
  validateApiKey,
  getApiKeyFromRequest,
  createApiErrorResponse,
  API_SECURITY_HEADERS,
} from "~/lib/api-auth";
import type { ToolCategory } from "~/types/tool";

// Cache for categories data
let cachedCategories: { name: ToolCategory; count: number }[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

const CATEGORY_LABELS: Record<ToolCategory, string> = {
  reporting: "Reporting",
  automation: "Automation",
  packaging: "Packaging",
  troubleshooting: "Troubleshooting",
  security: "Security",
  configuration: "Configuration",
  monitoring: "Monitoring",
  migration: "Migration",
  other: "Other",
};

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
    if (cachedCategories && now - cacheTimestamp < CACHE_DURATION_MS) {
      return NextResponse.json(
        { data: cachedCategories },
        {
          headers: {
            ...API_SECURITY_HEADERS,
            "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
            "X-RateLimit-Remaining": String(authResult.remainingRequests ?? 0),
          },
        }
      );
    }

    // Get all tools and count by category
    const tools = getAllTools();
    const categoryCounts = new Map<ToolCategory, number>();

    for (const tool of tools) {
      const current = categoryCounts.get(tool.category) ?? 0;
      categoryCounts.set(tool.category, current + 1);
    }

    // Format response with labels
    const categories = Array.from(categoryCounts.entries())
      .map(([name, count]) => ({
        name,
        label: CATEGORY_LABELS[name],
        count,
      }))
      .sort((a, b) => b.count - a.count);

    // Update cache
    cachedCategories = categories;
    cacheTimestamp = now;

    return NextResponse.json(
      { data: categories },
      {
        headers: {
          ...API_SECURITY_HEADERS,
          "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
          "X-RateLimit-Remaining": String(authResult.remainingRequests ?? 0),
        },
      }
    );
  } catch {
    console.error("API error in categories");
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
