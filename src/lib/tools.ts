import type { Author, Tool, ToolCategory, ToolType } from "~/types/tool";

/**
 * Get normalized authors array from a tool.
 * Handles both legacy single-author fields and new authors array.
 */
export function getToolAuthors(tool: Tool): Author[] {
  if (tool.authors && tool.authors.length > 0) {
    return tool.authors;
  }

  return [
    {
      name: tool.author,
      picture: tool.authorPicture,
      githubUrl: tool.githubUrl,
      linkedinUrl: tool.linkedinUrl,
      xUrl: tool.xUrl,
    },
  ];
}

/**
 * Get tools filtered by category
 */
export function getToolsByCategory(
  tools: Tool[],
  category: ToolCategory
): Tool[] {
  return tools.filter((tool) => tool.category === category);
}

/**
 * Get tools filtered by type
 */
export function getToolsByType(tools: Tool[], type: ToolType): Tool[] {
  return tools.filter((tool) => tool.type === type);
}

/**
 * Search tools by query (searches name, description, and all authors)
 */
export function searchTools(tools: Tool[], query: string): Tool[] {
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) return tools;

  return tools.filter((tool) => {
    const authors = getToolAuthors(tool);
    const authorNames = authors.map((a) => a.name).join(" ");
    const searchableText = [tool.name, tool.description, authorNames]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}

/**
 * Filter tools by multiple criteria
 */
export function filterTools(
  tools: Tool[],
  options: {
    query?: string;
    category?: ToolCategory | null;
    type?: ToolType | null;
  }
): Tool[] {
  let filtered = [...tools];

  if (options.query) {
    filtered = searchTools(filtered, options.query);
  }

  if (options.category) {
    filtered = getToolsByCategory(filtered, options.category);
  }

  if (options.type) {
    filtered = getToolsByType(filtered, options.type);
  }

  return filtered;
}

/**
 * Get unique categories from tools
 */
export function getUniqueCategories(tools: Tool[]): ToolCategory[] {
  const categories = new Set<ToolCategory>();
  tools.forEach((tool) => categories.add(tool.category));
  return Array.from(categories);
}

/**
 * Get unique types from tools
 */
export function getUniqueTypes(tools: Tool[]): ToolType[] {
  const types = new Set<ToolType>();
  tools.forEach((tool) => types.add(tool.type));
  return Array.from(types);
}

/**
 * Get tool count statistics
 */
export function getToolStats(tools: Tool[]): {
  total: number;
  categories: number;
  types: number;
} {
  return {
    total: tools.length,
    categories: getUniqueCategories(tools).length,
    types: getUniqueTypes(tools).length,
  };
}

/**
 * Generate slug from author name
 * Used for linking to author profile pages
 */
export function generateAuthorSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
