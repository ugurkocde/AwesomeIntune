import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

export const runtime = "edge";

const CATEGORY_COLORS: Record<string, string> = {
  reporting: "#3b82f6",
  automation: "#10b981",
  packaging: "#f59e0b",
  troubleshooting: "#ef4444",
  security: "#8b5cf6",
  configuration: "#06b6d4",
  monitoring: "#ec4899",
  migration: "#84cc16",
  other: "#6b7280",
};

const TYPE_LABELS: Record<string, string> = {
  "powershell-module": "PowerShell Module",
  "powershell-script": "PowerShell Script",
  "web-app": "Web App",
  "desktop-app": "Desktop App",
  "browser-extension": "Browser Extension",
  "cli-tool": "CLI Tool",
  "api-wrapper": "API Wrapper",
  documentation: "Documentation",
  other: "Other",
};

const CATEGORY_LABELS: Record<string, string> = {
  reporting: "Reporting",
  automation: "Automation",
  packaging: "Packaging",
  troubleshooting: "Troubleshooting",
  security: "Security",
  configuration: "Configuration",
  monitoring: "Monitoring",
  migration: "Migration",
  other: "Other",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const title = searchParams.get("title") ?? "Awesome Intune";
  const category = searchParams.get("category") ?? "other";
  const type = searchParams.get("type") ?? "";
  const author = searchParams.get("author") ?? "";

  const categoryColor = CATEGORY_COLORS[category] ?? "#6b7280";
  const categoryLabel = CATEGORY_LABELS[category] ?? "Other";
  const typeLabel = TYPE_LABELS[type] ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          background: `linear-gradient(135deg, #0f172a 0%, #1e293b 50%, ${categoryColor}22 100%)`,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top section with branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: `linear-gradient(135deg, ${categoryColor}, ${categoryColor}99)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span
              style={{
                fontSize: "24px",
                fontWeight: 600,
                color: "#94a3b8",
              }}
            >
              Awesome Intune
            </span>
          </div>

          {/* Badges */}
          <div
            style={{
              display: "flex",
              gap: "12px",
            }}
          >
            <div
              style={{
                padding: "8px 20px",
                borderRadius: "9999px",
                background: `${categoryColor}33`,
                border: `2px solid ${categoryColor}`,
                color: categoryColor,
                fontSize: "18px",
                fontWeight: 600,
              }}
            >
              {categoryLabel}
            </div>
            {typeLabel && (
              <div
                style={{
                  padding: "8px 20px",
                  borderRadius: "9999px",
                  background: "rgba(148, 163, 184, 0.1)",
                  border: "2px solid #475569",
                  color: "#94a3b8",
                  fontSize: "18px",
                  fontWeight: 600,
                }}
              >
                {typeLabel}
              </div>
            )}
          </div>
        </div>

        {/* Center section with title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            textAlign: "center",
            gap: "24px",
          }}
        >
          <h1
            style={{
              fontSize: title.length > 30 ? "56px" : "72px",
              fontWeight: 700,
              color: "#f8fafc",
              margin: 0,
              lineHeight: 1.1,
              maxWidth: "900px",
              wordBreak: "break-word",
            }}
          >
            {title}
          </h1>
          {author && (
            <p
              style={{
                fontSize: "28px",
                color: "#64748b",
                margin: 0,
              }}
            >
              by {author}
            </p>
          )}
        </div>

        {/* Bottom section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "20px",
              color: "#475569",
            }}
          >
            awesomeintune.com
          </span>
          <span
            style={{
              fontSize: "18px",
              color: "#475569",
            }}
          >
            Community Tools Directory
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
