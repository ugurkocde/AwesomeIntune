import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  getAuthorBySlug,
  getAllAuthorSlugs,
} from "~/lib/tools.server";
import { SITE_CONFIG } from "~/lib/constants";
import { AuthorPageClient } from "~/components/authors/AuthorPageClient";

interface AuthorPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllAuthorSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);

  if (!author) {
    return {
      title: "Author Not Found",
    };
  }

  const toolCount = author.tools.length;

  // Optimized title with tool count
  const title = `${author.name}'s Intune Tools (${toolCount} ${toolCount === 1 ? "Script" : "Scripts"}) | ${SITE_CONFIG.name}`;

  const description = `Explore ${toolCount} free Microsoft Intune ${toolCount === 1 ? "tool" : "tools"} created by ${author.name}. Download PowerShell scripts and automation resources.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_CONFIG.url}/authors/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: "profile",
      url: `${SITE_CONFIG.url}/authors/${slug}`,
    },
  };
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);

  if (!author) {
    notFound();
  }

  const toolIds = author.tools.map((t) => t.id);

  // Calculate total GitHub stars from all tools
  const totalStars = author.tools.reduce((sum, tool) => {
    return sum + (tool.repoStats?.stars ?? 0);
  }, 0);

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Atmospheric Background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 212, 255, 0.08), transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 80% 60%, rgba(139, 92, 246, 0.05), transparent 50%)",
        }}
      />

      {/* Content Container */}
      <div className="relative mx-auto max-w-4xl px-6 pb-20 pt-24 sm:pb-32 sm:pt-28">
        {/* Back Navigation */}
        <Link
          href="/"
          className="group mb-8 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-white/5 sm:mb-12 sm:px-0 sm:py-0 sm:hover:bg-transparent"
          style={{
            color: "var(--text-secondary)",
            marginLeft: "-0.75rem",
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
            className="transition-transform group-hover:-translate-x-1"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          <span className="transition-colors group-hover:text-[var(--text-primary)]">
            Back to all tools
          </span>
        </Link>

        {/* Profile Card */}
        <div
          className="relative overflow-hidden rounded-3xl"
          style={{
            background: "rgba(17, 25, 34, 0.98)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            boxShadow:
              "0 40px 80px -20px rgba(0, 0, 0, 0.6), 0 0 100px -30px rgba(0, 212, 255, 0.15)",
          }}
        >
          {/* Top Gradient Accent */}
          <div
            className="absolute left-0 right-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent 10%, var(--accent-primary), transparent 90%)",
            }}
          />

          {/* Corner glow */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 opacity-20"
            style={{
              background: "radial-gradient(circle, rgba(0, 212, 255, 0.3), transparent 70%)",
            }}
          />

          <div className="relative p-8 sm:p-12">
            {/* Author Header */}
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
              {/* Avatar */}
              <div
                className="flex h-28 w-28 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl sm:h-36 sm:w-36"
                style={{
                  background: author.picture
                    ? "transparent"
                    : "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                  border: "3px solid rgba(0, 212, 255, 0.25)",
                  boxShadow: "0 0 40px rgba(0, 212, 255, 0.15), 0 20px 40px -10px rgba(0, 0, 0, 0.4)",
                }}
              >
                {author.picture ? (
                  <Image
                    src={author.picture}
                    alt={author.name}
                    width={144}
                    height={144}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span
                    className="text-5xl font-bold"
                    style={{ color: "white" }}
                  >
                    {author.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Name and Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1
                  className="font-display text-2xl font-bold tracking-tight sm:text-4xl"
                  style={{ color: "var(--text-primary)" }}
                >
                  {author.name}
                </h1>

                <p
                  className="mt-2 text-sm"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Intune Community Contributor
                </p>

                {/* Social Links */}
                {[author.githubUrl, author.linkedinUrl, author.xUrl].some(Boolean) && (
                  <div className="mt-5 flex flex-wrap justify-center gap-3 sm:justify-start">
                    {author.githubUrl && (
                      <a
                        href={author.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:scale-105"
                        style={{
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          color: "var(--text-secondary)",
                        }}
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
                    )}
                    {author.linkedinUrl && (
                      <a
                        href={author.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:scale-105"
                        style={{
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          color: "var(--text-secondary)",
                        }}
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
                    )}
                    {author.xUrl && (
                      <a
                        href={author.xUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:scale-105"
                        style={{
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        X
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Client-side interactive sections (stats, expertise, tools grid) */}
            <AuthorPageClient
              tools={author.tools}
              toolIds={toolIds}
              authorName={author.name}
              totalStars={totalStars}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
