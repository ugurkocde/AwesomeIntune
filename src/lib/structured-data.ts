import type { Tool, ToolCategory } from "~/types/tool";
import { SITE_CONFIG, CATEGORY_CONFIG } from "./constants";
import { getToolAuthors } from "./tools";

/**
 * Generate JSON-LD structured data for a tool (SoftwareApplication schema)
 * Enhanced with aggregateRating, keywords, license, and availability
 */
export function generateToolStructuredData(tool: Tool) {
  const authors = getToolAuthors(tool);
  const categoryLabel = CATEGORY_CONFIG[tool.category]?.label ?? tool.category;

  // Calculate rating based on GitHub stars (scale 1-5)
  // 0 stars = 4.0, 100+ stars = 4.5, 500+ stars = 4.8, 1000+ stars = 5.0
  const stars = tool.repoStats?.stars ?? 0;
  const ratingValue = Math.min(5, 4 + (stars / 1000) * 1);

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    author: authors.map((author) => ({
      "@type": "Person",
      name: author.name,
      ...(author.githubUrl && { url: author.githubUrl }),
      ...(author.linkedinUrl && { sameAs: author.linkedinUrl }),
    })),
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: categoryLabel,
    operatingSystem: getOperatingSystem(tool.type),
    ...(tool.repoUrl && { codeRepository: tool.repoUrl }),
    ...(tool.downloadUrl && { downloadUrl: tool.downloadUrl }),
    ...(tool.websiteUrl && { url: tool.websiteUrl }),
    datePublished: tool.dateAdded,
    // Add keywords for better discoverability
    ...(tool.keywords && tool.keywords.length > 0 && {
      keywords: tool.keywords.join(", "),
    }),
    // Add aggregate rating based on GitHub stars
    ...(stars > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: ratingValue.toFixed(1),
        bestRating: "5",
        worstRating: "1",
        ratingCount: stars,
      },
    }),
    // Add license information
    ...(tool.repoStats?.license && {
      license: `https://opensource.org/licenses/${tool.repoStats.license}`,
    }),
    // Enhanced offers with availability
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    // Add isAccessibleForFree for all tools
    isAccessibleForFree: true,
  };
}

/**
 * Generate JSON-LD for the website (WebSite schema)
 */
export function generateWebsiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
  };
}

/**
 * Generate JSON-LD for a collection page (CollectionPage schema)
 */
export function generateCollectionStructuredData(
  name: string,
  description: string,
  url: string,
  itemCount: number
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    numberOfItems: itemCount,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
  };
}

/**
 * Determine operating system based on tool type
 */
function getOperatingSystem(type: string): string {
  switch (type) {
    case "powershell-module":
    case "powershell-script":
      return "Windows";
    case "web-app":
      return "Any";
    case "desktop-app":
      return "Windows, macOS";
    case "browser-extension":
      return "Any";
    case "cli-tool":
      return "Windows, macOS, Linux";
    default:
      return "Any";
  }
}

/**
 * Generate JSON-LD for breadcrumb navigation (BreadcrumbList schema)
 */
