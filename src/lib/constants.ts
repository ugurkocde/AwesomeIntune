import type { ToolCategory, ToolType, WorksWithTag } from "~/types/tool";

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

export const WORKS_WITH_CONFIG: Record<
  WorksWithTag,
  { label: string; color: string }
> = {
  // Platforms
  windows: { label: "Windows", color: "#0078d4" },
  macos: { label: "macOS", color: "#a3a3a3" },
  ios: { label: "iOS", color: "#0ea5e9" },
  android: { label: "Android", color: "#22c55e" },
  linux: { label: "Linux", color: "#fbbf24" },
  // Intune Features
  autopilot: { label: "Autopilot", color: "#00bcf2" },
  "win32-apps": { label: "Win32 Apps", color: "#7c3aed" },
  "configuration-profiles": { label: "Config Profiles", color: "#10b981" },
  "compliance-policies": { label: "Compliance", color: "#8b5cf6" },
  "remediation-scripts": { label: "Remediation Scripts", color: "#f59e0b" },
  "security-baselines": { label: "Security Baselines", color: "#dc2626" },
  "settings-catalog": { label: "Settings Catalog", color: "#059669" },
  "app-protection-policies": { label: "App Protection", color: "#d946ef" },
  "device-filters": { label: "Device Filters", color: "#14b8a6" },
  "conditional-access": { label: "Conditional Access", color: "#ec4899" },
  // Microsoft Services
  "graph-api": { label: "Graph API", color: "#0078d4" },
  defender: { label: "Defender", color: "#ef4444" },
  "entra-id": { label: "Entra ID", color: "#0078d4" },
  bitlocker: { label: "BitLocker", color: "#6366f1" },
  laps: { label: "LAPS", color: "#84cc16" },
  // External Integrations
  admx: { label: "ADMX", color: "#6366f1" },
  "azure-automation": { label: "Azure Automation", color: "#0078d4" },
  "azure-devops": { label: "Azure DevOps", color: "#0078d4" },
  winget: { label: "Winget", color: "#0ea5e9" },
  homebrew: { label: "Homebrew", color: "#fbbf24" },
};

export const WORKS_WITH_TAGS = Object.entries(WORKS_WITH_CONFIG).map(
  ([value, config]) => ({
    value: value as WorksWithTag,
    label: config.label,
    color: config.color,
  })
);

// Collection icons and accent colors
export const COLLECTION_ICONS: Record<
  string,
  { icon: "book-open" | "rocket" | "settings" | "apple" | "package" | "bug" | "layers"; color: string }
> = {
  "getting-started": { icon: "book-open", color: "#00d4ff" },
  "autopilot-toolkit": { icon: "rocket", color: "#7c3aed" },
  "device-management": { icon: "settings", color: "#10b981" },
  "macos-management": { icon: "apple", color: "#a3a3a3" },
  "app-packaging": { icon: "package", color: "#f59e0b" },
  troubleshooting: { icon: "bug", color: "#ef4444" },
};

