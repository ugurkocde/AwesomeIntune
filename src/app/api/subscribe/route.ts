import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "~/lib/supabase";
import { resend, EMAIL_FROM } from "~/lib/resend";
import { ConfirmSubscription } from "~/emails/ConfirmSubscription";
import { env } from "~/env";

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const result = subscribeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message ?? "Invalid email" },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("subscribers")
      .select("id, confirmed")
      .eq("email", email)
      .single();

    if (existing) {
      if (existing.confirmed) {
        return NextResponse.json(
          { error: "This email is already signed up" },
          { status: 400 }
        );
      }
      // Already exists but not confirmed - resend confirmation
      const { data: subscriber } = await supabase
        .from("subscribers")
        .select("confirmation_token")
        .eq("id", existing.id)
        .single();

      if (subscriber) {
        const confirmUrl = `${env.NEXT_PUBLIC_SITE_URL}/api/confirm?token=${subscriber.confirmation_token}`;
        await resend.emails.send({
          from: EMAIL_FROM,
          to: email,
          subject: "Confirm your email for Awesome Intune",
          react: ConfirmSubscription({ confirmUrl }),
        });
      }

      return NextResponse.json({
        success: true,
        message: "Confirmation email resent. Please check your inbox.",
      });
    }

    // Insert new subscriber
    const { data: newSubscriber, error: insertError } = await supabase
      .from("subscribers")
      .insert({ email })
      .select("confirmation_token")
      .single();

    if (insertError) {
      console.error("Failed to insert subscriber:", insertError);
      return NextResponse.json(
        { error: "Failed to sign up. Please try again." },
        { status: 500 }
      );
    }

    // Send confirmation email
    const confirmUrl = `${env.NEXT_PUBLIC_SITE_URL}/api/confirm?token=${newSubscriber.confirmation_token}`;

    const { error: emailError } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Confirm your email for Awesome Intune",
      react: ConfirmSubscription({ confirmUrl }),
    });

    if (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Still return success - subscriber is saved
    }

    return NextResponse.json({
      success: true,
      message: "Please check your email to confirm.",
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
