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
      <div className="container-main pt-12 pb-6 md:pt-16 md:pb-8">
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
          className="mt-12 border-t pt-6"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          {/* Disclaimer - subtle fine print */}
          <p
            className="mb-4 text-center text-[11px] tracking-wide opacity-60"
            style={{ color: "var(--text-tertiary)" }}
          >
            All tools belong to their respective authors and communities
            <span className="mx-2" style={{ opacity: 0.4 }}>|</span>
            Always test in non-production environments first
          </p>

          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            &copy; {currentYear}{" "}
            <a
              href="https://ugurlabs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[var(--accent-primary)]"
              style={{ color: "var(--text-secondary)" }}
            >
              Ugur Labs
            </a>
            . Built for the community.
          </p>
          <a
            href="https://www.linkedin.com/in/ugurkocde/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm transition-colors hover:text-[var(--accent-primary)]"
            style={{ color: "var(--text-tertiary)" }}
          >
            Made with{" "}
            <span style={{ color: "var(--accent-primary)" }}>&hearts;</span> by
            Ugur
          </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
