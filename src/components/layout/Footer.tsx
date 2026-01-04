"use client";

import Link from "next/link";
import { GITHUB_REPO_URL, SITE_CONFIG } from "~/lib/constants";
import { SubscribeForm } from "~/components/newsletter/SubscribeForm";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="relative mt-auto border-t"
      style={{
        borderColor: "var(--border-subtle)",
        background: "var(--bg-secondary)",
      }}
    >
      <div className="container-main py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{
                  background: "var(--accent-glow)",
                  border: "1px solid var(--border-accent)",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--accent-primary)"
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
                className="font-display text-lg font-bold tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                AWESOME
                <span style={{ color: "var(--accent-primary)" }}> INTUNE</span>
              </span>
            </Link>
            <p
              className="max-w-xs text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              {SITE_CONFIG.description}
            </p>
          </div>

          {/* Links Column */}
          <div className="space-y-4">
            <h3
              className="font-display text-sm font-semibold uppercase tracking-wide"
              style={{ color: "var(--text-tertiary)" }}
            >
              Links
            </h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/submit"
                className="text-sm transition-colors hover:text-[var(--accent-primary)]"
                style={{ color: "var(--text-secondary)" }}
              >
                Submit a Tool
              </Link>
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm transition-colors hover:text-[var(--accent-primary)]"
                style={{ color: "var(--text-secondary)" }}
              >
                GitHub Repository
              </a>
              <a
                href={`${GITHUB_REPO_URL}/issues`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm transition-colors hover:text-[var(--accent-primary)]"
                style={{ color: "var(--text-secondary)" }}
              >
                Report an Issue
              </a>
            </nav>
          </div>

          {/* Stay Updated Column */}
          <div className="space-y-4">
            <h3
              className="font-display text-sm font-semibold uppercase tracking-wide"
              style={{ color: "var(--text-tertiary)" }}
            >
              Stay Updated
            </h3>
            <SubscribeForm variant="footer" />
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            &copy; {currentYear} Awesome Intune. Built for the community.
          </p>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            Made with{" "}
            <span style={{ color: "var(--accent-primary)" }}>&hearts;</span> by
            the Intune community
          </p>
        </div>
      </div>
    </footer>
  );
}
