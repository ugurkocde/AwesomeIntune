"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SITE_CONFIG } from "~/lib/constants";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export default function TermsPage() {
  return (
    <section className="min-h-screen pt-32 pb-20">
      <div className="container-main">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-3xl"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-12 text-center">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2 text-sm transition-colors hover:text-[var(--accent-primary)]"
              style={{ color: "var(--text-secondary)" }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
            <h1
              className="font-display text-4xl font-bold md:text-5xl"
              style={{ color: "var(--text-primary)" }}
            >
              Terms of Service
            </h1>
            <p
              className="mt-4 text-lg"
              style={{ color: "var(--text-secondary)" }}
            >
              Last updated: January 2026
            </p>
          </motion.div>

          {/* Content */}
          <motion.div
            variants={itemVariants}
            className="prose prose-lg max-w-none"
            style={{ color: "var(--text-secondary)" }}
          >
            <div
              className="rounded-xl p-8 md:p-10"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <Section title="Acceptance of Terms">
                <p>
                  By accessing and using {SITE_CONFIG.name}, you accept and agree
                  to be bound by these Terms of Service. If you do not agree to
                  these terms, please do not use our website.
                </p>
              </Section>

              <Section title="Description of Service">
                <p>
                  {SITE_CONFIG.name} is a community-curated directory of
                  Microsoft Intune tools and resources. We aggregate and showcase
                  tools created by the community to help IT professionals manage
                  and optimize their Intune deployments.
                </p>
              </Section>

              <Section title="Third-Party Tools">
                <p>
                  <strong style={{ color: "var(--text-primary)" }}>
                    Important:
                  </strong>{" "}
                  All tools listed on {SITE_CONFIG.name} are developed,
                  maintained, and owned by their respective authors and
                  communities. We do not create, maintain, or provide support for
                  these tools.
                </p>
                <ul className="mt-4 space-y-2">
                  <li>
                    Each tool is subject to its own license and terms of use
                  </li>
                  <li>
                    We make no warranties regarding the functionality, security,
                    or reliability of listed tools
                  </li>
                  <li>
                    Always review a tool&apos;s source code and documentation
                    before use
                  </li>
                  <li>
                    Test all tools in non-production environments first
                  </li>
                </ul>
              </Section>

              <Section title="Disclaimer of Warranties">
                <p>
                  {SITE_CONFIG.name} is provided &quot;as is&quot; and &quot;as
                  available&quot; without any warranties of any kind, either
                  express or implied. We do not warrant that:
                </p>
                <ul className="mt-4 space-y-2">
                  <li>The service will be uninterrupted or error-free</li>
                  <li>
                    Listed tools are free from bugs, vulnerabilities, or errors
                  </li>
                  <li>Information provided is accurate or complete</li>
                  <li>Tools will meet your specific requirements</li>
                </ul>
              </Section>

              <Section title="Limitation of Liability">
                <p>
                  To the fullest extent permitted by law, {SITE_CONFIG.name}, its
                  creators, and contributors shall not be liable for any direct,
                  indirect, incidental, special, consequential, or punitive
                  damages arising from:
                </p>
                <ul className="mt-4 space-y-2">
                  <li>Your use of any tools listed on this website</li>
                  <li>
                    Any errors or omissions in the content provided
                  </li>
                  <li>
                    Any unauthorized access to or use of our servers
                  </li>
                  <li>
                    Any interruption or cessation of transmission to or from our
                    website
                  </li>
                </ul>
              </Section>

              <Section title="User Responsibilities">
                <p>When using {SITE_CONFIG.name}, you agree to:</p>
                <ul className="mt-4 space-y-2">
                  <li>Use the website and listed tools responsibly</li>
                  <li>
                    Verify tool compatibility with your environment before
                    deployment
                  </li>
                  <li>
                    Comply with all applicable laws and regulations
                  </li>
                  <li>
                    Not use the website for any unlawful or prohibited purpose
                  </li>
                  <li>
                    Report any security vulnerabilities or issues through proper
                    channels
                  </li>
                </ul>
              </Section>

              <Section title="Tool Submissions">
                <p>
                  If you submit a tool to be listed on {SITE_CONFIG.name}:
                </p>
                <ul className="mt-4 space-y-2">
                  <li>
                    You confirm you have the right to share information about the
                    tool
                  </li>
                  <li>
                    Submissions are processed through GitHub and subject to
                    review
                  </li>
                  <li>
                    We reserve the right to accept, reject, or remove any tool at
                    our discretion
                  </li>
                  <li>
                    Submitted information may be edited for clarity and
                    consistency
                  </li>
                </ul>
              </Section>

              <Section title="Intellectual Property">
                <p>
                  The {SITE_CONFIG.name} website design, logo, and original
                  content are protected by intellectual property rights. Listed
                  tools remain the intellectual property of their respective
                  owners and are subject to their own licenses.
                </p>
              </Section>

              <Section title="Changes to Terms">
                <p>
                  We reserve the right to modify these Terms of Service at any
                  time. Changes will be effective immediately upon posting to this
                  page. Your continued use of the website after changes
                  constitutes acceptance of the new terms.
                </p>
              </Section>

              <Section title="Contact" isLast>
                <p>
                  If you have any questions about these Terms of Service, please
                  contact us at{" "}
                  <a
                    href="mailto:support@ugurlabs.com"
                    className="transition-colors hover:text-[var(--accent-primary)]"
                    style={{ color: "var(--accent-primary)" }}
                  >
                    support@ugurlabs.com
                  </a>{" "}
                  or through our{" "}
                  <a
                    href="https://github.com/ugurkocde/awesomeintune/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-[var(--accent-primary)]"
                    style={{ color: "var(--accent-primary)" }}
                  >
                    GitHub repository
                  </a>
                  .
                </p>
              </Section>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Section({
  title,
  children,
  isLast = false,
}: {
  title: string;
  children: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div className={isLast ? "" : "mb-8"}>
      <h2
        className="mb-4 font-display text-xl font-semibold"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </h2>
      <div
        className="space-y-3 text-sm leading-relaxed md:text-base"
        style={{ color: "var(--text-secondary)" }}
      >
        {children}
      </div>
    </div>
  );
}
