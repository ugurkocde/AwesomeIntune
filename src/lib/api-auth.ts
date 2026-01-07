import { NextResponse } from "next/server";
import { supabase } from "~/lib/supabase";

export interface ApiKeyValidationResult {
  valid: boolean;
  errorCode?: "INVALID_KEY" | "KEY_DISABLED" | "RATE_LIMIT_EXCEEDED";
  errorMessage?: string;
  remainingRequests?: number;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

interface UseApiKeyResult {
  is_valid: boolean;
  error_code: string | null;
  remaining_requests: number;
}

// Strict UUID v4 format validation for API keys
const API_KEY_REGEX =
  /^ai_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Hash an API key using SHA-256 for secure storage and lookup.
 */
export async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Validates an API key and increments usage counters atomically.
 * Uses the use_api_key_hash RPC function for atomic operations.
 */
export async function validateApiKey(
  key: string | null
): Promise<ApiKeyValidationResult> {
  if (!key) {
    return {
      valid: false,
      errorCode: "INVALID_KEY",
      errorMessage: "Missing API key. Include X-API-Key header.",
    };
  }

  // Validate key format (must match ai_ + UUID pattern)
  if (!API_KEY_REGEX.test(key)) {
    return {
      valid: false,
      errorCode: "INVALID_KEY",
      errorMessage: "Invalid API key format.",
    };
  }

  // Hash the key for lookup
  const keyHash = await hashApiKey(key);

  const response = await supabase.rpc("use_api_key_hash", {
    p_key_hash: keyHash,
  });

  if (response.error) {
    console.error("API key validation error");
    return {
      valid: false,
      errorCode: "INVALID_KEY",
      errorMessage: "Failed to validate API key.",
    };
  }

  const results = response.data as UseApiKeyResult[] | null;
  const result = results?.[0];

  if (!result?.is_valid) {
    const errorCode = result?.error_code as ApiKeyValidationResult["errorCode"];
    const messages: Record<string, string> = {
      INVALID_KEY: "Invalid API key.",
      KEY_DISABLED: "This API key has been disabled.",
      RATE_LIMIT_EXCEEDED:
        "Rate limit exceeded. Limit resets at midnight UTC.",
    };

    return {
      valid: false,
      errorCode,
      errorMessage: messages[errorCode ?? "INVALID_KEY"],
    };
  }

  return {
    valid: true,
    remainingRequests: result.remaining_requests,
  };
}

/**
 * Security headers for API responses.
 */
export const API_SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Cache-Control": "no-store",
  "Content-Security-Policy": "default-src 'none'",
} as const;

/**
 * Creates an error response for API authentication failures.
 */
export function createApiErrorResponse(
  result: ApiKeyValidationResult
): NextResponse<ApiErrorResponse> {
  const statusCodes: Record<string, number> = {
    INVALID_KEY: 401,
    KEY_DISABLED: 403,
    RATE_LIMIT_EXCEEDED: 429,
  };

  return NextResponse.json(
    {
      error: {
        code: result.errorCode ?? "INVALID_KEY",
        message: result.errorMessage ?? "Authentication failed.",
      },
    },
    {
      status: statusCodes[result.errorCode ?? "INVALID_KEY"] ?? 401,
      headers: API_SECURITY_HEADERS,
    }
  );
}

/**
 * Extracts API key from request headers.
 */
export function getApiKeyFromRequest(request: Request): string | null {
  return request.headers.get("X-API-Key");
}

/**
 * Generates a new API key with the ai_ prefix.
 */
export function generateApiKey(): string {
  return `ai_${crypto.randomUUID()}`;
}

/**
 * Gets the prefix of an API key for display (first 12 chars).
 */
export function getApiKeyPrefix(key: string): string {
  return key.slice(0, 12) + "...";
}
