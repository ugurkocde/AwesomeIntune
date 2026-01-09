"use client";

import Link from "next/link";
import Image from "next/image";
import { GITHUB_REPO_URL, SITE_CONFIG } from "~/lib/constants";
import { SubscribeForm } from "~/components/newsletter/SubscribeForm";
import { trackSponsorClick } from "~/lib/plausible";

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
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
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
            <div className="pt-2">
              <p
                className="mb-2 text-xs font-medium uppercase tracking-wide"
                style={{ color: "var(--text-tertiary)" }}
              >
                Stay Updated
              </p>
              <SubscribeForm variant="footer" />
            </div>
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
                href="/tools"
                className="text-sm transition-colors hover:text-[var(--accent-primary)]"
                style={{ color: "var(--text-secondary)" }}
              >
                Browse All Tools
              </Link>
              <Link
                href="/submit"
                className="text-sm transition-colors hover:text-[var(--accent-primary)]"
                style={{ color: "var(--text-secondary)" }}
              >
                Submit a Tool
              </Link>
              <Link
                href="/developers"
                className="text-sm transition-colors hover:text-[var(--accent-primary)]"
                style={{ color: "var(--text-secondary)" }}
              >
                Developer API
              </Link>
              <a
                href={`${GITHUB_REPO_URL}/issues`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm transition-colors hover:text-[var(--accent-primary)]"
                style={{ color: "var(--text-secondary)" }}
              >
                Report an Issue
              </a>
              <Link
                href="/privacy"
                className="text-sm transition-colors hover:text-[var(--accent-primary)]"
                style={{ color: "var(--text-secondary)" }}
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm transition-colors hover:text-[var(--accent-primary)]"
                style={{ color: "var(--text-secondary)" }}
              >
                Terms of Service
              </Link>
            </nav>
          </div>

          {/* Connect Column */}
          <div className="space-y-4">
            <h3
              className="font-display text-sm font-semibold uppercase tracking-wide"
              style={{ color: "var(--text-tertiary)" }}
            >
              Connect
            </h3>
            <nav className="flex flex-col gap-2">
              <a
                href="https://www.linkedin.com/in/ugurkocde/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm transition-colors hover:text-[var(--accent-primary)]"
                style={{ color: "var(--text-secondary)" }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </a>
              <a
                href="https://x.com/UgurKocDe"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm transition-colors hover:text-[var(--accent-primary)]"
                style={{ color: "var(--text-secondary)" }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                X
              </a>
              <a
                href="https://github.com/ugurkocde"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm transition-colors hover:text-[var(--accent-primary)]"
                style={{ color: "var(--text-secondary)" }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </a>
            </nav>
          </div>

          {/* Sponsors Column */}
          <div className="space-y-4">
            <h3
              className="font-display text-sm font-semibold uppercase tracking-wide"
              style={{ color: "var(--text-tertiary)" }}
            >
              Sponsors
            </h3>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <a
                href="https://eido.io/?utm_source=awesome_intune"
                target="_blank"
                rel="noopener noreferrer"
                className="sponsor-logo-link group inline-block transition-all duration-300 hover:scale-[1.02]"
                onClick={() => trackSponsorClick("eido", "footer")}
              >
                <Image
                  src="/sponsors/eido-light.svg"
                  alt="eido - Sponsor"
                  width={86}
                  height={29}
                  className="sponsor-logo-dark h-auto w-[68px] sm:w-[86px] opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                />
                <Image
                  src="/sponsors/eido-dark.svg"
                  alt="eido - Sponsor"
                  width={86}
                  height={29}
                  className="sponsor-logo-light h-auto w-[68px] sm:w-[86px] transition-opacity duration-300 group-hover:opacity-100"
                />
              </a>
              <a
                href="https://zerotouch.ai/?utm_source=awesome_intune"
                target="_blank"
                rel="noopener noreferrer"
                className="sponsor-logo-link group inline-block transition-all duration-300 hover:scale-[1.02]"
                onClick={() => trackSponsorClick("zerotouch", "footer")}
              >
                <Image
                  src="/sponsors/zerotouch-light.png"
                  alt="ZeroTouch - Sponsor"
                  width={125}
                  height={50}
                  className="sponsor-logo-dark h-[38px] sm:h-[50px] w-auto opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                />
                <Image
                  src="/sponsors/zerotouch-dark.png"
                  alt="ZeroTouch - Sponsor"
                  width={125}
                  height={50}
                  className="sponsor-logo-light h-[38px] sm:h-[50px] w-auto transition-opacity duration-300 group-hover:opacity-100"
                />
              </a>
              <a
                href="https://www.recastsoftware.com/?utm_source=sponsored_writer&utm_medium=referral&utm_campaign=awesomeintune"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-block transition-all duration-300 hover:scale-[1.02]"
                onClick={() => trackSponsorClick("recast", "footer")}
              >
                <Image
                  src="/sponsors/recast.png"
                  alt="Recast - Sponsor"
                  width={90}
                  height={20}
                  className="h-[15px] sm:h-[20px] w-auto opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                />
              </a>
              <a
                href="https://devicie.com/?utm_source=awesome_intune"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-block transition-all duration-300 hover:scale-[1.02]"
                onClick={() => trackSponsorClick("devicie", "footer")}
              >
                <Image
                  src="/sponsors/devicie.png"
                  alt="Devicie - Sponsor"
                  width={95}
                  height={34}
                  className="h-[27px] sm:h-[34px] w-auto opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                />
              </a>
            </div>
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
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              Made with{" "}
              <span style={{ color: "var(--accent-primary)" }}>&hearts;</span>{" "}
              by Ugur
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
