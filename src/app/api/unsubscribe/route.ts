import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";
import { env } from "~/env";

// GET - Redirect to the confirmation page so link prefetchers and email
// scanners cannot unsubscribe people by simply following the link
export function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";

  return NextResponse.redirect(
    `${env.NEXT_PUBLIC_SITE_URL}/unsubscribe?token=${encodeURIComponent(token)}`
  );
}

async function getTokenFromRequest(request: NextRequest): Promise<string | null> {
  // Token in the query string covers both the confirmation page and
  // RFC 8058 one-click unsubscribe (List-Unsubscribe-Post)
  const queryToken = request.nextUrl.searchParams.get("token");
  if (queryToken) return queryToken;

  // Fall back to a JSON body
  try {
    const body = (await request.json()) as { token?: string };
    if (body.token && typeof body.token === "string") {
      return body.token;
    }
  } catch {
    // No parseable body
  }

  return null;
}

// POST - Perform the unsubscribe (confirmation page button and RFC 8058
// one-click unsubscribe)
export async function POST(request: NextRequest) {
  const token = await getTokenFromRequest(request);

  if (!token) {
    return NextResponse.json(
      { error: "Missing unsubscribe token" },
      { status: 400 }
    );
  }

  // Find and delete subscriber by unsubscribe token
  const { data: subscriber, error: findError } = await supabase
    .from("subscribers")
    .select("id")
    .eq("unsubscribe_token", token)
    .single();

  if (findError || !subscriber) {
    return NextResponse.json(
      { error: "Invalid or expired unsubscribe token" },
      { status: 400 }
    );
  }

  const { error: deleteError } = await supabase
    .from("subscribers")
    .delete()
    .eq("id", subscriber.id);

  if (deleteError) {
    console.error("Failed to unsubscribe:", deleteError);
    return NextResponse.json(
      { error: "Failed to unsubscribe. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
