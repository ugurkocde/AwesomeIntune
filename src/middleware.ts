import { NextResponse, type NextRequest } from "next/server";

/**
 * Sets a per-request Content-Security-Policy with a nonce so inline scripts do
 * not need 'unsafe-inline'. The nonce is forwarded as x-nonce so server
 * components can apply it to their own inline scripts. The same policy is set
 * on the response header for the browser.
 */
export function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const isDev = process.env.NODE_ENV === "development";

  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    // React dev mode and Turbopack use eval; production never does.
    `script-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-eval'" : ""} https://plausible.io https://challenges.cloudflare.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://plausible.io https://challenges.cloudflare.com https://*.supabase.co https://changelog.ugurlabs.com https://api.github.com",
    "frame-src https://challenges.cloudflare.com",
    "worker-src 'self' blob:",
    "upgrade-insecure-requests",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("content-security-policy", csp);
  return response;
}

export const config = {
  // Pages only. Skip API routes, Next internals, and static assets.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|svg|ico|gif|txt|xml|webmanifest|json|mp4|webm)$).*)",
  ],
};
