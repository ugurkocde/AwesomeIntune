import { NextResponse, type NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { supabase } from "~/lib/supabase";

// GitHub webhook event types
interface GitHubIssueEvent {
  action: string;
  issue: {
    number: number;
    title: string;
    state: string;
    labels: Array<{ name: string }>;
  };
  repository: {
    full_name: string;
  };
}

// Verify GitHub webhook signature
function verifySignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;

  const hmac = createHmac("sha256", secret);
  const digest = "sha256=" + hmac.update(payload).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");
    const event = request.headers.get("x-github-event");

    // Verify signature if secret is configured
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
    if (webhookSecret) {
      if (!verifySignature(rawBody, signature, webhookSecret)) {
        console.error("GitHub webhook signature verification failed");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    // Only handle issue events
    if (event !== "issues") {
      return NextResponse.json({ message: "Event ignored" }, { status: 200 });
    }

    const payload = JSON.parse(rawBody) as GitHubIssueEvent;
    const { action, issue } = payload;

    // Only process tool-idea labeled issues
    const isToolIdea = issue.labels.some((label) => label.name === "tool-idea");
    if (!isToolIdea) {
      return NextResponse.json(
        { message: "Not a tool idea issue" },
        { status: 200 }
      );
    }

    // Map GitHub actions to database status
    let newStatus: string | null = null;
    if (action === "closed") {
      newStatus = "closed";
    } else if (action === "reopened") {
      newStatus = "open";
    }

    if (!newStatus) {
      return NextResponse.json(
        { message: `Action '${action}' ignored` },
        { status: 200 }
      );
    }

    // Update the database
    const { error: updateError } = await supabase
      .from("tool_requests")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("github_issue_number", issue.number);

    if (updateError) {
      console.error("Error updating tool request status:", updateError);
      return NextResponse.json(
        { error: "Failed to update status" },
        { status: 500 }
      );
    }

    console.log(
      `Tool idea #${issue.number} status updated to '${newStatus}' via GitHub webhook`
    );

    return NextResponse.json({
      success: true,
      message: `Status updated to '${newStatus}'`,
      issueNumber: issue.number,
    });
  } catch (error) {
    console.error("GitHub webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Respond to GitHub's webhook ping
export async function GET() {
  return NextResponse.json({ message: "GitHub webhook endpoint active" });
}
