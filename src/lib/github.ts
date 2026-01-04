import { env } from "~/env";
import type { ToolSubmissionData } from "~/lib/schemas/tool-submission";
import { deriveAvatarUrl } from "~/lib/schemas/tool-submission";
import { CATEGORY_CONFIG, TYPE_CONFIG } from "~/lib/constants";

const GITHUB_OWNER = "ugurkocde";
const GITHUB_REPO = "awesomeintune";

interface GitHubIssueResponse {
  number: number;
  html_url: string;
  id: number;
  title: string;
}

export async function createToolSubmissionIssue(
  data: Omit<ToolSubmissionData, "turnstileToken" | "acceptTerms">
): Promise<GitHubIssueResponse> {
  const categoryLabel = CATEGORY_CONFIG[data.category].label;
  const typeLabel = TYPE_CONFIG[data.type].label;

  // Derive avatar URL from GitHub profile if provided
  const avatarUrl = data.githubUrl ? deriveAvatarUrl(data.githubUrl) : null;

  // Build issue body in a structured format
  const body = `## Tool Submission

### Tool Information
- **Name:** ${data.name}
- **Description:** ${data.description}
- **Author:** ${data.author}
- **Repository URL:** ${data.repoUrl}
- **Category:** ${categoryLabel}
- **Type:** ${typeLabel}

### Author Links
${data.githubUrl ? `- **GitHub:** ${data.githubUrl}` : "- **GitHub:** Not provided"}
${avatarUrl ? `- **Avatar:** ${avatarUrl}` : ""}
${data.linkedinUrl ? `- **LinkedIn:** ${data.linkedinUrl}` : ""}
${data.xUrl ? `- **X/Twitter:** ${data.xUrl}` : ""}

### Optional URLs
${data.downloadUrl ? `- **Download URL:** ${data.downloadUrl}` : ""}
${data.websiteUrl ? `- **Website URL:** ${data.websiteUrl}` : ""}

${data.additionalInfo ? `### Additional Information\n${data.additionalInfo}` : ""}

---
*Submitted via the Awesome Intune website form*`;

  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        title: `[Tool Submission]: ${data.name}`,
        body,
        // Labels are optional - they'll be added if they exist in the repo
        labels: ["tool-submission"],
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create GitHub issue");
  }

  return response.json() as Promise<GitHubIssueResponse>;
}
