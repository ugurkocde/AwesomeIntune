import fs from "fs";
import path from "path";
import type { Tool, Author } from "~/types/tool";
import type { Collection } from "~/types/collection";
import { getToolAuthors, generateAuthorSlug } from "./tools";

export interface AuthorWithTools extends Author {
  slug: string;
  tools: Tool[];
}

const TOOLS_DIRECTORY = path.join(process.cwd(), "data", "tools");
const COLLECTIONS_DIRECTORY = path.join(process.cwd(), "data", "collections");

/**
 * Read all tool JSON files from the data/tools directory
 * This function should only be called in Server Components
 */
export function getAllTools(): Tool[] {
  if (!fs.existsSync(TOOLS_DIRECTORY)) {
    return [];
  }

  const files = fs.readdirSync(TOOLS_DIRECTORY);
  const tools: Tool[] = [];

  for (const file of files) {
    // Skip non-JSON files and template files
    if (!file.endsWith(".json") || file === "template.json") continue;

    const filePath = path.join(TOOLS_DIRECTORY, file);
    const content = fs.readFileSync(filePath, "utf-8");

    try {
      const tool = JSON.parse(content) as Tool;
      tools.push(tool);
    } catch (error) {
      console.error(`Error parsing ${file}:`, error);
    }
  }

  // Sort alphabetically by name
  return tools.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get unique authors count (counts all authors from multi-author tools)
 */
export function getUniqueAuthorsCount(tools: Tool[]): number {
  const authors = new Set<string>();
  tools.forEach((tool) => {
    const toolAuthors = getToolAuthors(tool);
    toolAuthors.forEach((author) => authors.add(author.name.toLowerCase()));
  });
  return authors.size;
}

/**
 * Get a tool by its ID
 */
export function getToolById(id: string): Tool | undefined {
  const tools = getAllTools();
  return tools.find((tool) => tool.id === id);
}

/**
 * Get all tools in a specific category
 */
export function getToolsByCategory(category: string): Tool[] {
  const tools = getAllTools();
  return tools.filter((tool) => tool.category === category);
}

/**
 * Get all tool IDs (for static generation)
 */
export function getAllToolIds(): string[] {
  const tools = getAllTools();
  return tools.map((tool) => tool.id);
}

/**
 * Get all unique categories that have tools
 */
export function getAllCategories(): string[] {
  const tools = getAllTools();
  const categories = new Set<string>();
  tools.forEach((tool) => categories.add(tool.category));
  return Array.from(categories);
}

/**
 * Get related tools based on category, type, keywords, and worksWith tags
 */
export function getRelatedTools(tool: Tool, limit = 4): Tool[] {
  const tools = getAllTools().filter((t) => t.id !== tool.id);

  const scored = tools.map((t) => {
    let score = 0;

    // Same category: high weight
    if (t.category === tool.category) score += 10;

    // Same type: medium weight
    if (t.type === tool.type) score += 5;

    // Shared keywords: low weight
    const toolKeywords = new Set(
      tool.keywords?.map((k) => k.toLowerCase()) ?? []
    );
    const sharedKeywords =
      t.keywords?.filter((k) => toolKeywords.has(k.toLowerCase())).length ?? 0;
    score += sharedKeywords * 2;

    // Shared worksWith tags: medium weight
    const toolWorksWith = new Set(tool.worksWith ?? []);
    const sharedWorksWith =
      t.worksWith?.filter((w) => toolWorksWith.has(w)).length ?? 0;
    score += sharedWorksWith * 3;

    return { tool: t, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.tool);
}

// Re-export generateAuthorSlug for convenience
export { generateAuthorSlug };

/**
 * Get all unique authors with their tools
 */
export function getAllAuthors(): AuthorWithTools[] {
  const tools = getAllTools();
  const authorMap = new Map<string, AuthorWithTools>();

  tools.forEach((tool) => {
    const toolAuthors = getToolAuthors(tool);
    toolAuthors.forEach((author) => {
      const slug = generateAuthorSlug(author.name);
      const existing = authorMap.get(slug);

      if (existing) {
        existing.tools.push(tool);
      } else {
        authorMap.set(slug, {
          ...author,
          slug,
          tools: [tool],
        });
      }
    });
  });

  return Array.from(authorMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

/**
 * Get author by slug
 */
export function getAuthorBySlug(slug: string): AuthorWithTools | undefined {
  const authors = getAllAuthors();
  return authors.find((a) => a.slug === slug);
}

/**
 * Get all author slugs for static generation
 */
export function getAllAuthorSlugs(): string[] {
  return getAllAuthors().map((a) => a.slug);
}

// ============================================
// Collection Functions
// ============================================

/**
 * Read all collection JSON files from the data/collections directory
 */
export function getAllCollections(): Collection[] {
  if (!fs.existsSync(COLLECTIONS_DIRECTORY)) {
    return [];
  }

  const files = fs.readdirSync(COLLECTIONS_DIRECTORY);
  const collections: Collection[] = [];

  for (const file of files) {
    if (!file.endsWith(".json")) continue;

    const filePath = path.join(COLLECTIONS_DIRECTORY, file);
    const content = fs.readFileSync(filePath, "utf-8");

    try {
      const collection = JSON.parse(content) as Collection;
      collections.push(collection);
    } catch (error) {
      console.error(`Error parsing collection ${file}:`, error);
    }
  }

  // Sort by title alphabetically
  return collections.sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Get a collection by its slug
 */
export function getCollectionBySlug(slug: string): Collection | undefined {
  const collections = getAllCollections();
  return collections.find((c) => c.slug === slug);
}

/**
 * Get all collection slugs for static generation
 */
export function getAllCollectionSlugs(): string[] {
  return getAllCollections().map((c) => c.slug);
}

/**
 * Get tools for a collection
 */
export function getCollectionTools(collection: Collection): Tool[] {
  const allTools = getAllTools();
  const toolsById = new Map(allTools.map((t) => [t.id, t]));

  return collection.tools
    .map((id) => toolsById.get(id))
    .filter((t): t is Tool => t !== undefined);
}

/**
 * Author data prepared for spotlight component
 */
export interface AuthorForSpotlight {
  name: string;
  slug: string;
  picture?: string;
  toolCount: number;
  toolIds: string[];
  topTools: { id: string; name: string }[];
  socialLinks: {
    github?: string;
    linkedin?: string;
    x?: string;
  };
}

/**
 * Get authors prepared for the spotlight carousel.
 * Returns all authors with their tool data - sorting by impact is done client-side
 * after view counts are fetched.
 */
export function getAuthorsForSpotlight(): AuthorForSpotlight[] {
  const authors = getAllAuthors();

  return authors.map((author) => ({
    name: author.name,
    slug: author.slug,
    picture: author.picture,
    toolCount: author.tools.length,
    toolIds: author.tools.map((t) => t.id),
    topTools: author.tools.slice(0, 3).map((t) => ({ id: t.id, name: t.name })),
    socialLinks: {
      github: author.githubUrl,
      linkedin: author.linkedinUrl,
      x: author.xUrl,
    },
  }));
}