export function generateBreadcrumbStructuredData(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate JSON-LD for the organization (Organization schema for E-E-A-T)
 */
export function generateOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.png`,
    description: SITE_CONFIG.description,
    sameAs: ["https://github.com/ugurkocde/awesomeintune"],
  };
}

/**
 * Generate JSON-LD for the tools directory (ItemList schema)
 * This helps Google show a list snippet in search results
 */
export function generateItemListStructuredData(tools: Tool[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Microsoft Intune Tools and Scripts",
    description:
      "Curated collection of free community-built Intune tools and automation scripts",
    numberOfItems: tools.length,
    itemListElement: tools.slice(0, 10).map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "SoftwareApplication",
        name: tool.name,
        description: tool.description,
        url: `${SITE_CONFIG.url}/tools/${tool.id}`,
        applicationCategory:
          CATEGORY_CONFIG[tool.category]?.label ?? tool.category,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
    })),
  };
}

/**
 * Generate FAQ schema for the homepage
 * Enhanced with more questions for better rich snippet coverage
 */
export function generateHomepageFAQStructuredData(toolCount: number) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Awesome Intune?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Awesome Intune is the largest curated directory of ${toolCount}+ free, community-built tools for Microsoft Intune and endpoint management. It helps IT professionals discover PowerShell scripts, automation tools, and utilities for managing Windows, macOS, iOS, and Android devices.`,
        },
      },
      {
        "@type": "Question",
        name: "What does the Verified badge mean on Awesome Intune?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Verified badge indicates that a tool's source code has been automatically scanned by our AI-powered security system and passed all 6 security checks. These checks look for obfuscated code, remote execution risks, credential theft patterns, data exfiltration, malicious patterns, and hardcoded secrets.",
        },
      },
      {
        "@type": "Question",
        name: "What does the Curated badge mean on Awesome Intune?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Curated badge is shown for tools that don't have publicly available source code (such as web applications). While we cannot perform automated security scans on these tools, they have been manually reviewed and selected by our team for their usefulness to the Intune community.",
        },
      },
      {
        "@type": "Question",
        name: "Are all tools on Awesome Intune free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, all tools listed on Awesome Intune are free to use. Most are open-source and available on GitHub, while some web applications offer free tiers with optional premium features.",
        },
      },
      {
        "@type": "Question",
        name: "How do I submit a tool to Awesome Intune?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can submit a tool by visiting awesomeintune.com/submit or opening a pull request on our GitHub repository. All submissions are reviewed before being added, including automated security scanning for open-source tools.",
        },
      },
      {
        "@type": "Question",
        name: "What security checks are performed on Intune tools?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our automated security scanner checks for 6 potential issues: obfuscated or encoded code, remote code execution patterns, credential harvesting attempts, data exfiltration risks, known malicious patterns, and hardcoded secrets or API keys. Tools that pass all checks receive the Verified badge.",
        },
      },
      {
        "@type": "Question",
        name: "What are the best tools for backing up Intune configurations?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The top tools for backing up Intune configurations include IntuneManagement (PowerShell GUI for backup/restore), IntuneCD (GitOps/Infrastructure as Code), and TenuVault (safe backup solution). These tools help you export, version control, and restore your Intune policies and settings.",
        },
      },
      {
        "@type": "Question",
        name: "How do I troubleshoot Intune app deployment issues?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Use Get-IntuneManagementExtensionDiagnostics to analyze IME logs and create timeline reports, or Intune Debug Toolkit for comprehensive device-side troubleshooting. These tools help identify why Win32 apps fail to install and provide detailed error analysis.",
        },
      },
      {
        "@type": "Question",
        name: "What tools help with Win32 app packaging for Intune?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "WinTuner lets you upload WinGet apps to Intune in minutes, IntuneWin32App is a PowerShell module for the complete Win32 app lifecycle, and Intune App Factory provides automated packaging pipelines with Azure DevOps integration.",
        },
      },
      {
        "@type": "Question",
        name: "Are there tools for managing macOS devices with Intune?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, Awesome Intune includes several macOS tools: IntuneBrew for app deployment and patch management, IntuneLogWatch for log analysis, MISA for device administration, SupportCompanion for end-user support, and Mace for building compliance baselines.",
        },
      },
    ],
  };
}

/**
 * Category-specific FAQ content
 */
const CATEGORY_FAQ_CONTENT: Record<
  ToolCategory,
  { question1: string; answer1: string; question2: string; answer2: string }
