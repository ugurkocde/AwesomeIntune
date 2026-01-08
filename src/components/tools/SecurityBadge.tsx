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
  const percentage = Math.round((passed / total) * 100);

  if (variant === "compact") {
    // Only show badge for perfect scores or warnings
    // For perfect scores: "Verified" badge
    // For partial: Warning indicator
    if (isPerfect && !forceApproved) {
      return (
        <div
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
          style={{
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.08))",
            color: "#10b981",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            boxShadow: "0 0 12px rgba(16, 185, 129, 0.1)",
          }}
          title={showTooltip ? `All ${total} security checks passed` : undefined}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
          <span>Verified</span>
        </div>
      );
    }

    // Force approved with perfect score
    if (isPerfect && forceApproved) {
      return (
        <div
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
          style={{
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.08))",
            color: "#f59e0b",
            border: "1px solid rgba(245, 158, 11, 0.25)",
          }}
          title={showTooltip ? `${passed}/${total} checks passed (force approved)` : undefined}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
          <span>Verified</span>
        </div>
      );
    }

    // Partial pass - show warning badge with count
    return (
      <div
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
        style={{
          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.08))",
          color: "#f59e0b",
          border: "1px solid rgba(245, 158, 11, 0.25)",
        }}
        title={
          showTooltip
            ? `${passed}/${total} security checks passed${forceApproved ? " (force approved)" : ""}`
            : undefined
        }
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>{passed}/{total}</span>
      </div>
    );
  }

  // Full variant for detail page - Premium Security Report Card
  const statusColor = isPerfect ? "#10b981" : "#f59e0b";
  const statusLabel = isPerfect ? "All Checks Passed" : `${total - passed} Issue${total - passed > 1 ? "s" : ""} Found`;

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: "linear-gradient(135deg, rgba(17, 25, 34, 0.98), rgba(17, 25, 34, 0.95))",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        boxShadow: `0 20px 40px -15px rgba(0, 0, 0, 0.4), 0 0 60px -20px ${statusColor}15`,
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute left-0 right-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${statusColor}60, transparent)`,
        }}
      />

      <div className="p-6">
        <div className="flex items-center gap-5">
          {/* Circular Progress Ring */}
          <div className="relative flex-shrink-0">
            <svg width="72" height="72" viewBox="0 0 72 72" className="transform -rotate-90">
              {/* Background ring */}
              <circle
                cx="36"
                cy="36"
                r="30"
                fill="none"
                stroke="rgba(255, 255, 255, 0.06)"
                strokeWidth="6"
              />
              {/* Progress ring */}
              <circle
                cx="36"
                cy="36"
                r="30"
                fill="none"
                stroke={statusColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${(percentage / 100) * 188.5} 188.5`}
                style={{
                  filter: `drop-shadow(0 0 8px ${statusColor}50)`,
                }}
              />
            </svg>
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-xl font-bold tabular-nums"
                style={{ color: statusColor }}
              >
                {passed}
              </span>
              <span
                className="text-[10px] font-medium uppercase tracking-wider"
                style={{ color: "var(--text-tertiary)" }}
              >
                of {total}
              </span>
            </div>
          </div>

          {/* Status Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isPerfect ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={statusColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={statusColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
              <span
                className="text-base font-semibold"
                style={{ color: statusColor }}
              >
                {statusLabel}
              </span>
              {forceApproved && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                  style={{
                    background: "rgba(245, 158, 11, 0.15)",
                    color: "#f59e0b",
                    border: "1px solid rgba(245, 158, 11, 0.25)",
                  }}
                >
                  Override
                </span>
              )}
            </div>
            <p
              className="text-sm"
              style={{ color: "var(--text-tertiary)" }}
            >
              {securityCheck.filesScanned} files scanned on{" "}
              {new Date(securityCheck.lastChecked).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SecurityChecklistProps {
  securityCheck: SecurityCheck;
}

export function SecurityChecklist({ securityCheck }: SecurityChecklistProps) {
  const checkItems: Array<{
    key: keyof typeof securityCheck.checks;
    label: string;
    description: string;
    icon: React.ReactNode;
  }> = [
    {
      key: "noObfuscatedCode",
      label: "No Obfuscated Code",
      description: "No base64 encoded commands or hidden scripts",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
    },
    {
      key: "noRemoteExecution",
      label: "No Remote Execution",
      description: "No download-and-execute patterns",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9" />
        </svg>
      ),
    },
    {
      key: "noCredentialTheft",
      label: "No Credential Theft",
      description: "No token or credential harvesting code",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
    },
    {
      key: "noDataExfiltration",
      label: "No Data Exfiltration",
      description: "No suspicious outbound data transfers",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
      ),
    },
    {
      key: "noMaliciousPatterns",
      label: "No Malicious Patterns",
      description: "No known malware techniques",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      ),
    },
    {
      key: "noHardcodedSecrets",
      label: "No Hardcoded Secrets",
      description: "No API keys or credentials in code",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
        </svg>
      ),
    },
  ];

  // Helper to get passed status - handles both old boolean format and new object format
  const getCheckStatus = (check: boolean | { passed: boolean; reason?: string }) => {
    if (typeof check === "boolean") {
      return { passed: check, reason: undefined };
    }
    return check;
  };

  const passedChecks = checkItems.filter(
    (item) => getCheckStatus(securityCheck.checks[item.key] as boolean | { passed: boolean; reason?: string }).passed
  );
  const failedChecks = checkItems.filter(
    (item) => !getCheckStatus(securityCheck.checks[item.key] as boolean | { passed: boolean; reason?: string }).passed
  );

  return (
    <div className="space-y-4">
      {/* Failed checks first (if any) */}
      {failedChecks.length > 0 && (
        <div className="space-y-2">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#ef4444" }}
          >
            Issues Detected
          </span>
          <div className="space-y-2">
            {failedChecks.map((item) => {
              const { reason } = getCheckStatus(
                securityCheck.checks[item.key] as boolean | { passed: boolean; reason?: string }
              );
              return (
                <div
                  key={item.key}
                  className="rounded-xl p-4"
                  style={{
                    background: "linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.03))",
                    border: "1px solid rgba(239, 68, 68, 0.15)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background: "rgba(239, 68, 68, 0.15)",
                        color: "#ef4444",
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {item.label}
                      </div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {item.description}
                      </div>
                      {reason && (
                        <div
                          className="mt-2 rounded-lg px-3 py-2 text-xs font-mono"
                          style={{
                            background: "rgba(239, 68, 68, 0.1)",
                            color: "#fca5a5",
                            border: "1px solid rgba(239, 68, 68, 0.2)",
                          }}
                        >
                          {reason}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Passed checks */}
      {passedChecks.length > 0 && (
        <div className="space-y-2">
          {failedChecks.length > 0 && (
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "#10b981" }}
            >
              Passed Checks
            </span>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {passedChecks.map((item) => (
              <div
                key={item.key}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{
                  background: "rgba(16, 185, 129, 0.04)",
                  border: "1px solid rgba(16, 185, 129, 0.1)",
                }}
              >
                <div
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: "rgba(16, 185, 129, 0.12)",
                    color: "#10b981",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-medium truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {item.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Summary */}
      {securityCheck.aiSummary && (
        <div
          className="rounded-xl p-4"
          style={{
            background: "linear-gradient(135deg, rgba(0, 212, 255, 0.06), rgba(0, 212, 255, 0.02))",
            border: "1px solid rgba(0, 212, 255, 0.12)",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
              style={{
                background: "rgba(0, 212, 255, 0.12)",
                color: "var(--accent-primary)",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="text-xs font-semibold uppercase tracking-wider mb-1"
                style={{ color: "var(--accent-primary)" }}
              >
                AI Analysis
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {securityCheck.aiSummary}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
