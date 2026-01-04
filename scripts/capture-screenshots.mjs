#!/usr/bin/env node

/**
 * Screenshot Capture Script for Awesome Intune
 *
 * This script automatically captures screenshots for tools:
 * - Web apps: Takes live screenshots using Playwright
 * - Other tools: Extracts images from GitHub README files
 *
 * Uses OpenAI Vision to filter out logos/icons and keep only real product screenshots.
 *
 * Usage: node scripts/capture-screenshots.mjs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const TOOLS_DIR = path.join(ROOT_DIR, 'data', 'tools');
const SCREENSHOTS_DIR = path.join(ROOT_DIR, 'public', 'screenshots');

// OpenAI client for image analysis
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Track tools that need manual screenshots
const manualScreenshotsNeeded = [];

// Badge/shield patterns to skip
const BADGE_PATTERNS = [
  'shields.io',
  'badge',
  'img.shields.io',
  'github.com/.*/(badge|workflows)',
  'codecov.io',
  'travis-ci',
  'circleci',
  'github-readme-stats',
  '.svg',
  'buymeacoffee',
  'ko-fi',
  'paypal',
  // GitHub theme-specific images (light/dark mode logos)
  '#gh-dark-mode-only',
  '#gh-light-mode-only',
  // Icon CDNs and services
  'iconfinder.com',
  'flaticon.com',
  'icons8.com',
  'iconscout.com',
  'fontawesome.com',
  'cdn.jsdelivr.net',
  // Common service logos in READMEs
  'slack_logo',
  'slack-logo',
  '/slack',
  'discord_logo',
  'discord-logo',
  '/discord',
  'twitter_logo',
  'twitter-logo',
  'linkedin_logo',
  'linkedin-logo',
  'youtube_logo',
  'youtube-logo',
  'logos-and-brands',
  'social-media',
  '/icon',
  '/logo',
];

/**
 * Analyze an image using OpenAI Vision to determine if it's a real product screenshot
 * Returns: { isProductScreenshot: boolean, reason: string }
 */
async function analyzeImageWithAI(imagePath) {
  if (!openai) {
    console.log('    OpenAI not configured, skipping AI analysis');
    return { isProductScreenshot: true, reason: 'AI analysis skipped (no API key)' };
  }

  try {
    // Read the image and convert to base64
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

    const response = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      max_completion_tokens: 500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this image and determine if it's a real product screenshot (showing a software UI, application interface, dashboard, terminal output, or tool in action) or if it's just a logo, icon, badge, company branding, or decorative graphic.

Respond with ONLY a JSON object in this exact format:
{"isProductScreenshot": true/false, "reason": "brief explanation"}

Examples of product screenshots: application windows, web interfaces, command-line output, configuration screens, dashboards.
Examples of non-product images: company logos, app icons, badges, shields, social media icons, decorative banners, brand graphics.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content || '';

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const result = JSON.parse(jsonMatch[0]);
        return {
          isProductScreenshot: Boolean(result.isProductScreenshot),
          reason: result.reason || 'No reason provided',
        };
      } catch {
        // JSON parse failed, try to interpret the response
      }
    }

    // Fallback: look for keywords in the response
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('logo') || lowerContent.includes('icon') || lowerContent.includes('badge') || lowerContent.includes('brand')) {
      if (lowerContent.includes('not a') || lowerContent.includes('false') || lowerContent.includes('no,')) {
        return { isProductScreenshot: false, reason: 'AI detected logo/icon/badge' };
      }
    }
    if (lowerContent.includes('screenshot') || lowerContent.includes('interface') || lowerContent.includes('dashboard') || lowerContent.includes('ui')) {
      if (lowerContent.includes('true') || lowerContent.includes('yes') || lowerContent.includes('is a')) {
        return { isProductScreenshot: true, reason: 'AI detected product screenshot' };
      }
    }

    // Default to accepting if we can't determine
    return { isProductScreenshot: true, reason: 'Could not parse AI response, keeping image' };
  } catch (error) {
    console.log(`    AI analysis error: ${error.message}`);
    return { isProductScreenshot: true, reason: `AI error: ${error.message}` };
  }
}

/**
 * Read all tool JSON files
 */
