import { NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";
import { freshCommunityCount } from "~/lib/community-count";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("community_metrics")
      .select("member_count, observed_at")
      .eq("id", true)
      .maybeSingle();
    return NextResponse.json(error ? null : freshCommunityCount(data), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(null, {
      headers: { "Cache-Control": "no-store" },
    });
  }
}
