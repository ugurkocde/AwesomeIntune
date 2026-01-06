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

export interface Author {
  name: string;
  picture?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  xUrl?: string;
}

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
  authors?: Author[];
  repoUrl?: string;
  downloadUrl?: string;
  websiteUrl?: string;
  category: ToolCategory;
  type: ToolType;
  dateAdded: string;
  screenshots?: string[];
}

export interface ToolsData {
  tools: Tool[];
}
