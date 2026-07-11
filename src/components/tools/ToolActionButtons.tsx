import type { Tool } from "~/types/tool";

interface ToolActionButtonsProps {
  tool: Tool;
}

type ActionKind = "download" | "website" | "repo";

const ICONS: Record<ActionKind, React.ReactNode> = {
  download: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  website: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  repo: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  ),
};

const LABELS: Record<ActionKind, string> = {
  download: "Download",
  website: "Visit Website",
  repo: "View on GitHub",
};

/**
 * Renders the tool's external links with a fixed hierarchy: exactly one filled
 * accent primary button (Download, else Website, else GitHub) and every other
 * link as an outlined secondary button.
 */
export function ToolActionButtons({ tool }: ToolActionButtonsProps) {
  const available: Array<{ kind: ActionKind; url: string }> = [];
  if (tool.downloadUrl) available.push({ kind: "download", url: tool.downloadUrl });
  if (tool.websiteUrl) available.push({ kind: "website", url: tool.websiteUrl });
  if (tool.repoUrl) available.push({ kind: "repo", url: tool.repoUrl });

  if (available.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {available.map((action, index) => (
        <a
          key={action.kind}
          href={action.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`btn ${index === 0 ? "btn-primary" : "btn-secondary"} w-full`}
        >
          {ICONS[action.kind]}
          {LABELS[action.kind]}
        </a>
      ))}
    </div>
  );
}
