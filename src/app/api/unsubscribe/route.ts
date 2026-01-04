import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";
import { env } from "~/env";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_SITE_URL}?subscription=error&message=invalid-token`
    );
  }

  // Find and delete subscriber by unsubscribe token
  const { data: subscriber, error: findError } = await supabase
    .from("subscribers")
    .select("id")
    .eq("unsubscribe_token", token)
    .single();

  if (findError || !subscriber) {
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_SITE_URL}?subscription=error&message=invalid-token`
    );
  }

  // Delete the subscriber
  const { error: deleteError } = await supabase
    .from("subscribers")
    .delete()
    .eq("id", subscriber.id);

  if (deleteError) {
    console.error("Failed to unsubscribe:", deleteError);
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_SITE_URL}?subscription=error&message=delete-failed`
    );
  }

  return NextResponse.redirect(
    `${env.NEXT_PUBLIC_SITE_URL}?subscription=unsubscribed`
  );
}
