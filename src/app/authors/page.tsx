import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getAllAuthors } from "~/lib/tools.server";
import { SITE_CONFIG } from "~/lib/constants";
import { generateBreadcrumbStructuredData } from "~/lib/structured-data";

export const metadata: Metadata = {
  title: `Contributors | ${SITE_CONFIG.name}`,
  description:
    "Browse the community contributors behind the free Microsoft Intune tools, scripts, and resources in the Awesome Intune directory.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/authors`,
  },
  openGraph: {
    title: `Contributors | ${SITE_CONFIG.name}`,
    description:
      "Browse the community contributors behind the free Microsoft Intune tools in the Awesome Intune directory.",
    url: `${SITE_CONFIG.url}/authors`,
  },
};

export default function AuthorsPage() {
  const authors = getAllAuthors().sort(
    (a, b) => b.tools.length - a.tools.length,
  );

  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: "Home", url: SITE_CONFIG.url },
    { name: "Contributors", url: `${SITE_CONFIG.url}/authors` },
  ]);

  return (
    <main className="min-h-screen pb-20 pt-24 sm:pb-32 sm:pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <div className="mx-auto max-w-7xl px-6">
        <Link
          href="/#tools"
          className="mb-8 inline-flex items-center gap-2 text-sm transition-colors"
          style={{ color: "var(--text-tertiary)" }}
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
          Back to all tools
        </Link>

        <div className="mb-10 flex flex-wrap items-center gap-4">
          <h1
            className="text-4xl font-bold sm:text-5xl"
            style={{ color: "var(--text-primary)" }}
          >
            Contributors
          </h1>
          <span
            className="rounded-full px-3 py-1 text-sm font-medium"
            style={{
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
            }}
          >
            {authors.length} contributors
          </span>
        </div>

        <p
          className="mb-12 max-w-2xl text-base"
          style={{ color: "var(--text-secondary)" }}
        >
          The community members who build and share the tools in this
          directory.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {authors.map((author) => (
            <Link
              key={author.slug}
              href={`/authors/${author.slug}`}
              className="flex items-center gap-4 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {author.picture ? (
                <Image
                  src={author.picture}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold"
                  style={{
                    background: "var(--bg-tertiary)",
                    color: "var(--text-secondary)",
                  }}
                  aria-hidden="true"
                >
                  {author.name.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="min-w-0">
                <span
                  className="block truncate font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {author.name}
                </span>
                <span
                  className="block text-sm"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {author.tools.length}{" "}
                  {author.tools.length === 1 ? "tool" : "tools"}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
