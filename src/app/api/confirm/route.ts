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

  // Find subscriber by confirmation token
  const { data: subscriber, error: findError } = await supabase
    .from("subscribers")
    .select("id, confirmed")
    .eq("confirmation_token", token)
    .single();

  if (findError || !subscriber) {
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_SITE_URL}?subscription=error&message=invalid-token`
    );
  }

  if (subscriber.confirmed) {
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_SITE_URL}?subscription=already-confirmed`
    );
  }

  // Mark as confirmed
  const { error: updateError } = await supabase
    .from("subscribers")
    .update({ confirmed: true })
    .eq("id", subscriber.id);

  if (updateError) {
    console.error("Failed to confirm subscriber:", updateError);
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_SITE_URL}?subscription=error&message=update-failed`
    );
  }

  return NextResponse.redirect(
    `${env.NEXT_PUBLIC_SITE_URL}?subscription=confirmed`
  );
}
