import { NextResponse, type NextRequest } from "next/server";
import { toolSubmissionSchema } from "~/lib/schemas/tool-submission";
import { verifyTurnstileToken } from "~/lib/turnstile";
import { createToolSubmissionIssue } from "~/lib/github";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;

    // Validate the submission data
    const result = toolSubmissionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { turnstileToken, acceptTerms: _acceptTerms = true, ...submissionData } = result.data;
void _acceptTerms;

    // Verify Turnstile CAPTCHA
    const isValidToken = await verifyTurnstileToken(turnstileToken);

    if (!isValidToken) {
      return NextResponse.json(
        { error: "CAPTCHA verification failed. Please try again." },
        { status: 400 }
      );
    }

    // Create GitHub issue
    const issue = await createToolSubmissionIssue(submissionData);

    return NextResponse.json({
      success: true,
      message: "Tool submitted successfully! We will review it shortly.",
      issueNumber: issue.number,
      issueUrl: issue.html_url,
    });
  } catch (error) {
    console.error("Submit tool error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
