/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      // The directory now lives on the homepage. Exact match only, so tool
      // detail (/tools/[id]) and category (/tools/category/[c]) pages are kept.
      {
        source: "/tools",
        destination: "/",
        permanent: true,
      },
      {
        source: "/tools/pppc-builder-for-macos",
        destination: "/tools/macpppc",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "object-src 'none'",
              "frame-ancestors 'none'",
              "form-action 'self'",
              // Inline is required for the theme bootstrap script and the
              // analytics shim; Plausible and Turnstile are the only
              // third-party scripts.
              "script-src 'self' 'unsafe-inline' https://plausible.io https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              // changelog.ugurlabs.com serves the in-app changelog feed and
              // api.github.com is used by the submit form's metadata prefill.
              "connect-src 'self' https://plausible.io https://challenges.cloudflare.com https://*.supabase.co https://changelog.ugurlabs.com https://api.github.com",
              "frame-src https://challenges.cloudflare.com",
              "worker-src 'self' blob:",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default config;
