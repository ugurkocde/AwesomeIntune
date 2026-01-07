import { NextResponse, type NextRequest } from "next/server";
import { apiKeyRegistrationSchema } from "~/lib/schemas/api-key";
import { verifyTurnstileToken } from "~/lib/turnstile";
import {
  generateApiKey,
  hashApiKey,
  getApiKeyPrefix,
  API_SECURITY_HEADERS,
} from "~/lib/api-auth";
import { supabase } from "~/lib/supabase";
import { resend, EMAIL_FROM } from "~/lib/resend";
import { ApiKeyEmail } from "~/emails/ApiKeyEmail";

// Consistent response message to prevent email enumeration
const SUCCESS_MESSAGE =
  "If this email is valid, you will receive your API key shortly.";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;

    // Validate the request data
    const result = apiKeyRegistrationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: result.error.errors[0]?.message ?? "Invalid request",
          },
        },
        { status: 400, headers: API_SECURITY_HEADERS }
      );
    }

    const { name, email, turnstileToken } = result.data;

    // Sanitize name - allow only alphanumeric, spaces, and common punctuation
    const sanitizedName = name.replace(/[^\w\s\-'.]/g, "").trim();
    if (sanitizedName.length < 2) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Name contains invalid characters",
          },
        },
        { status: 400, headers: API_SECURITY_HEADERS }
      );
    }

    // Verify Turnstile CAPTCHA
    const isValidToken = await verifyTurnstileToken(turnstileToken);

    if (!isValidToken) {
      return NextResponse.json(
        {
          error: {
            code: "CAPTCHA_FAILED",
            message: "CAPTCHA verification failed. Please try again.",
          },
        },
        { status: 400, headers: API_SECURITY_HEADERS }
      );
    }

    // Check if email already has an active API key
    // We do NOT resend existing keys for security - user must regenerate
    const { data: existing } = await supabase
      .from("api_keys")
      .select("id")
      .eq("email", email)
      .eq("is_active", true)
      .single();

    if (existing) {
      // Return same success message to prevent email enumeration
      // But don't create a new key or send email
      return NextResponse.json(
        { success: true, message: SUCCESS_MESSAGE },
        { headers: API_SECURITY_HEADERS }
      );
    }

    // Generate new API key
    const apiKey = generateApiKey();

    // Hash the key for secure storage
    const keyHash = await hashApiKey(apiKey);
    const keyPrefix = getApiKeyPrefix(apiKey);

    // Insert hashed key into database (plaintext key is never stored)
    const { error: insertError } = await supabase.from("api_keys").insert({
      key_hash: keyHash,
      key_prefix: keyPrefix,
      name: sanitizedName,
      email,
    });

    if (insertError) {
      console.error("API key creation failed");
      return NextResponse.json(
        {
          error: {
            code: "CREATE_FAILED",
            message: "Failed to create API key. Please try again.",
          },
        },
        { status: 500, headers: API_SECURITY_HEADERS }
      );
    }

    // Send API key via email (only time the plaintext key is transmitted)
    const { error: emailError } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Your Awesome Intune API Key",
      react: ApiKeyEmail({ name: sanitizedName, apiKey }),
    });

    if (emailError) {
      console.error("API key email failed");
      // Key was created but email failed - still return success
      // User can request regeneration if needed
    }

    return NextResponse.json(
      { success: true, message: SUCCESS_MESSAGE },
      { headers: API_SECURITY_HEADERS }
    );
  } catch (error) {
    console.error("API key registration error:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred. Please try again.",
        },
      },
      { status: 500, headers: API_SECURITY_HEADERS }
    );
  }
}
