import { NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";

interface ToolViewRow {
  tool_id: string;
}

// GET - Fetch view counts for all tools
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("tool_views")
      .select("tool_id");

    if (error) {
      console.error("Error fetching view counts:", error);
      return NextResponse.json(
        { error: "Failed to fetch view counts" },
        { status: 500 }
      );
    }

    // Aggregate counts by tool_id
    const counts: Record<string, number> = {};
    for (const row of (data as ToolViewRow[]) ?? []) {
      counts[row.tool_id] = (counts[row.tool_id] ?? 0) + 1;
    }

    return NextResponse.json(counts);
  } catch (error) {
    console.error("Error in GET /api/views:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Record a view for a tool
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

    const { error } = await supabase.from("tool_views").insert({
      tool_id: toolId,
    });

    if (error) {
      console.error("Error recording view:", error);
      return NextResponse.json(
        { error: "Failed to record view" },
        { status: 500 }
      );
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
