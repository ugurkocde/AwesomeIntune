import type { Tool } from "~/types/tool";
import { SITE_CONFIG, CATEGORY_CONFIG } from "./constants";

/**
 * Generate JSON-LD structured data for a tool (SoftwareApplication schema)
 */
export function generateToolStructuredData(tool: Tool) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    author: {
      "@type": "Person",
      name: tool.author,
      ...(tool.githubUrl && { url: tool.githubUrl }),
    },
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
