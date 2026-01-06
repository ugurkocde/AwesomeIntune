import { z } from "zod";

const VALID_CATEGORIES = [
  "reporting",
  "automation",
  "packaging",
  "troubleshooting",
  "security",
  "configuration",
  "monitoring",
  "migration",
  "other",
] as const;

const VALID_TYPES = [
  "powershell-module",
  "powershell-script",
  "web-app",
  "desktop-app",
  "browser-extension",
  "cli-tool",
  "api-wrapper",
  "documentation",
  "other",
] as const;

// Author schema for multiple authors support
const authorSchema = z.object({
  name: z
    .string()
    .min(2, "Author name must be at least 2 characters")
    .max(50, "Author name must be less than 50 characters"),
  githubUrl: z
    .string()
    .url("Must be a valid URL")
    .refine(
      (url) => url.includes("github.com"),
      "Must be a GitHub profile URL"
    )
    .optional()
    .or(z.literal("")),
  linkedinUrl: z
    .string()
    .url("Must be a valid URL")
    .refine(
      (url) => url.includes("linkedin.com"),
      "Must be a LinkedIn profile URL"
    )
    .optional()
    .or(z.literal("")),
  xUrl: z
    .string()
    .url("Must be a valid URL")
    .refine(
      (url) => url.includes("x.com") || url.includes("twitter.com"),
      "Must be an X/Twitter profile URL"
    )
    .optional()
    .or(z.literal("")),
});

export type SubmissionAuthor = z.infer<typeof authorSchema>;

export const toolSubmissionSchema = z.object({
  // Required fields
  name: z
    .string()
    .min(2, "Tool name must be at least 2 characters")
    .max(100, "Tool name must be less than 100 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(500, "Description must be less than 500 characters"),
  authors: z
    .array(authorSchema)
    .min(1, "At least one author is required")
    .max(5, "Maximum 5 authors allowed"),
  repoUrl: z
    .string()
    .url("Please enter a valid URL"),
  category: z.enum(VALID_CATEGORIES),
  type: z.enum(VALID_TYPES),

  // Optional tool links
  downloadUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  websiteUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),

  // Additional info
  additionalInfo: z
    .string()
    .max(1000, "Additional info must be less than 1000 characters")
    .optional()
    .or(z.literal("")),

  // Turnstile token (required)
  turnstileToken: z.string().min(1, "Please complete the CAPTCHA verification"),

  // Terms acceptance
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the submission guidelines" }),
  }),
});

export type ToolSubmissionData = z.infer<typeof toolSubmissionSchema>;

// Helper to extract GitHub username from URL
export function extractGitHubUsername(url: string): string | null {
  const regex = /github\.com\/([^/]+)/;
  const match = regex.exec(url);
  return match?.[1] ?? null;
}

// Derive avatar URL from GitHub profile URL
export function deriveAvatarUrl(githubUrl: string): string | null {
  const username = extractGitHubUsername(githubUrl);
  return username ? `https://github.com/${username}.png` : null;
}
