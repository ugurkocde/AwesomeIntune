import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "~/lib/constants";

// AI crawlers explicitly allowed so the directory stays citable by
// generative engines (ChatGPT, Claude, Perplexity, Gemini, and others).
const AI_CRAWLERS = [
  "GPTBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
      })),
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  };
}
