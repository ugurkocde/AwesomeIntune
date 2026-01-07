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

export default function PrivacyPage() {
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
              Privacy Policy
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
              <Section title="Introduction">
                <p>
                  Welcome to {SITE_CONFIG.name}. We respect your privacy and are
                  committed to protecting any personal information you share with
                  us. This Privacy Policy explains how we collect, use, and
                  safeguard your information when you visit our website.
                </p>
              </Section>

              <Section title="Information We Collect">
                <p>We collect minimal information to provide our services:</p>
                <ul className="mt-4 space-y-2">
                  <li>
                    <strong style={{ color: "var(--text-primary)" }}>
                      Newsletter Subscription:
                    </strong>{" "}
                    If you subscribe to our newsletter, we collect your email
                    address to send you updates about new tools and resources.
                  </li>
                  <li>
                    <strong style={{ color: "var(--text-primary)" }}>
                      Analytics Data:
                    </strong>{" "}
                    We use privacy-focused analytics (Plausible) to understand
                    how visitors use our site. This data is aggregated and does
                    not identify individual users.
                  </li>
                  <li>
                    <strong style={{ color: "var(--text-primary)" }}>
                      Tool Submissions:
                    </strong>{" "}
                    When you submit a tool, the submission is processed through
                    GitHub Issues, subject to GitHub&apos;s privacy policy.
                  </li>
                </ul>
              </Section>

              <Section title="How We Use Your Information">
                <p>We use the collected information to:</p>
                <ul className="mt-4 space-y-2">
                  <li>Send newsletter updates (only if you subscribed)</li>
                  <li>Improve our website and user experience</li>
                  <li>Process and review tool submissions</li>
                  <li>Respond to inquiries or feedback</li>
                </ul>
              </Section>

              <Section title="Data Sharing">
                <p>
                  We do not sell, trade, or rent your personal information to
                  third parties. We may share information only in these cases:
                </p>
                <ul className="mt-4 space-y-2">
                  <li>
                    With service providers who assist in operating our website
                    (e.g., email service for newsletters)
                  </li>
                  <li>When required by law or to protect our rights</li>
                  <li>With your explicit consent</li>
                </ul>
              </Section>

              <Section title="Cookies">
                <p>
                  Our website uses minimal cookies essential for functionality.
                  We use Plausible Analytics, which is privacy-focused and does
                  not use cookies to track individual users. You can control
                  cookie preferences through your browser settings.
                </p>
              </Section>

              <Section title="Third-Party Links">
                <p>
                  {SITE_CONFIG.name} contains links to third-party tools,
                  websites, and resources. We are not responsible for the
                  privacy practices of these external sites. We encourage you to
                  review their privacy policies before providing any personal
                  information.
                </p>
              </Section>

              <Section title="Data Security">
                <p>
                  We implement reasonable security measures to protect your
                  information. However, no method of transmission over the
                  Internet is 100% secure, and we cannot guarantee absolute
                  security.
                </p>
              </Section>

              <Section title="Your Rights">
                <p>You have the right to:</p>
                <ul className="mt-4 space-y-2">
                  <li>Unsubscribe from our newsletter at any time</li>
                  <li>Request information about data we hold about you</li>
                  <li>Request deletion of your data</li>
                </ul>
              </Section>

              <Section title="Changes to This Policy">
                <p>
                  We may update this Privacy Policy from time to time. Any
                  changes will be posted on this page with an updated revision
                  date.
                </p>
              </Section>

              <Section title="Contact Us" isLast>
                <p>
                  If you have any questions about this Privacy Policy, please
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
