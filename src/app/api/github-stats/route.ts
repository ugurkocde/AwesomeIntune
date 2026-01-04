import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { env } from "~/env";

export interface GitHubStats {
  stars: number;
  forks: number;
  openIssues: number;
  language: string | null;
  license: string | null;
  updatedAt: string;
}

interface GitHubRepoResponse {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  license: { spdx_id: string } | null;
  updated_at: string;
}

// Cache stats for 5 minutes to reduce API calls
const cache = new Map<string, { data: GitHubStats; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function extractRepoInfo(url: string): { owner: string; repo: string } | null {
  // Handle various GitHub URL formats:
  // https://github.com/owner/repo
  // https://github.com/owner/repo/
  // https://github.com/owner/repo/tree/main
  // https://github.com/owner/repo.git
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname !== "github.com") {
      return null;
    }

    const pathParts = urlObj.pathname.split("/").filter(Boolean);
    if (pathParts.length < 2) {
      return null;
    }

    const owner = pathParts[0];
    // Remove .git suffix if present
    const repo = pathParts[1]?.replace(/\.git$/, "");

    if (!owner || !repo) {
      return null;
    }

    return { owner, repo };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const repoUrl = searchParams.get("repoUrl");

    if (!repoUrl) {
      return NextResponse.json(
        { error: "repoUrl parameter is required" },
        { status: 400 }
      );
    }

    const repoInfo = extractRepoInfo(repoUrl);
    if (!repoInfo) {
      return NextResponse.json(
        { error: "Invalid GitHub repository URL" },
        { status: 400 }
      );
    }

    const cacheKey = `${repoInfo.owner}/${repoInfo.repo}`;

    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    // Fetch from GitHub API
    const response = await fetch(
      `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}`,
      {
        headers: {
          Authorization: `Bearer ${env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "AwesomeIntune",
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Repository not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Failed to fetch repository data" },
        { status: response.status }
      );
    }

    const data = (await response.json()) as GitHubRepoResponse;

    const stats: GitHubStats = {
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      language: data.language,
      license: data.license?.spdx_id ?? null,
      updatedAt: data.updated_at,
    };

    // Update cache
    cache.set(cacheKey, { data: stats, timestamp: Date.now() });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("GitHub stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
