import { NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";
import { getToolById, getAllTools } from "~/lib/tools.server";

interface ToolViewCountRow {
  tool_id: string;
  view_count: number;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tool = getToolById(id);

    if (!tool) {
      return NextResponse.json(
        { error: "Tool not found" },
        { status: 404 }
      );
    }

    // Get all tools in the same category
    const allTools = getAllTools();
    const categoryTools = allTools.filter((t) => t.category === tool.category);
    const categoryToolIds = categoryTools.map((t) => t.id);

    // Fetch view counts from Supabase
    const { data, error } = await supabase
      .from("tool_view_counts")
      .select("tool_id, view_count")
      .in("tool_id", categoryToolIds);

    if (error) {
      console.error("Error fetching view counts:", error);
      return NextResponse.json(
        { error: "Failed to fetch ranking data" },
        { status: 500 }
      );
    }

    // Build view counts map
    const viewCounts: Record<string, number> = {};
    for (const row of (data as ToolViewCountRow[]) ?? []) {
      viewCounts[row.tool_id] = row.view_count;
    }

    // Create ranked list (tools with more views rank higher)
    const ranked = categoryTools
      .map((t) => ({
        id: t.id,
        views: viewCounts[t.id] ?? 0,
      }))
      .sort((a, b) => b.views - a.views);

    // Find this tool's rank (1-indexed)
    const rank = ranked.findIndex((t) => t.id === id) + 1;

    return NextResponse.json(
      {
        rank,
        totalInCategory: categoryTools.length,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    console.error("Error in GET /api/tools/[id]/ranking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