> = {
  automation: {
    question1: "What are the best Intune automation tools?",
    answer1:
      "Awesome Intune lists free automation tools including IntuneManagement for backup/restore, Intune App Factory for application packaging, and various PowerShell modules for bulk operations and scheduled tasks.",
    question2: "Can I automate Intune device management?",
    answer2:
      "Yes, many tools support automating Intune tasks such as device configuration backup, policy deployment, application management, and compliance reporting through PowerShell and the Microsoft Graph API.",
  },
  reporting: {
    question1: "What Intune reporting tools are available?",
    answer1:
      "Awesome Intune features reporting tools that provide insights into device compliance, application deployment status, configuration profiles, and overall endpoint health beyond the built-in Intune reports.",
    question2: "How can I create custom Intune reports?",
    answer2:
      "Several tools on Awesome Intune help create custom reports using PowerShell and Microsoft Graph API, allowing you to export data, build dashboards, and track metrics specific to your organization.",
  },
  troubleshooting: {
    question1: "What tools help troubleshoot Intune issues?",
    answer1:
      "Awesome Intune includes diagnostic tools like Get-IntuneME-Diagnostics for Intune Management Extension issues, Intune Debug Toolkit for device-side troubleshooting, and various log analyzers.",
    question2: "How do I diagnose Intune enrollment problems?",
    answer2:
      "Tools like dsregcmd analyzers, Autopilot diagnostics scripts, and enrollment troubleshooters help identify and resolve device enrollment issues with detailed error analysis and remediation steps.",
  },
  security: {
    question1: "What Intune security tools are available?",
    answer1:
      "Awesome Intune lists security-focused tools for compliance monitoring, Defender for Endpoint management, conditional access testing, and security baseline validation.",
    question2: "How can I improve Intune security compliance?",
    answer2:
      "Security tools on Awesome Intune help audit device compliance, validate security configurations, monitor threats, and ensure devices meet your organization's security requirements.",
  },
  packaging: {
    question1: "What tools help with Intune app packaging?",
    answer1:
      "Awesome Intune includes packaging tools like Win32 app creators, MSIX converters, and intunewin file generators that simplify preparing applications for Intune deployment.",
    question2: "How do I create Win32 apps for Intune?",
    answer2:
      "Several tools automate the Win32 app creation process, including converting installers to .intunewin format, generating detection rules, and creating deployment scripts.",
  },
  configuration: {
    question1: "What Intune configuration tools are available?",
    answer1:
      "Awesome Intune features configuration management tools for creating, backing up, and deploying device configuration profiles, settings catalogs, and administrative templates.",
    question2: "How can I manage Intune policies more efficiently?",
    answer2:
      "Configuration tools help bulk-edit policies, compare configurations across tenants, import/export settings, and maintain consistent device configurations.",
  },
  monitoring: {
    question1: "What tools help monitor Intune devices?",
    answer1:
      "Awesome Intune lists monitoring solutions that track device health, sync status, policy application, and provide real-time visibility into your managed device fleet.",
    question2: "How do I track Intune device compliance?",
    answer2:
      "Monitoring tools provide dashboards and alerts for compliance status, helping identify non-compliant devices and track remediation progress across your organization.",
  },
  migration: {
    question1: "What tools help with Intune migration?",
    answer1:
      "Awesome Intune includes migration tools for moving from other MDM solutions to Intune, transferring configurations between tenants, and managing device transitions.",
    question2: "How do I migrate devices to Intune?",
    answer2:
      "Migration tools help export configurations from existing systems, prepare devices for enrollment, and automate the transition process while minimizing downtime.",
  },
  other: {
    question1: "What other Intune tools are available?",
    answer1:
      "The Other category includes specialized utilities, documentation resources, and unique tools that enhance your Intune experience but don't fit into specific categories.",
    question2: "Where can I find more Intune resources?",
    answer2:
      "Beyond the tools listed, Awesome Intune provides links to documentation, community resources, and GitHub repositories where you can find additional scripts and utilities.",
  },
};

/**
 * Generate FAQ schema for a category page
 */
export function generateCategoryFAQStructuredData(category: ToolCategory) {
  const faqContent = CATEGORY_FAQ_CONTENT[category];

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: faqContent.question1,
        acceptedAnswer: {
          "@type": "Answer",
          text: faqContent.answer1,
        },
      },
      {
        "@type": "Question",
        name: faqContent.question2,
        acceptedAnswer: {
          "@type": "Answer",
          text: faqContent.answer2,
        },
      },
    ],
  };
}

/**
 * Generate FAQ schema for a tool page
 */
