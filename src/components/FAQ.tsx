"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "What does the 'Verified' badge mean?",
    answer:
      "The Verified badge indicates that a tool's source code has been automatically scanned by our AI-powered security system and passed all 6 security checks. These checks look for obfuscated code, remote execution risks, credential theft patterns, data exfiltration, malicious patterns, and hardcoded secrets. A Verified badge gives you confidence that the code follows security best practices.",
  },
  {
    question: "What does the 'Curated' badge mean?",
    answer:
      "The Curated badge is shown for tools that don't have publicly available source code (such as web applications or commercial tools with free tiers). While we cannot perform automated security scans on these tools, they have been manually reviewed and selected by our team for their usefulness to the Intune community. These tools are included because they provide significant value, even without open-source code.",
  },
  {
    question: "Are all tools on Awesome Intune free?",
    answer:
      "Yes, all tools listed on Awesome Intune are free to use. Most are open-source and available on GitHub, while some web applications offer free tiers with optional premium features.",
  },
  {
    question: "How can I submit a tool?",
    answer:
      "You can submit a tool by visiting our GitHub repository and creating a pull request with your tool's details. All submissions go through a review process, including automated security scanning for open-source tools. Check our contribution guidelines for the submission format.",
  },
  {
    question: "What security checks are performed?",
    answer:
      "Our automated security scanner checks for 6 potential issues: obfuscated or encoded code, remote code execution patterns, credential harvesting attempts, data exfiltration risks, known malicious patterns, and hardcoded secrets or API keys. Tools that pass all checks receive the Verified badge.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-20 sm:py-28">
      {/* Background accent */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0, 212, 255, 0.03), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <span
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
            style={{
              background: "rgba(0, 212, 255, 0.08)",
              color: "var(--accent-primary)",
              border: "1px solid rgba(0, 212, 255, 0.15)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            FAQ
          </span>
          <h2
            className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ color: "var(--text-primary)" }}
          >
            Frequently Asked Questions
          </h2>
          <p
            className="mt-3 text-base sm:text-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            Learn about our security verification process and how tools are curated
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl transition-all duration-200"
              style={{
                background:
                  openIndex === index
                    ? "rgba(17, 25, 34, 0.98)"
                    : "rgba(17, 25, 34, 0.6)",
                border:
                  openIndex === index
                    ? "1px solid rgba(0, 212, 255, 0.2)"
                    : "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors"
                aria-expanded={openIndex === index}
              >
                <span
                  className="text-sm font-medium sm:text-base"
                  style={{ color: "var(--text-primary)" }}
                >
                  {item.question}
                </span>
                <span
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200"
                  style={{
                    background:
                      openIndex === index
                        ? "rgba(0, 212, 255, 0.1)"
                        : "rgba(255, 255, 255, 0.05)",
                    color:
                      openIndex === index
                        ? "var(--accent-primary)"
                        : "var(--text-tertiary)",
                    transform: openIndex === index ? "rotate(180deg)" : "rotate(0deg)",
                  }}
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
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </button>
              <div
                className="overflow-hidden transition-all duration-300 ease-out"
                style={{
                  maxHeight: openIndex === index ? "500px" : "0px",
                  opacity: openIndex === index ? 1 : 0,
                }}
              >
                <div
                  className="border-t px-6 pb-5 pt-4"
                  style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
                >
                  <p
                    className="text-sm leading-relaxed sm:text-base"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {item.answer}
                  </p>

                  {/* Visual badge examples for first two questions */}
                  {index === 0 && (
                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                        Example:
                      </span>
                      <div
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.08))",
                          color: "#10b981",
                          border: "1px solid rgba(16, 185, 129, 0.25)",
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                            fill="currentColor"
                            fillOpacity="0.2"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <path
                            d="M9 12l2 2 4-4"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>Verified</span>
                      </div>
                    </div>
                  )}
                  {index === 1 && (
                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                        Example:
                      </span>
                      <div
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.08))",
                          color: "#818cf8",
                          border: "1px solid rgba(99, 102, 241, 0.25)",
                        }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span>Curated</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Help Link */}
        <div className="mt-10 text-center">
          <p
            className="text-sm"
            style={{ color: "var(--text-tertiary)" }}
          >
            Have more questions?{" "}
            <a
              href="https://github.com/ugurkocde/awesomeintune/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[var(--accent-primary)]"
              style={{ color: "var(--text-secondary)" }}
            >
              Open an issue on GitHub
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
