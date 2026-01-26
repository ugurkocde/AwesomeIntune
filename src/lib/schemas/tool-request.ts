import { z } from "zod";

// Categories matching the existing tool categories
export const REQUEST_CATEGORIES = [
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

export type RequestCategory = (typeof REQUEST_CATEGORIES)[number];

export const toolRequestSchema = z.object({
  // Required fields
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(2000, "Description must be less than 2000 characters"),

  // Optional fields
  use_case: z
    .string()
    .max(1000, "Use case must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
  category: z.enum(REQUEST_CATEGORIES).optional(),

  // Turnstile token (required)
  turnstileToken: z.string().min(1, "Please complete the CAPTCHA verification"),
});

export type ToolRequestData = z.infer<typeof toolRequestSchema>;

// Schema for updating request status (admin only)
export const toolRequestUpdateSchema = z.object({
  status: z.enum(["open", "in_progress", "completed", "closed"]),
  fulfilled_tool_id: z.string().optional(),
});

export type ToolRequestUpdateData = z.infer<typeof toolRequestUpdateSchema>;
