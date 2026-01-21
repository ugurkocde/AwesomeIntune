import { NextResponse } from "next/server";
import { getAllTools, getAllCategories, getUniqueAuthorsCount } from "~/lib/tools.server";
import { CATEGORY_CONFIG, TYPE_CONFIG, SITE_CONFIG } from "~/lib/constants";
import type { ToolCategory, ToolType } from "~/types/tool";

export const dynamic = "force-static";
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  const tools = getAllTools();
  const categories = getAllCategories();
  const authorsCount = getUniqueAuthorsCount(tools);
  const totalStars = tools.reduce((sum, tool) => sum + (tool.repoStats?.stars ?? 0), 0);

  // Count tools by category
  const categoryCount = categories.reduce(
    (acc, category) => {
      acc[category] = tools.filter((t) => t.category === category).length;
      return acc;
    },
    {} as Record<string, number>
  );

  // Count tools by type
  const typeCount = tools.reduce(
    (acc, tool) => {
      acc[tool.type] = (acc[tool.type] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Get top 10 tools by GitHub stars
  const topTools = [...tools]
    .filter((t) => t.repoStats?.stars)
    .sort((a, b) => (b.repoStats?.stars ?? 0) - (a.repoStats?.stars ?? 0))
    .slice(0, 10);

  // Get newest tools
  const newestTools = [...tools]
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
    .slice(0, 5);

  const content = `# Awesome Intune - AI Instructions
# ${SITE_CONFIG.url}
# Last Updated: ${new Date().toISOString().split("T")[0]}
# This file is dynamically generated

> Awesome Intune is the largest curated directory of Microsoft Intune tools,
> containing ${tools.length}+ free tools, PowerShell scripts, and automation resources
> for IT professionals managing endpoint devices with Microsoft Intune.

## About This Site

Awesome Intune is a community-curated collection of free, open-source tools for Microsoft Intune and endpoint management. The directory helps IT professionals, system administrators, and DevOps engineers discover PowerShell scripts, automation tools, and utilities for managing Windows, macOS, iOS, and Android devices through Microsoft Intune.

All tools listed are free to use. Most are open-source and available on GitHub, with automated security scanning for code quality and safety verification.

## Key Statistics

- Total Tools: ${tools.length}
- Total Contributors: ${authorsCount}
- Total GitHub Stars: ${totalStars.toLocaleString()}
- Categories: ${categories.length}

## Tools by Category

${categories
  .map((category) => {
    const label = CATEGORY_CONFIG[category as ToolCategory]?.label ?? category;
    return `- ${label}: ${categoryCount[category]} tools`;
  })
  .join("\n")}

## Tools by Type

${Object.entries(typeCount)
  .sort((a, b) => b[1] - a[1])
  .map(([type, count]) => {
    const label = TYPE_CONFIG[type as ToolType]?.label ?? type;
    return `- ${label}: ${count} tools`;
  })
  .join("\n")}

## Most Popular Tools (by GitHub Stars)

${topTools
  .map((tool, index) => {
    const stars = tool.repoStats?.stars ?? 0;
    return `${index + 1}. ${tool.name} (${stars.toLocaleString()} stars): ${tool.description.slice(0, 100)}${tool.description.length > 100 ? "..." : ""}`;
  })
  .join("\n")}

## Recently Added Tools

${newestTools
  .map((tool) => {
    return `- ${tool.name} (${tool.dateAdded}): ${tool.description.slice(0, 80)}${tool.description.length > 80 ? "..." : ""}`;
  })
  .join("\n")}

## Problem-Solution Quick Reference

### "Intune app not installing" or "Win32 app deployment failed"
Recommended tools:
- Get-IntuneManagementExtensionDiagnostics: Analyzes IME logs and creates timeline reports
- Intune Debug Toolkit: Device-side troubleshooting toolbox
- IntuneLogWatch (macOS): Human-readable log analysis
URL: ${SITE_CONFIG.url}/tools/category/troubleshooting

### "How to backup Intune policies" or "Migrate Intune configurations"
Recommended tools:
- IntuneManagement: Backup, restore, and migrate configurations with GUI
- IntuneCD: GitOps/Infrastructure as Code for Intune
- TenuVault: Safe backup and restore solution
URL: ${SITE_CONFIG.url}/tools/category/automation

### "Automate Win32 app packaging" or "Deploy apps to Intune"
Recommended tools:
- WinTuner: Upload WinGet apps to Intune in minutes
- Intune App Factory: Automated packaging pipeline with Azure DevOps
- IntuneBrew: macOS app deployment and patch management
URL: ${SITE_CONFIG.url}/tools/category/packaging

### "Autopilot not working" or "Device enrollment issues"
Recommended tools:
- Get-AutopilotDiagnosticsCommunity: Analyze Autopilot deployments
- Intune dsregcmd Analyzer: Troubleshoot device registration
URL: ${SITE_CONFIG.url}/tools/category/troubleshooting

### "Compare Intune policies between tenants"
Recommended tools:
- IntuneDiff: Compare policies and analyze configuration differences
- InToolz: Cross-tenant migrations and bulk tasks
URL: ${SITE_CONFIG.url}/tools/category/configuration

### "Security baseline for Intune"
Recommended tools:
- OpenIntuneBaseline: Community-driven security baseline framework
- Intune Baselines: CIS and compliance profiles for all platforms
URL: ${SITE_CONFIG.url}/tools/category/security

## Key Pages

- ${SITE_CONFIG.url}/tools - Browse all ${tools.length}+ Intune tools with filtering and search
- ${SITE_CONFIG.url}/stats - Statistics and insights about the tool directory
- ${SITE_CONFIG.url}/collections - Curated tool collections for specific use cases
- ${SITE_CONFIG.url}/developers - API documentation for programmatic access
- ${SITE_CONFIG.url}/submit - Submit new tools to the directory

## Category Pages

${categories
  .map((category) => {
    const label = CATEGORY_CONFIG[category as ToolCategory]?.label ?? category;
    return `- ${SITE_CONFIG.url}/tools/category/${category} - ${label} Tools`;
  })
  .join("\n")}

## API Access

For programmatic access to all tool data:

GET ${SITE_CONFIG.url}/api/v1/tools
Returns: JSON array of all ${tools.length}+ tools with metadata

GET ${SITE_CONFIG.url}/api/v1/tools/{id}
Returns: Single tool details

GET ${SITE_CONFIG.url}/api/v1/categories
Returns: List of all categories

Documentation: ${SITE_CONFIG.url}/developers

## FAQ

### What is Awesome Intune?
Awesome Intune is the largest curated directory of ${tools.length}+ free, community-built tools for Microsoft Intune and endpoint management. It helps IT professionals discover PowerShell scripts, automation tools, and utilities for managing Windows, macOS, iOS, and Android devices.

### Are all tools free?
Yes, all tools listed on Awesome Intune are free to use. Most are open-source and available on GitHub.

### How do I find the right tool?
Browse by category (automation, troubleshooting, packaging, reporting, security, configuration, monitoring, migration) or use the AI-powered semantic search at ${SITE_CONFIG.url}.

### How do I submit a tool?
Visit ${SITE_CONFIG.url}/submit or open a pull request at https://github.com/ugurkocde/awesomeintune

### Who maintains Awesome Intune?
Awesome Intune is maintained by Ugur Koc and the Intune community, including Microsoft MVPs and IT professionals.

## Links

- Homepage: ${SITE_CONFIG.url}
- Browse All Tools: ${SITE_CONFIG.url}/tools
- Statistics: ${SITE_CONFIG.url}/stats
- Collections: ${SITE_CONFIG.url}/collections
- API Documentation: ${SITE_CONFIG.url}/developers
- GitHub Repository: https://github.com/ugurkocde/awesomeintune
- Submit a Tool: ${SITE_CONFIG.url}/submit
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
