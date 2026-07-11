"use client";

import { useState } from "react";
import { getHomepageFAQItems } from "~/lib/structured-data";

export function FAQ({ toolCount }: { toolCount: number }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqItems = getHomepageFAQItems(toolCount);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative scroll-mt-24 py-20 sm:py-28">
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
              aria-hidden="true"
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
        <div className="space-y-3" role="list">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl transition-all duration-200"
              style={{
                background: "var(--bg-secondary)",
                border:
                  openIndex === index
                    ? "1px solid var(--border-accent)"
                    : "1px solid var(--border-subtle)",
              }}
              role="listitem"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors"
                aria-expanded={openIndex === index}
                aria-controls={`faq-content-${index}`}
                id={`faq-button-${index}`}
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
                        ? "var(--accent-glow)"
                        : "var(--bg-tertiary)",
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
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </button>
              <div
                id={`faq-content-${index}`}
                role="region"
                aria-labelledby={`faq-button-${index}`}
                aria-hidden={openIndex !== index}
                className="grid transition-all duration-300 ease-out"
                style={{
                  gridTemplateRows: openIndex === index ? "1fr" : "0fr",
                  opacity: openIndex === index ? 1 : 0,
                }}
              >
                <div className="min-h-0 overflow-hidden">
                <div
                  className="border-t px-6 pb-5 pt-4"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <p
                    className="text-sm leading-relaxed sm:text-base"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {item.answer}
                  </p>

                  {/* Visual badge examples for the badge questions */}
                  {item.question.includes("Verified badge") && (
                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                        Example:
                      </span>
                      <div
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.08))",
                          color: "var(--signal-success)",
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
                  {item.question.includes("Curated badge") && (
                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                        Example:
                      </span>
                      <div
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
                        style={{
                          background: "var(--bg-tertiary)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border-medium)",
                        }}
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
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="16" x2="12" y2="12" />
                          <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        <span>Curated</span>
                      </div>
                    </div>
                  )}
                </div>
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
