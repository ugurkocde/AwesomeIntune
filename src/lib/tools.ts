import type { Author, Tool, ToolCategory, ToolType } from "~/types/tool";

/**
 * Get the public URL slug for a tool while keeping its internal ID stable.
 */
export function getToolSlug(tool: Tool): string {
  return tool.slug ?? tool.id;
}

/**
 * Whether a tool's source genuinely passed every automated security check.
 *
 * Single source of truth for the "verified" count (trust strip, stats). Honest
 * and conservative: prefers the explicit `status` when present, otherwise derives
 * from older records, and never counts a `filesScanned: 0` record (which the old
 * pipeline could fail open into a fake 6/6) or a maintainer force-approval.
 */
export function isVerified(tool: Tool): boolean {
  const s = tool.securityCheck;
  if (!s) return false;
  if (s.status) return s.status === "passed";
  return s.filesScanned > 0 && !s.forceApproved && s.passed === s.total;
}

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

/** Minimum token length before typo-tolerant matching kicks in */
const FUZZY_MIN_TOKEN_LENGTH = 5;

/**
 * Bounded Levenshtein check: true when a and b are within edit distance 1.
 * Single pass with early exit - no matrix allocation, O(len).
 */
function isWithinEditDistance1(a: string, b: string): boolean {
  if (a === b) return true;
  const lengthDiff = a.length - b.length;
  if (lengthDiff > 1 || lengthDiff < -1) return false;

  const shorter = lengthDiff < 0 ? a : b;
  const longer = lengthDiff < 0 ? b : a;
  let i = 0;
  let j = 0;
  let edited = false;

  while (i < shorter.length && j < longer.length) {
    if (shorter[i] === longer[j]) {
      i++;
      j++;
      continue;
    }
    if (edited) return false;
    edited = true;
    // Same length: substitution (skip both). Different length: insertion in
    // the longer string (skip only the longer index).
    if (shorter.length === longer.length) i++;
    j++;
  }

  return true;
}

/**
 * Search tools by query.
 *
 * Matches over name, description, authors, keywords, category, type, and
 * worksWith tags. The query is tokenized on whitespace and a tool matches only
 * when every token matches at least one field, so non-adjacent terms like
 * "policy backup" still hit. Tokens of 5+ characters also match words in the
 * tool name or keywords within Levenshtein distance 1 (light typo tolerance).
 * Tools matched purely by substring rank before fuzzy-only matches; original
 * order is preserved within each tier.
 */
export function searchTools(tools: Tool[], query: string): Tool[] {
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) return tools;

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const exactMatches: Tool[] = [];
  const fuzzyMatches: Tool[] = [];

  for (const tool of tools) {
    const authors = getToolAuthors(tool);
    const searchableText = [
      tool.name,
      tool.description,
      authors.map((a) => a.name).join(" "),
      tool.keywords?.join(" ") ?? "",
      tool.category,
      tool.type,
      tool.worksWith?.join(" ") ?? "",
    ]
      .join(" ")
      .toLowerCase();

    let fuzzyWords: string[] | null = null;
    let usedFuzzy = false;
    let matchesAllTokens = true;

    for (const token of tokens) {
      if (searchableText.includes(token)) continue;

      if (token.length < FUZZY_MIN_TOKEN_LENGTH) {
        matchesAllTokens = false;
        break;
      }

      // Typo tolerance only against words in the name and keywords
      fuzzyWords ??= [tool.name, tool.keywords?.join(" ") ?? ""]
        .join(" ")
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(Boolean);

      if (!fuzzyWords.some((word) => isWithinEditDistance1(token, word))) {
        matchesAllTokens = false;
        break;
      }
      usedFuzzy = true;
    }

    if (!matchesAllTokens) continue;
    if (usedFuzzy) {
      fuzzyMatches.push(tool);
    } else {
      exactMatches.push(tool);
    }
  }

  return [...exactMatches, ...fuzzyMatches];
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
