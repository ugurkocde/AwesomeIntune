import fs from "fs";
import path from "path";
import type { Tool } from "~/types/tool";

const TOOLS_DIRECTORY = path.join(process.cwd(), "data", "tools");

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
 * Get unique authors count
 */
export function getUniqueAuthorsCount(tools: Tool[]): number {
  const authors = new Set<string>();
  tools.forEach((tool) => authors.add(tool.author.toLowerCase()));
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