async function readAllTools() {
  const files = await fs.readdir(TOOLS_DIR);
  const tools = [];

  for (const file of files) {
    if (file.endsWith('.json') && file !== 'template.json') {
      const content = await fs.readFile(path.join(TOOLS_DIR, file), 'utf-8');
      const tool = JSON.parse(content);
      tool._filename = file;
      tools.push(tool);
    }
  }

  return tools;
}

/**
 * Save updated tool JSON
 */
async function saveTool(tool) {
  const { _filename, ...toolData } = tool;
  await fs.writeFile(
    path.join(TOOLS_DIR, _filename),
    JSON.stringify(toolData, null, 2) + '\n',
    'utf-8'
  );
}

/**
 * Ensure screenshots directory exists for a tool
 */
async function ensureScreenshotDir(toolId) {
  const dir = path.join(SCREENSHOTS_DIR, toolId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

/**
 * Check if tool already has screenshots in the filesystem
 */
async function hasExistingScreenshots(toolId) {
  const dir = path.join(SCREENSHOTS_DIR, toolId);
  try {
    const files = await fs.readdir(dir);
    const imageFiles = files.filter(f =>
      /\.(png|jpg|jpeg|gif|webp)$/i.test(f)
    );
    return imageFiles.length > 0;
  } catch {
    return false;
  }
}

/**
 * Get screenshot paths for a tool from the filesystem
 */
async function getScreenshotsForTool(toolId) {
  const dir = path.join(SCREENSHOTS_DIR, toolId);
  try {
    const files = await fs.readdir(dir);
    const imageFiles = files
      .filter(f => /\.(png|jpg|jpeg|gif|webp)$/i.test(f))
      .sort();
    return imageFiles.map(f => `screenshots/${toolId}/${f}`);
  } catch {
    return [];
  }
}

/**
 * Detect if page content indicates bot protection (Cloudflare, etc.)
 */
function detectBotProtection(pageContent, pageTitle) {
  const protectionIndicators = [
    // Cloudflare
    'just a moment',
    'checking your browser',
    'enable javascript and cookies',
    'ray id',
    'cloudflare',
    'cf-browser-verification',
    'challenge-platform',
    // Other bot protection
    'captcha',
    'robot check',
    'are you a robot',
    'verify you are human',
    'ddos protection',
    'access denied',
    'please wait while we verify',
  ];

  const lowerContent = (pageContent + ' ' + pageTitle).toLowerCase();

  for (const indicator of protectionIndicators) {
    if (lowerContent.includes(indicator)) {
      return indicator;
    }
  }

  return null;
}

/**
 * Check if URL matches badge patterns
 */
function isBadgeUrl(url) {
  const lowerUrl = url.toLowerCase();
  return BADGE_PATTERNS.some(pattern => {
    if (pattern.includes('.*')) {
      return new RegExp(pattern, 'i').test(lowerUrl);
    }
    return lowerUrl.includes(pattern);
  });
}

/**
 * Extract image URLs from markdown content
 */
function extractImagesFromMarkdown(markdown) {
  const images = [];

  // Match ![alt](url) pattern
  const mdPattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  while ((match = mdPattern.exec(markdown)) !== null) {
    const url = match[2].split(' ')[0]; // Remove title if present
    if (!isBadgeUrl(url)) {
      images.push(url);
    }
  }

  // Match <img src="url"> pattern
  const htmlPattern = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  while ((match = htmlPattern.exec(markdown)) !== null) {
    const url = match[1];
    if (!isBadgeUrl(url)) {
      images.push(url);
    }
  }

  return [...new Set(images)]; // Remove duplicates
}

/**
 * Resolve relative image URLs to absolute
 */
function resolveImageUrl(imageUrl, repoUrl, branch = 'main', subdir = '') {
  // Handle absolute URLs
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    // Convert GitHub blob URLs to raw URLs
    // From: https://github.com/{owner}/{repo}/blob/{branch}/{path}
    // To: https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}
    const blobMatch = imageUrl.match(
      /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/
    );
    if (blobMatch) {
      const [, owner, repo, urlBranch, filePath] = blobMatch;
      return `https://raw.githubusercontent.com/${owner}/${repo}/${urlBranch}/${filePath}`;
    }
    return imageUrl;
  }

  // Extract owner/repo from GitHub URL
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;

  const [, owner, repo] = match;
  const cleanRepo = repo.replace(/\.git$/, '');

  // Handle relative paths - prepend subdir if present
  const cleanPath = imageUrl.replace(/^\.?\/?/, '');
  const fullPath = subdir ? `${subdir}/${cleanPath}` : cleanPath;
  return `https://raw.githubusercontent.com/${owner}/${cleanRepo}/${branch}/${fullPath}`;
}

/**
 * Download an image to the screenshots directory
 * Analyzes with AI to filter out logos/icons
 */
async function downloadImage(url, destPath, skipAIAnalysis = false) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`    Failed to download: ${url} (${response.status})`);
      return false;
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // Check if it's actually an image (basic check)
    if (buffer.length < 1000) {
      console.log(`    Skipping small file (likely not an image): ${url}`);
      return false;
    }

    await fs.writeFile(destPath, buffer);

    // Analyze with AI to check if it's a real product screenshot
    if (!skipAIAnalysis) {
      console.log(`    Analyzing image with AI...`);
      const analysis = await analyzeImageWithAI(destPath);

      if (!analysis.isProductScreenshot) {
        console.log(`    Rejected: ${analysis.reason}`);
        // Delete the file since it's not a product screenshot
        await fs.unlink(destPath);
        return false;
      }
      console.log(`    Accepted: ${analysis.reason}`);
    }

    return true;
  } catch (error) {
    console.log(`    Error downloading ${url}: ${error.message}`);
    return false;
  }
}