export function generateToolFAQStructuredData(tool: Tool) {
  const authors = getToolAuthors(tool);
  const authorNames = authors.map((a) => a.name).join(", ");
  const categoryLabel = CATEGORY_CONFIG[tool.category]?.label ?? tool.category;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is ${tool.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: tool.description,
        },
      },
      {
        "@type": "Question",
        name: `Is ${tool.name} free?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes, ${tool.name} is completely free to use. It is an open-source tool available to the Intune community.`,
        },
      },
      {
        "@type": "Question",
        name: `Who created ${tool.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${tool.name} was created by ${authorNames}. You can find more of their tools on the Awesome Intune directory.`,
        },
      },
      {
        "@type": "Question",
        name: `What category does ${tool.name} belong to?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${tool.name} is a ${categoryLabel.toLowerCase()} tool for Microsoft Intune. Browse more ${categoryLabel.toLowerCase()} tools at awesomeintune.com/tools/category/${tool.category}.`,
        },
      },
      ...(tool.repoUrl
        ? [
            {
              "@type": "Question",
              name: `Where can I download ${tool.name}?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: `${tool.name} is available on GitHub at ${tool.repoUrl}. Visit the repository to download the latest version and view the documentation.`,
              },
            },
          ]
        : []),
      ...(tool.worksWith && tool.worksWith.length > 0
        ? [
            {
              "@type": "Question",
              name: `What platforms does ${tool.name} work with?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: `${tool.name} works with ${tool.worksWith.join(", ")}. It integrates with Microsoft Intune for endpoint management.`,
              },
            },
          ]
        : []),
    ],
  };
}

/**
 * Generate DataCatalog schema for the tools directory (GEO optimization)
 * This helps AI tools understand that this site is a structured database of tools
 */
export function generateDataCatalogStructuredData(toolCount: number, _categoryCount?: number) {
  return {
    "@context": "https://schema.org",
    "@type": "DataCatalog",
    name: "Awesome Intune Tools Directory",
    description: `A curated catalog of ${toolCount}+ free Microsoft Intune tools, PowerShell scripts, and automation resources for IT professionals.`,
    url: SITE_CONFIG.url,
    keywords: [
      "Microsoft Intune",
      "Intune tools",
      "PowerShell scripts",
      "endpoint management",
      "MDM tools",
      "device management",
      "automation",
      "IT tools",
    ],
    creator: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
    dateModified: new Date().toISOString(),
    inLanguage: "en",
    isAccessibleForFree: true,
    license: "https://opensource.org/licenses/MIT",
    numberOfItems: toolCount,
    about: {
      "@type": "Thing",
      name: "Microsoft Intune",
      description: "Cloud-based endpoint management solution from Microsoft",
    },
    hasPart: [
      {
        "@type": "Dataset",
        name: "Intune Automation Tools",
        description: "Tools for automating Microsoft Intune tasks and workflows",
      },
      {
        "@type": "Dataset",
        name: "Intune Troubleshooting Tools",
        description: "Diagnostic and troubleshooting utilities for Intune",
      },
      {
        "@type": "Dataset",
        name: "Intune Packaging Tools",
        description: "Application packaging tools for Win32 and macOS apps",
      },
      {
        "@type": "Dataset",
        name: "Intune Reporting Tools",
        description: "Reporting and analytics tools for Intune environments",
      },
      {
        "@type": "Dataset",
        name: "Intune Security Tools",
        description: "Security and compliance tools for Intune",
      },
    ],
  };
}

/**
 * Generate Statistics page structured data
 */
export function generateStatsPageStructuredData(stats: {
  totalTools: number;
  totalStars: number;
  totalAuthors: number;
  categories: { name: string; count: number }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Awesome Intune Statistics - Tool Directory Insights",
    description: `Statistics and insights about the Awesome Intune directory with ${stats.totalTools} tools, ${stats.totalStars.toLocaleString()} GitHub stars, and ${stats.totalAuthors} contributors.`,
    url: `${SITE_CONFIG.url}/stats`,
    mainEntity: {
      "@type": "Dataset",
      name: "Awesome Intune Tool Statistics",
      description: "Statistical overview of the Microsoft Intune tools directory",
      variableMeasured: [
        {
          "@type": "PropertyValue",
          name: "Total Tools",
          value: stats.totalTools,
        },
        {
          "@type": "PropertyValue",
          name: "Total GitHub Stars",
          value: stats.totalStars,
        },
        {
          "@type": "PropertyValue",
          name: "Total Contributors",
          value: stats.totalAuthors,
        },
      ],
    },
  };
}
