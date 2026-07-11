/**
 * Optimize tool screenshots in public/screenshots/.
 *
 * - PNG/JPEG: resized to max 1600px wide and converted to WebP.
 * - GIF: resized to max 1200px wide and converted to animated WebP.
 * - The converted file replaces the original only when it is smaller.
 * - References in data/tools/*.json are updated to the new file names.
 *
 * Usage: node scripts/optimize-screenshots.mjs
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const ROOT_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SCREENSHOTS_DIR = path.join(ROOT_DIR, "public", "screenshots");
const TOOLS_DIR = path.join(ROOT_DIR, "data", "tools");

const STATIC_MAX_WIDTH = 1600;
const ANIMATED_MAX_WIDTH = 1200;

async function optimizeFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (![".png", ".jpg", ".jpeg", ".gif"].includes(ext)) return null;

  const originalSize = (await fs.stat(filePath)).size;
  const isGif = ext === ".gif";
  const outPath = filePath.slice(0, -ext.length) + ".webp";

  try {
    const image = sharp(filePath, { animated: isGif, limitInputPixels: false });
    const metadata = await image.metadata();
    const maxWidth = isGif ? ANIMATED_MAX_WIDTH : STATIC_MAX_WIDTH;

    let pipeline = image;
    if ((metadata.width ?? 0) > maxWidth) {
      pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
    }
    const buffer = await pipeline
      .webp({ quality: isGif ? 75 : 82, effort: 4 })
      .toBuffer();

    if (buffer.length >= originalSize) {
      return { filePath, skipped: true, originalSize, newSize: originalSize };
    }

    await fs.writeFile(outPath, buffer);
    await fs.unlink(filePath);
    return {
      filePath,
      outPath,
      skipped: false,
      originalSize,
      newSize: buffer.length,
    };
  } catch (error) {
    console.error(`  Failed to optimize ${filePath}: ${error.message}`);
    return null;
  }
}

async function updateToolReferences(renames) {
  if (renames.size === 0) return 0;
  const files = (await fs.readdir(TOOLS_DIR)).filter((f) =>
    f.endsWith(".json"),
  );
  let updatedCount = 0;

  for (const file of files) {
    const toolPath = path.join(TOOLS_DIR, file);
    const raw = await fs.readFile(toolPath, "utf8");
    const tool = JSON.parse(raw);
    if (!Array.isArray(tool.screenshots)) continue;

    let changed = false;
    tool.screenshots = tool.screenshots.map((ref) => {
      if (renames.has(ref)) {
        changed = true;
        return renames.get(ref);
      }
      return ref;
    });

    if (changed) {
      await fs.writeFile(toolPath, JSON.stringify(tool, null, 2) + "\n");
      updatedCount += 1;
    }
  }
  return updatedCount;
}

async function main() {
  const toolDirs = await fs.readdir(SCREENSHOTS_DIR);
  const renames = new Map();
  let totalBefore = 0;
  let totalAfter = 0;
  let converted = 0;

  for (const toolId of toolDirs) {
    const dir = path.join(SCREENSHOTS_DIR, toolId);
    const stat = await fs.stat(dir);
    if (!stat.isDirectory()) continue;

    const files = await fs.readdir(dir);
    for (const file of files) {
      const result = await optimizeFile(path.join(dir, file));
      if (!result) continue;
      totalBefore += result.originalSize;
      totalAfter += result.newSize;
      if (!result.skipped) {
        converted += 1;
        const oldRef = `screenshots/${toolId}/${file}`;
        const newRef = `screenshots/${toolId}/${path.basename(result.outPath)}`;
        renames.set(oldRef, newRef);
        console.log(
          `  ${oldRef}: ${(result.originalSize / 1024).toFixed(0)}KB -> ${(result.newSize / 1024).toFixed(0)}KB`,
        );
      }
    }
  }

  const updatedTools = await updateToolReferences(renames);
  console.log(
    `\nConverted ${converted} files: ${(totalBefore / 1024 / 1024).toFixed(1)}MB -> ${(totalAfter / 1024 / 1024).toFixed(1)}MB`,
  );
  console.log(`Updated screenshot references in ${updatedTools} tool files.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
