import { readdir, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOOLS_DIR = join(__dirname, "..", "data", "tools");
const TYPES_FILE = join(__dirname, "..", "src", "types", "tool.ts");

// Derive the allowed vocabularies from the single source of truth in
// src/types/tool.ts instead of duplicating them here.
async function readUnion(source, name) {
  const match = source.match(
    new RegExp(`export type ${name}\\s*=([\\s\\S]*?);`)
  );
  if (!match) throw new Error(`Could not find union type ${name}`);
  const values = [...match[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  if (!values.length) throw new Error(`Union type ${name} has no values`);
  return new Set(values);
}

const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPublicUrl(value) {
  if (!isNonEmptyString(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

function isRealDate(value) {
  if (!DATE_PATTERN.test(value)) return false;
  // Date.UTC rolls impossible days over (2025-02-30 becomes 2025-03-02), so
  // compare the components back to reject calendar-impossible dates.
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

const URL_FIELDS = [
  "repoUrl",
  "downloadUrl",
  "websiteUrl",
  "githubUrl",
  "linkedinUrl",
  "xUrl",
];

// Every securityCheck must carry all six named checks. A missing item would
// make SecurityChecklist render undefined on the tool page.
const SECURITY_CHECK_KEYS = [
  "noObfuscatedCode",
  "noRemoteExecution",
  "noCredentialTheft",
  "noDataExfiltration",
  "noMaliciousPatterns",
  "noHardcodedSecrets",
];

function isRootRelativePath(value) {
  return (
    isNonEmptyString(value) &&
    value.startsWith("/") &&
    !value.includes("..")
  );
}

// Returns every problem found in one tool so a single run reports them all.
function validateTool(tool, file, vocab) {
  const errors = [];
  const fail = (message) => errors.push(message);

  for (const field of ["id", "name", "description", "author"]) {
    if (!isNonEmptyString(tool[field])) fail(`${field} is required`);
  }

  if (isNonEmptyString(tool.id) && !ID_PATTERN.test(tool.id)) {
    fail(`id "${tool.id}" is not a valid identifier`);
  }

  if (isNonEmptyString(tool.id) && file !== `${tool.id}.json`) {
    fail(`filename must match id (${tool.id}.json)`);
  }

  if (isNonEmptyString(tool.slug) && !ID_PATTERN.test(tool.slug)) {
    fail(`slug "${tool.slug}" is not a valid identifier`);
  }

  if (!vocab.categories.has(tool.category)) {
    fail(`category "${tool.category}" is not a known category`);
  }

  if (!vocab.types.has(tool.type)) {
    fail(`type "${tool.type}" is not a known type`);
  }

  if (!isNonEmptyString(tool.dateAdded) || !isRealDate(tool.dateAdded)) {
    fail(`dateAdded "${tool.dateAdded}" must be a real YYYY-MM-DD date`);
  }

  if (tool.keywords !== undefined) {
    if (
      !Array.isArray(tool.keywords) ||
      !tool.keywords.every(isNonEmptyString)
    ) {
      fail("keywords must be an array of non-empty strings");
    }
  }

  if (tool.worksWith !== undefined) {
    if (!Array.isArray(tool.worksWith)) {
      fail("worksWith must be an array");
    } else {
      for (const tag of tool.worksWith) {
        if (!vocab.worksWith.has(tag)) {
          fail(`worksWith tag "${tag}" is not a known tag`);
        }
      }
    }
  }

  if (tool.authors !== undefined) {
    if (!Array.isArray(tool.authors) || tool.authors.length === 0) {
      fail("authors must be a non-empty array when present");
    } else if (tool.authors.some((author) => !isNonEmptyString(author?.name))) {
      fail("every author needs a name");
    }
  }

  if (tool.screenshots !== undefined) {
    // Screenshots are repo-relative under public/screenshots and served
    // through /api/screenshots/.
    if (
      !Array.isArray(tool.screenshots) ||
      !tool.screenshots.every(
        (src) =>
          isNonEmptyString(src) &&
          src.startsWith("screenshots/") &&
          !src.startsWith("/") &&
          !src.includes("..")
      )
    ) {
      fail("screenshots must be an array of screenshots/... paths");
    }
  }

  if (tool.authorPicture !== undefined && tool.authorPicture !== "") {
    if (!isPublicUrl(tool.authorPicture) && !isRootRelativePath(tool.authorPicture)) {
      fail("authorPicture must be an https URL or a root-relative path");
    }
  }

  for (const field of URL_FIELDS) {
    const value = tool[field];
    // Empty strings are the documented way to omit these optional fields.
    if (value === undefined || value === "") continue;
    if (!isPublicUrl(value)) {
      fail(`${field} must be an absolute https URL when set`);
    }
  }

  if (tool.securityCheck !== undefined) {
    const security = tool.securityCheck;
    if (typeof security !== "object" || security === null) {
      fail("securityCheck must be an object");
    } else {
      for (const field of ["passed", "total", "filesScanned"]) {
        if (typeof security[field] !== "number") {
          fail(`securityCheck.${field} must be a number`);
        }
      }
      if (!isNonEmptyString(security.lastChecked)) {
        fail("securityCheck.lastChecked is required");
      }
      if (typeof security.forceApproved !== "boolean") {
        fail("securityCheck.forceApproved must be a boolean");
      }
      if (typeof security.checks !== "object" || security.checks === null) {
        fail("securityCheck.checks is required");
      } else {
        for (const key of SECURITY_CHECK_KEYS) {
          const item = security.checks[key];
          if (
            typeof item !== "object" ||
            item === null ||
            typeof item.passed !== "boolean"
          ) {
            fail(`securityCheck.checks.${key}.passed must be a boolean`);
          }
        }
      }
    }
  }

  return errors;
}

async function main() {
  const typeSource = await readFile(TYPES_FILE, "utf8");
  const vocab = {
    categories: await readUnion(typeSource, "ToolCategory"),
    types: await readUnion(typeSource, "ToolType"),
    worksWith: await readUnion(typeSource, "WorksWithTag"),
  };

  const files = (await readdir(TOOLS_DIR)).filter(
    (file) => file.endsWith(".json") && file !== "template.json"
  );

  if (!files.length) {
    throw new Error("No tool files found in data/tools");
  }

  const errors = [];
  const seenIds = new Map();
  const seenSlugs = new Map();

  for (const file of files) {
    let tool;
    try {
      tool = JSON.parse(await readFile(join(TOOLS_DIR, file), "utf8"));
    } catch (error) {
      errors.push(`${file}: invalid JSON (${error.message})`);
      continue;
    }

    if (typeof tool !== "object" || tool === null || Array.isArray(tool)) {
      errors.push(`${file}: root must be a JSON object`);
      continue;
    }

    for (const message of validateTool(tool, file, vocab)) {
      errors.push(`${file}: ${message}`);
    }

    if (isNonEmptyString(tool.id)) {
      if (seenIds.has(tool.id)) {
        errors.push(`${file}: duplicate id "${tool.id}" (also in ${seenIds.get(tool.id)})`);
      } else {
        seenIds.set(tool.id, file);
      }
    }

    if (isNonEmptyString(tool.slug)) {
      if (seenSlugs.has(tool.slug)) {
        errors.push(`${file}: duplicate slug "${tool.slug}" (also in ${seenSlugs.get(tool.slug)})`);
      } else {
        seenSlugs.set(tool.slug, file);
      }
    }
  }

  if (errors.length) {
    console.error(`Catalog validation failed with ${errors.length} problem(s):\n`);
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(`Validated ${files.length} tool files.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