/**
 * Get file extension from URL or content type
 */
function getExtension(url) {
  const urlPath = new URL(url).pathname;
  const ext = path.extname(urlPath).toLowerCase();
  if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) {
    return ext;
  }
  return '.png'; // Default
}

/**
 * Fetch README from GitHub repository
 * Handles both root repos and subdirectory URLs like:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo/tree/branch/path/to/folder
 * Returns: { content: string, branch: string, subdir: string } | null
 */
async function fetchReadme(repoUrl) {
  // Match subdirectory URLs: github.com/owner/repo/tree/branch/path/to/folder
  const subdirMatch = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)\/(.+)/);

  // Match root repo URLs: github.com/owner/repo
  const rootMatch = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);

  if (!rootMatch) return null;

  const owner = rootMatch[1];
  const repo = rootMatch[2].replace(/\.git$/, '');

  // If it's a subdirectory URL, extract the branch and path
  let subdir = '';
  let branchesFromUrl = [];

  if (subdirMatch) {
    branchesFromUrl = [subdirMatch[3]]; // Use the branch from the URL
    subdir = subdirMatch[4];
  }

  // Try branches: first from URL if available, then common defaults
  const branches = [...branchesFromUrl, 'main', 'master'];
  const readmeNames = ['README.md', 'readme.md', 'Readme.md', 'README.MD'];

  for (const branch of branches) {
    for (const readmeName of readmeNames) {
      const pathPrefix = subdir ? `${subdir}/` : '';
      const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${pathPrefix}${readmeName}`;
      try {
        const response = await fetch(url);
        if (response.ok) {
          return { content: await response.text(), branch, subdir };
        }
      } catch {
        continue;
      }
    }
  }

  return null;
}

/**
 * Capture screenshot of a web app using Playwright
 * Returns: { screenshots: string[], blocked: boolean, reason?: string }
 */
async function captureWebAppScreenshot(tool) {
  if (!tool.websiteUrl) {
    console.log(`  No websiteUrl for ${tool.name}, skipping...`);
    return { screenshots: [], blocked: false };
  }

  console.log(`  Capturing screenshot of ${tool.websiteUrl}...`);

  let browser;
  try {
    // Dynamic import of Playwright
    const { chromium } = await import('playwright');

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    await page.goto(tool.websiteUrl, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Wait a bit for any animations to settle
    await page.waitForTimeout(2000);

    // Check for bot protection
    const pageContent = await page.content();
    const pageTitle = await page.title();
    const protectionDetected = detectBotProtection(pageContent, pageTitle);

    if (protectionDetected) {
      console.log(`  Bot protection detected: "${protectionDetected}"`);
      await browser.close();
      return {
        screenshots: [],
        blocked: true,
        reason: `Bot protection detected (${protectionDetected})`,
      };
    }

    const screenshotDir = await ensureScreenshotDir(tool.id);
    const screenshotPath = path.join(screenshotDir, 'screenshot-1.png');

    await page.screenshot({ path: screenshotPath, fullPage: false });
    await browser.close();

    console.log(`  Saved screenshot to ${screenshotPath}`);
    return { screenshots: [`screenshots/${tool.id}/screenshot-1.png`], blocked: false };
  } catch (error) {
    if (browser) await browser.close();
    console.log(`  Failed to capture screenshot: ${error.message}`);
    return {
      screenshots: [],
      blocked: true,
      reason: `Error: ${error.message}`,
    };
  }
}

/**
 * Extract screenshots from GitHub README
 */
async function extractReadmeScreenshots(tool) {
  if (!tool.repoUrl) {
    console.log(`  No repoUrl for ${tool.name}, skipping...`);
    return [];
  }

  console.log(`  Fetching README from ${tool.repoUrl}...`);

  const result = await fetchReadme(tool.repoUrl);
  if (!result) {
    console.log(`  Could not fetch README`);
    return [];
  }

  const { content: readme, branch, subdir } = result;
  console.log(`  Found README on branch: ${branch}${subdir ? ` (subdir: ${subdir})` : ''}`);

  const imageUrls = extractImagesFromMarkdown(readme);
  console.log(`  Found ${imageUrls.length} images in README`);

  if (imageUrls.length === 0) {
    return [];
  }

  const screenshotDir = await ensureScreenshotDir(tool.id);
  const screenshots = [];
  let count = 0;

  // Download up to 5 images - use temp prefix to avoid overwriting website screenshots
  for (const imageUrl of imageUrls.slice(0, 5)) {
    const resolvedUrl = resolveImageUrl(imageUrl, tool.repoUrl, branch, subdir);
    if (!resolvedUrl) continue;

    count++;
    const ext = getExtension(resolvedUrl);
    // Use readme-temp prefix to avoid conflicts with website screenshots
    const filename = `readme-temp-${count}${ext}`;
    const destPath = path.join(screenshotDir, filename);

    console.log(`  Downloading image ${count}: ${resolvedUrl}`);
    const success = await downloadImage(resolvedUrl, destPath);

    if (success) {
      screenshots.push(`screenshots/${tool.id}/${filename}`);
    }
  }

  return screenshots;
}

/**
 * Process a single tool
 * Returns: { count: number, skipped: boolean }
 */
async function processTool(tool) {
  console.log(`\nProcessing: ${tool.name} (${tool.type})`);

  // Check if screenshots already exist in filesystem
  const hasScreenshots = await hasExistingScreenshots(tool.id);
  if (hasScreenshots) {
    // Screenshots exist in filesystem - check if JSON needs updating
    const existingScreenshots = await getScreenshotsForTool(tool.id);
    if (!tool.screenshots || tool.screenshots.length === 0) {
      // JSON doesn't have screenshots array - update it
      console.log(`  Screenshots exist but not in JSON, updating...`);
      tool.screenshots = existingScreenshots;
      await saveTool(tool);
      console.log(`  Updated ${tool._filename} with ${existingScreenshots.length} screenshots`);
    } else {
      console.log(`  Screenshots already exist, skipping...`);
    }
    return { count: 0, skipped: true };
  }

  let screenshots = [];
  let websiteBlocked = false;
  let readmeEmpty = false;

  // Try to capture website screenshot if websiteUrl exists
  if (tool.websiteUrl) {
    const result = await captureWebAppScreenshot(tool);
    screenshots = [...screenshots, ...result.screenshots];

    if (result.blocked) {
      websiteBlocked = true;
      console.log(`  Website screenshot blocked: ${result.reason}`);
    }
  }

  // Also try to extract images from README if repoUrl exists
  if (tool.repoUrl) {
    const readmeScreenshots = await extractReadmeScreenshots(tool);

    // Rename README temp screenshots to proper screenshot-N format
    if (readmeScreenshots.length > 0) {
      const renumberedScreenshots = [];
      for (let i = 0; i < readmeScreenshots.length; i++) {
        const oldPath = readmeScreenshots[i];
        // Calculate new number: website screenshots count + position + 1
        const newNum = screenshots.length + i + 1;
        const ext = path.extname(oldPath);
        const dir = path.dirname(oldPath);
        const newPath = `${dir}/screenshot-${newNum}${ext}`;

        // Rename from readme-temp-N to screenshot-N
        const oldFullPath = path.join(ROOT_DIR, 'public', oldPath);
        const newFullPath = path.join(ROOT_DIR, 'public', newPath);
        try {
          await fs.rename(oldFullPath, newFullPath);
          console.log(`  Renamed ${path.basename(oldPath)} -> ${path.basename(newPath)}`);
          renumberedScreenshots.push(newPath);
        } catch (error) {
          console.log(`  Failed to rename ${oldPath}: ${error.message}`);
          // Keep the temp file as fallback
          renumberedScreenshots.push(oldPath);
        }
      }
      screenshots = [...screenshots, ...renumberedScreenshots];
    }

    if (readmeScreenshots.length === 0) {
      readmeEmpty = true;
    }
  }

  // Track tools that need manual screenshots
  if (screenshots.length === 0) {
    if (!tool.websiteUrl && !tool.repoUrl) {
      console.log(`  No source for screenshots, skipping...`);
      manualScreenshotsNeeded.push({
        name: tool.name,
        id: tool.id,
        url: tool.downloadUrl || 'N/A',
        reason: 'No repoUrl or websiteUrl available',
      });
    } else {
      const reasons = [];
      if (tool.websiteUrl && websiteBlocked) reasons.push('Website blocked');
      if (tool.repoUrl && readmeEmpty) reasons.push('No images in README');

      manualScreenshotsNeeded.push({
        name: tool.name,
        id: tool.id,
        url: tool.websiteUrl || tool.repoUrl,
        reason: reasons.join('; ') || 'Could not capture screenshots',
      });
    }
  }

  if (screenshots.length > 0) {
    tool.screenshots = screenshots;
    await saveTool(tool);
    console.log(`  Updated ${tool._filename} with ${screenshots.length} screenshots`);
  }

  return { count: screenshots.length, skipped: false };
}

/**
 * Main entry point
 */
async function main() {
  console.log('Screenshot Capture Script for Awesome Intune');
  console.log('============================================\n');

  // Check OpenAI configuration
  if (openai) {
    console.log('OpenAI API configured - AI image filtering enabled');
    console.log('Images will be analyzed to filter out logos/icons\n');
  } else {
    console.log('WARNING: OPENAI_API_KEY not set - AI image filtering disabled');
    console.log('All downloaded images will be kept without analysis\n');
  }

  // Ensure screenshots directory exists
  await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });

  const tools = await readAllTools();
  console.log(`Found ${tools.length} tools to process\n`);

  let totalScreenshots = 0;
  let toolsWithScreenshots = 0;
  let toolsSkipped = 0;

  for (const tool of tools) {
    const result = await processTool(tool);
    totalScreenshots += result.count;
    if (result.count > 0) toolsWithScreenshots++;
    if (result.skipped) toolsSkipped++;
  }

  console.log('\n============================================');
  console.log('SUMMARY');
  console.log('============================================');
  console.log(`Total tools: ${tools.length}`);
  console.log(`Screenshots captured: ${totalScreenshots} for ${toolsWithScreenshots} tools`);
  console.log(`Skipped (already have screenshots): ${toolsSkipped}`);

  if (manualScreenshotsNeeded.length > 0) {
    console.log(`\n============================================`);
    console.log(`MANUAL SCREENSHOTS NEEDED (${manualScreenshotsNeeded.length} tools)`);
    console.log(`============================================`);
    console.log(`These tools need manual screenshots added to public/screenshots/{tool-id}/:\n`);

    for (const tool of manualScreenshotsNeeded) {
      console.log(`- ${tool.name}`);
      console.log(`  ID: ${tool.id}`);
      console.log(`  URL: ${tool.url}`);
      console.log(`  Reason: ${tool.reason}`);
      console.log('');
    }

    // Also write to a JSON file for easy reference
    const reportPath = path.join(ROOT_DIR, 'manual-screenshots-needed.json');
    await fs.writeFile(
      reportPath,
      JSON.stringify(manualScreenshotsNeeded, null, 2) + '\n',
      'utf-8'
    );
    console.log(`Report saved to: ${reportPath}`);
  } else {
    console.log(`\nAll tools have screenshots!`);
  }
}

main().catch(console.error);
