import type { ToolCategory } from "~/types/tool";

// Map /best/[category] URL slugs to tool category keys.
// PowerShell slugs are intentionally absent: they are type-based pages
// (powershell-script / powershell-module), not category pages, and are
// handled separately in the best page.
export const BEST_SLUG_TO_CATEGORY: Record<string, ToolCategory> = {
  "reporting-tools": "reporting",
  "automation-tools": "automation",
  "packaging-tools": "packaging",
  "troubleshooting-tools": "troubleshooting",
  "security-tools": "security",
  "configuration-tools": "configuration",
  "monitoring-tools": "monitoring",
  "migration-tools": "migration",
  "other-tools": "other",
};

// Reverse map for generating slugs
export const CATEGORY_TO_BEST_SLUG: Record<ToolCategory, string> = {
  reporting: "reporting-tools",
  automation: "automation-tools",
  packaging: "packaging-tools",
  troubleshooting: "troubleshooting-tools",
  security: "security-tools",
  configuration: "configuration-tools",
  monitoring: "monitoring-tools",
  migration: "migration-tools",
  other: "other-tools",
};

// Type-based best pages that live alongside the category slugs
export const BEST_TYPE_SLUGS = ["powershell-scripts", "powershell-modules"] as const;
