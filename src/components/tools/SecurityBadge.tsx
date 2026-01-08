"use client";

import type { SecurityCheck } from "~/types/tool";

interface SecurityBadgeProps {
  securityCheck?: SecurityCheck;
  variant?: "compact" | "full";
  showTooltip?: boolean;
}

export function SecurityBadge({
  securityCheck,
  variant = "compact",
  showTooltip = true,
}: SecurityBadgeProps) {
  if (!securityCheck) {
    return null;
  }

  const { passed, total, forceApproved } = securityCheck;
  const isPerfect = passed === total;
  const isWarning = passed < total;

  // Color based on status
  const color = isPerfect ? "#10b981" : isWarning ? "#f59e0b" : "#ef4444";
  const bgColor = isPerfect
    ? "rgba(16, 185, 129, 0.1)"
    : isWarning
      ? "rgba(245, 158, 11, 0.1)"
      : "rgba(239, 68, 68, 0.1)";
  const borderColor = isPerfect
    ? "rgba(16, 185, 129, 0.2)"
    : isWarning
      ? "rgba(245, 158, 11, 0.2)"
      : "rgba(239, 68, 68, 0.2)";

  if (variant === "compact") {
    return (
      <div
        className="group relative inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium"
        style={{
          background: bgColor,
          color: color,
          border: `1px solid ${borderColor}`,
        }}
        title={
          showTooltip
            ? `Security: ${passed}/${total} checks passed${forceApproved ? " (force approved)" : ""}`
            : undefined
        }
      >
        {/* Shield icon */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          {isPerfect && <polyline points="9 12 11 14 15 10" />}
        </svg>
        <span>
          {passed}/{total}
        </span>
        {forceApproved && (
          <span className="text-[10px] opacity-70">!</span>
        )}
      </div>
    );
  }

  // Full variant for detail page
  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full"
          style={{ background: `${color}20` }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            {isPerfect && <polyline points="9 12 11 14 15 10" />}
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold" style={{ color }}>
              {passed}/{total} Security Checks Passed
            </span>
            {forceApproved && (
              <span
                className="rounded px-1.5 py-0.5 text-xs"
                style={{
                  background: "rgba(245, 158, 11, 0.2)",
                  color: "#f59e0b",
                }}
              >
                Force Approved
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm" style={{ color: "var(--text-tertiary)" }}>
            {securityCheck.filesScanned} files scanned on{" "}
            {new Date(securityCheck.lastChecked).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

interface SecurityChecklistProps {
  securityCheck: SecurityCheck;
}

export function SecurityChecklist({ securityCheck }: SecurityChecklistProps) {
  const checkLabels: Record<keyof typeof securityCheck.checks, { label: string; description: string }> = {
    noObfuscatedCode: {
      label: "No Obfuscated Code",
      description: "No base64 encoded commands or hidden scripts",
    },
    noRemoteExecution: {
      label: "No Remote Execution",
      description: "No download-and-execute patterns",
    },
    noCredentialTheft: {
      label: "No Credential Theft",
      description: "No token or credential harvesting code",
    },
    noDataExfiltration: {
      label: "No Data Exfiltration",
      description: "No suspicious outbound data transfers",
    },
    noMaliciousPatterns: {
      label: "No Malicious Patterns",
      description: "No known malware techniques",
    },
    noHardcodedSecrets: {
      label: "No Hardcoded Secrets",
      description: "No API keys or credentials in code",
    },
  };

  return (
    <div className="space-y-2">
      {Object.entries(securityCheck.checks).map(([key, passed]) => {
        const info = checkLabels[key as keyof typeof securityCheck.checks];
        return (
          <div
            key={key}
            className="flex items-center gap-3 rounded-lg px-3 py-2"
            style={{
              background: passed
                ? "rgba(16, 185, 129, 0.05)"
                : "rgba(239, 68, 68, 0.05)",
            }}
          >
            {passed ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
            <div className="flex-1">
              <div
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {info.label}
              </div>
              <div
                className="text-xs"
                style={{ color: "var(--text-tertiary)" }}
              >
                {info.description}
              </div>
            </div>
          </div>
        );
      })}
      {securityCheck.aiSummary && (
        <div
          className="mt-4 rounded-lg p-3"
          style={{
            background: "rgba(0, 212, 255, 0.05)",
            border: "1px solid rgba(0, 212, 255, 0.15)",
          }}
        >
          <div className="flex items-start gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent-primary)"
              strokeWidth="2"
              className="mt-0.5 flex-shrink-0"
            >
              <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
            </svg>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {securityCheck.aiSummary}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
