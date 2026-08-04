import Link from "next/link";
import type { ReactNode } from "react";

type TableOfContentsItem = {
  id: string;
  label: string;
};

type LegalPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  updated: string;
  tableOfContents: readonly TableOfContentsItem[];
  children: ReactNode;
};

export function LegalPageShell({
  eyebrow,
  title,
  description,
  updated,
  tableOfContents,
  children,
}: LegalPageShellProps) {
  return (
    <section className="relative min-h-screen overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] opacity-70"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, var(--accent-glow-strong), transparent 58%)",
        }}
      />

      <div className="container-main">
        <header className="mx-auto max-w-4xl text-center">
          <Link
            href="/"
            className="mb-7 inline-flex min-h-11 touch-manipulation items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--accent-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
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
              aria-hidden="true"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            Back to home
          </Link>

          <p
            className="font-mono text-xs font-semibold tracking-[0.18em] uppercase"
            style={{ color: "var(--accent-primary)" }}
          >
            {eyebrow}
          </p>
          <h1
            className="font-display mt-4 text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl md:text-6xl"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </h1>
          <p
            className="mx-auto mt-5 max-w-2xl text-base leading-7 text-pretty md:text-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            {description}
          </p>
          <p className="mt-4 text-sm" style={{ color: "var(--text-tertiary)" }}>
            Last updated: {updated}
          </p>
        </header>

        <div className="mx-auto mt-14 grid max-w-6xl gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start">
          <aside className="lg:sticky lg:top-28">
            <nav
              aria-label={title + " sections"}
              className="rounded-2xl border p-4"
              style={{
                borderColor: "var(--border-subtle)",
                background: "var(--surface-subtle)",
              }}
            >
              <p
                className="font-display px-3 pb-3 text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                On this page
              </p>
              <ol className="space-y-1">
                {tableOfContents.map((item, index) => (
                  <li key={item.id}>
                    <a
                      href={"#" + item.id}
                      className="grid min-h-11 touch-manipulation grid-cols-[1.5rem_1fr] items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--accent-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <span
                        className="font-mono text-[11px]"
                        style={{ color: "var(--text-tertiary)" }}
                        aria-hidden="true"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article
            className="min-w-0 overflow-hidden rounded-2xl border shadow-[var(--shadow-sm)]"
            style={{
              borderColor: "var(--border-subtle)",
              background: "var(--bg-secondary)",
            }}
          >
            {children}
          </article>
        </div>
      </div>
    </section>
  );
}

type LegalSectionProps = {
  id: string;
  title: string;
  children: ReactNode;
  isLast?: boolean;
};

export function LegalSection({
  id,
  title,
  children,
  isLast = false,
}: LegalSectionProps) {
  return (
    <section
      id={id}
      className={[
        "scroll-mt-28 px-6 py-8 sm:px-9 md:px-12 md:py-10",
        isLast ? "" : "border-b",
      ].join(" ")}
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <h2
        className="font-display text-xl font-semibold tracking-tight text-balance md:text-2xl"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </h2>
      <div
        className="[&_h3]:font-display mt-4 space-y-4 text-[15px] leading-7 break-words sm:text-base [&_a]:font-medium [&_a]:text-[var(--accent-primary)] [&_a]:underline [&_a]:decoration-[var(--border-accent)] [&_a]:underline-offset-4 [&_a]:transition-colors [&_a]:hover:text-[var(--accent-secondary)] [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-2 [&_a]:focus-visible:outline-[var(--accent-primary)] [&_h3]:pt-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-[var(--text-primary)] [&_li]:pl-1 [&_ol]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_strong]:font-semibold [&_strong]:text-[var(--text-primary)] [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-2"
        style={{ color: "var(--text-secondary)" }}
      >
        {children}
      </div>
    </section>
  );
}
