export type ToolCategory =
  | "reporting"
  | "automation"
  | "packaging"
  | "troubleshooting"
  | "security"
  | "configuration"
  | "monitoring"
  | "migration"
  | "other";

export type ToolType =
  | "powershell-module"
  | "powershell-script"
  | "web-app"
  | "desktop-app"
  | "browser-extension"
  | "cli-tool"
  | "api-wrapper"
  | "documentation"
  | "other";

export interface Tool {
  id: string;
  name: string;
  description: string;
  keywords?: string[];
  author: string;
  authorPicture?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  xUrl?: string;
  repoUrl?: string;
  downloadUrl?: string;
  websiteUrl?: string;
  category: ToolCategory;
  type: ToolType;
  dateAdded: string;
  // Note: screenshots are dynamically discovered from public/screenshots/{tool-id}/ at build time
}

export interface ToolsData {
  tools: Tool[];
}
