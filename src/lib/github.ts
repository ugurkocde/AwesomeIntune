import { env } from "~/env";
import type { ToolSubmissionData } from "~/lib/schemas/tool-submission";
import { deriveAvatarUrl } from "~/lib/schemas/tool-submission";
import { CATEGORY_CONFIG, TYPE_CONFIG } from "~/lib/constants";
import type { ToolRequestData } from "~/lib/schemas/tool-request";

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

  // Format authors section
  const authorsSection = data.authors
    .map((author, index) => {
      const avatarUrl = author.githubUrl ? deriveAvatarUrl(author.githubUrl) : null;
      const lines = [
        `#### Author ${index + 1}: ${author.name}`,
        author.githubUrl ? `- **GitHub:** ${author.githubUrl}` : "",
        avatarUrl ? `- **Avatar:** ${avatarUrl}` : "",
        author.linkedinUrl ? `- **LinkedIn:** ${author.linkedinUrl}` : "",
        author.xUrl ? `- **X/Twitter:** ${author.xUrl}` : "",
      ].filter(Boolean);
      return lines.join("\n");
    })
    .join("\n\n");

  // Build issue body in a structured format
  const body = `## Tool Submission

### Tool Information
- **Name:** ${data.name}
- **Description:** ${data.description}
- **Repository URL:** ${data.repoUrl}
- **Category:** ${categoryLabel}
- **Type:** ${typeLabel}

### Authors
${authorsSection}

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

export async function createToolRequestIssue(
  data: Omit<ToolRequestData, "turnstileToken">
): Promise<GitHubIssueResponse> {
  const categoryLabel = data.category
    ? CATEGORY_CONFIG[data.category]?.label ?? data.category
    : "Uncategorized";

  // Build issue body in a structured format
  const body = `## Tool Request

### Request Details
- **Title:** ${data.title}
- **Category:** ${categoryLabel}

### Description
${data.description}

${data.use_case ? `### Use Case\n${data.use_case}` : ""}

${data.submitter_email ? `### Contact\n- **Email:** ${data.submitter_email}` : ""}

---
*Submitted via the Awesome Intune website tool request form*`;

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
        title: `[Tool Request]: ${data.title}`,
        body,
        labels: ["tool-request"],
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create GitHub issue");
  }

  return response.json() as Promise<GitHubIssueResponse>;
}
