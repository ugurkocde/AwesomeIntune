import type { MetadataRoute } from "next";
import {
  getAllTools,
  getAllCategories,
  getAllAuthorSlugs,
  getAllCollectionSlugs,
} from "~/lib/tools.server";
import { SITE_CONFIG } from "~/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const tools = getAllTools();
  const categories = getAllCategories();
  const authorSlugs = getAllAuthorSlugs();
  const collectionSlugs = getAllCollectionSlugs();
  const baseUrl = SITE_CONFIG.url;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Tool detail pages
  const toolPages: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${baseUrl}/tools/${tool.id}`,
    lastModified: new Date(tool.dateAdded),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/tools/category/${category}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Author profile pages
  const authorPages: MetadataRoute.Sitemap = authorSlugs.map((slug) => ({
    url: `${baseUrl}/authors/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Collection pages
  const collectionPages: MetadataRoute.Sitemap = collectionSlugs.map((slug) => ({
    url: `${baseUrl}/collections/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...toolPages,
    ...categoryPages,
    ...authorPages,
    ...collectionPages,
  ];
}
