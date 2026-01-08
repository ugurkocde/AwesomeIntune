import type { ToolCategory, ToolType } from "~/types/tool";

export const CATEGORY_CONFIG: Record<
  ToolCategory,
  { label: string; color: string }
> = {
  reporting: { label: "Reporting", color: "#3b82f6" },
  automation: { label: "Automation", color: "#10b981" },
  packaging: { label: "Packaging", color: "#f59e0b" },
  troubleshooting: { label: "Troubleshooting", color: "#ef4444" },
  security: { label: "Security", color: "#8b5cf6" },
  configuration: { label: "Configuration", color: "#06b6d4" },
  monitoring: { label: "Monitoring", color: "#ec4899" },
  migration: { label: "Migration", color: "#84cc16" },
  other: { label: "Other", color: "#6b7280" },
};

export const TYPE_CONFIG: Record<ToolType, { label: string; color: string }> = {
  "powershell-module": { label: "PowerShell Module", color: "#5c2d91" },
  "powershell-script": { label: "PS Script", color: "#4FC3F7" },
  "web-app": { label: "Web App", color: "#0078d4" },
  "desktop-app": { label: "Desktop App", color: "#00bcf2" },
  "browser-extension": { label: "Browser Extension", color: "#ff8c00" },
  "cli-tool": { label: "CLI Tool", color: "#16a34a" },
  "api-wrapper": { label: "API Wrapper", color: "#7c3aed" },
  documentation: { label: "Documentation", color: "#64748b" },
  other: { label: "Other", color: "#6b7280" },
};

export const CATEGORIES = Object.entries(CATEGORY_CONFIG).map(
  ([value, config]) => ({
    value: value as ToolCategory,
    label: config.label,
    color: config.color,
  })
);

export const TYPES = Object.entries(TYPE_CONFIG).map(([value, config]) => ({
  value: value as ToolType,
  label: config.label,
  color: config.color,
}));

export const GITHUB_REPO_URL = "https://github.com/ugurkocde/awesomeintune";
export const GITHUB_RAW_BASE_URL = "https://raw.githubusercontent.com/ugurkocde/awesomeintune/main";
export const GITHUB_ISSUES_URL = `${GITHUB_REPO_URL}/issues/new?template=tool-submission.yml`;

export const SITE_CONFIG = {
  name: "Awesome Intune",
  description:
    "The community-curated collection of Microsoft Intune tools and resources",
  url: "https://awesomeintune.com",
};

