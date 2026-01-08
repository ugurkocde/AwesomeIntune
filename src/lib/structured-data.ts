import type { Tool, ToolCategory } from "~/types/tool";
import { SITE_CONFIG, CATEGORY_CONFIG } from "./constants";
import { getToolAuthors } from "./tools";

/**
 * Generate JSON-LD structured data for a tool (SoftwareApplication schema)
 */
export function generateToolStructuredData(tool: Tool) {
  const authors = getToolAuthors(tool);

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    author: authors.map((author) => ({
      "@type": "Person",
      name: author.name,
      ...(author.githubUrl && { url: author.githubUrl }),
    })),
    applicationCategory: CATEGORY_CONFIG[tool.category]?.label ?? tool.category,
    operatingSystem: getOperatingSystem(tool.type),
    ...(tool.repoUrl && { codeRepository: tool.repoUrl }),
    ...(tool.downloadUrl && { downloadUrl: tool.downloadUrl }),
    ...(tool.websiteUrl && { url: tool.websiteUrl }),
    datePublished: tool.dateAdded,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
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
          text: `Awesome Intune is a curated directory of ${toolCount}+ free, community-built tools for Microsoft Intune and endpoint management. It helps IT professionals discover PowerShell scripts, automation tools, and utilities for managing devices.`,
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
          text: "You can submit a tool by visiting our GitHub repository and opening a pull request or creating an issue with your tool details. All submissions are reviewed before being added, including automated security scanning for open-source tools.",
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
    ],
  };
}
