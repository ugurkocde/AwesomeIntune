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

export interface SecurityChecks {
  noObfuscatedCode: boolean;
  noRemoteExecution: boolean;
  noCredentialTheft: boolean;
  noDataExfiltration: boolean;
  noMaliciousPatterns: boolean;
  noHardcodedSecrets: boolean;
}

export interface SecurityCheck {
  passed: number;
  total: number;
  filesScanned: number;
  lastChecked: string;
  forceApproved: boolean;
  aiSummary?: string | null;
  checks: SecurityChecks;
}

export interface RepoStats {
  stars: number;
  forks: number;
  license: string | null;
  lastUpdated: string | null;
  archived: boolean;
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
  securityCheck?: SecurityCheck;
  repoStats?: RepoStats;
}

export interface ToolsData {
  tools: Tool[];
}
