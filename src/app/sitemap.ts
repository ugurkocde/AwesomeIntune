import type { MetadataRoute } from "next";
import {
  getAllTools,
  getAllCategories,
  getAllAuthors,
  getAllCollections,
  getCollectionTools,
} from "~/lib/tools.server";
import { SITE_CONFIG, STATIC_PAGES_LAST_MODIFIED } from "~/lib/constants";
import { getToolSlug } from "~/lib/tools";
import type { Tool, ToolCategory, ToolType } from "~/types/tool";

// Map categories to best-of URL slugs
const CATEGORY_TO_BEST_SLUG: Record<ToolCategory, string> = {
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

const STATIC_LAST_MODIFIED = new Date(STATIC_PAGES_LAST_MODIFIED);

// Derive lastModified from the newest tool in a list, falling back to the
// static date when a list has no tools.
function latestDateAdded(tools: Tool[]): Date {
  const latest = tools
    .map((tool) => tool.dateAdded)
    .sort()
    .at(-1);
  return latest ? new Date(latest) : STATIC_LAST_MODIFIED;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const tools = getAllTools();
  const categories = getAllCategories();
  const authors = getAllAuthors();
  const collections = getAllCollections();
  const baseUrl = SITE_CONFIG.url;

  const latestToolDate = latestDateAdded(tools);
  const latestByCategory = (category: string) =>
    latestDateAdded(tools.filter((tool) => tool.category === category));
  const latestByType = (type: ToolType) =>
    latestDateAdded(tools.filter((tool) => tool.type === type));
  const latestAcrossCollections = latestDateAdded(
    collections.flatMap((collection) => getCollectionTools(collection))
  );

  // Static pages — top-level routes get high priority so Google
  // recognises them as primary site sections (prerequisite for sitelinks).
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: latestToolDate,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: latestAcrossCollections,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ideas`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/stats`,
      lastModified: latestToolDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/authors`,
      lastModified: latestToolDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/developers`,
      lastModified: STATIC_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Tool detail pages
  const toolPages: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${baseUrl}/tools/${getToolSlug(tool)}`,
    lastModified: new Date(tool.dateAdded),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/tools/category/${category}`,
    lastModified: latestByCategory(category),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Author profile pages
  const authorPages: MetadataRoute.Sitemap = authors.map((author) => ({
    url: `${baseUrl}/authors/${author.slug}`,
    lastModified: latestDateAdded(author.tools),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Collection pages
  const collectionPages: MetadataRoute.Sitemap = collections.map(
    (collection) => ({
      url: `${baseUrl}/collections/${collection.slug}`,
      lastModified: latestDateAdded(getCollectionTools(collection)),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })
  );

  // Best-of category pages (high priority for GEO)
  const bestOfPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/best/${CATEGORY_TO_BEST_SLUG[category as ToolCategory] ?? `${category}-tools`}`,
    lastModified: latestByCategory(category),
    changeFrequency: "weekly" as const,
    priority: 0.9, // High priority for AI citation
  }));

  // Add PowerShell-specific best-of pages
  const powerShellBestOfPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/best/powershell-scripts`,
      lastModified: latestByType("powershell-script"),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/best/powershell-modules`,
      lastModified: latestByType("powershell-module"),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
  ];

  return [
    ...staticPages,
    ...toolPages,
    ...categoryPages,
    ...authorPages,
    ...collectionPages,
    ...bestOfPages,
    ...powerShellBestOfPages,
  ];
}
