"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ToolSubmitForm } from "~/components/submit/ToolSubmitForm";

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

export default function SubmitPage() {
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
              Back to Tools
            </Link>
            <h1
              className="font-display text-4xl font-bold md:text-5xl"
              style={{ color: "var(--text-primary)" }}
            >
              Submit Your Tool
            </h1>
            <p
              className="mt-4 text-lg"
              style={{ color: "var(--text-secondary)" }}
            >
              Share your Intune tool with the community
            </p>
          </motion.div>

          {/* Process Steps - Compact */}
          <motion.div
            variants={itemVariants}
            className="mb-8 flex items-center justify-center gap-2 md:gap-4"
          >
            {[
              { step: "1", title: "Submit" },
              { step: "2", title: "Review" },
              { step: "3", title: "Live" },
            ].map((item, index) => (
              <div key={item.step} className="flex items-center gap-2 md:gap-4">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      background: "var(--accent-glow)",
                      color: "var(--accent-primary)",
                      border: "1px solid var(--border-accent)",
                    }}
                  >
                    {item.step}
                  </span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {item.title}
                  </span>
                </div>
                {index < 2 && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--border-medium)"
                    strokeWidth="2"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                )}
              </div>
            ))}
          </motion.div>

          {/* Submission Form */}
          <motion.div variants={itemVariants}>
            <ToolSubmitForm />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
