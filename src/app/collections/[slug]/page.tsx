import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  getCollectionBySlug,
  getAllCollectionSlugs,
  getCollectionTools,
} from "~/lib/tools.server";
import { getToolAuthors } from "~/lib/tools";
import {
  SITE_CONFIG,
  TYPE_CONFIG,
  CATEGORY_CONFIG,
  COLLECTION_ICONS,
} from "~/lib/constants";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllCollectionSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    return {
      title: "Collection Not Found",
    };
  }

  return {
    title: `${collection.title} - ${SITE_CONFIG.name}`,
    description: collection.description,
    openGraph: {
      title: `${collection.title} - ${SITE_CONFIG.name}`,
      description: collection.description,
      type: "website",
      url: `${SITE_CONFIG.url}/collections/${slug}`,
    },
  };
}

// Icon components
function BookOpenIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function RocketIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

function SettingsIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function AppleIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function PackageIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function BugIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m8 2 1.88 1.88" />
      <path d="M14.12 3.88 16 2" />
      <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
      <path d="M12 20v-9" />
      <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
      <path d="M6 13H2" />
      <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
      <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
      <path d="M22 13h-4" />
      <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
    </svg>
  );
}

function LayersIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 12.18-8.58 3.91a2 2 0 0 1-1.66 0L2.6 12.09" />
      <path d="m22 17.18-8.58 3.91a2 2 0 0 1-1.66 0L2.6 17.09" />
    </svg>
  );
}

const iconComponents = {
  "book-open": BookOpenIcon,
  rocket: RocketIcon,
  settings: SettingsIcon,
  apple: AppleIcon,
  package: PackageIcon,
  bug: BugIcon,
  layers: LayersIcon,
};

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const tools = getCollectionTools(collection);
  const iconConfig = COLLECTION_ICONS[collection.slug] ?? {
    icon: "layers" as const,
    color: "#00d4ff",
  };
  const IconComponent = iconComponents[iconConfig.icon];

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Atmospheric Background Glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 212, 255, 0.08), transparent 70%)",
        }}
      />

      {/* Content Container */}
      <div className="relative mx-auto max-w-4xl px-6 pb-20 pt-24 sm:pb-32 sm:pt-28">
        {/* Breadcrumb Navigation */}
        <nav className="mb-8 flex items-center gap-2 text-sm sm:mb-12">
          <Link
            href="/collections"
            className="transition-colors hover:text-[var(--accent-primary)]"
            style={{ color: "var(--text-secondary)" }}
          >
            Collections
          </Link>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-tertiary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span style={{ color: "var(--text-primary)" }}>{collection.title}</span>
        </nav>

        {/* Collection Card */}
        <article
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
            className="absolute left-0 right-0 top-0 h-1"
            style={{
              background: `linear-gradient(90deg, transparent 10%, ${iconConfig.color}, transparent 90%)`,
            }}
          />

          <div className="relative p-8 sm:p-12">
            {/* Icon Header */}
            <div
              className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
              style={{
                background: `${iconConfig.color}15`,
                border: `1px solid ${iconConfig.color}30`,
                boxShadow: `0 0 60px ${iconConfig.color}25`,
              }}
            >
              <IconComponent
                className="h-10 w-10"
                style={{ color: iconConfig.color }}
              />
            </div>

            {/* Collection Title */}
            <h1
              className="font-display text-2xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
              style={{ color: "var(--text-primary)" }}
            >
              {collection.title}
            </h1>

            {/* Description */}
            <p
              className="mt-6 text-lg leading-relaxed sm:text-xl"
              style={{ color: "var(--text-secondary)" }}
            >
              {collection.description}
            </p>

            {/* Tool Count */}
            <div
              className="mt-6 inline-flex items-center gap-2 rounded-lg px-4 py-2"
              style={{
                background: `${iconConfig.color}10`,
                border: `1px solid ${iconConfig.color}20`,
              }}
            >
              <span
                className="text-2xl font-bold"
                style={{ color: iconConfig.color }}
              >
                {tools.length}
              </span>
              <span
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {tools.length === 1 ? "Tool" : "Tools"}
              </span>
            </div>

            {/* Tools Section */}
            <div
              className="mt-10 border-t pt-8"
              style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}
            >
              <h2
                className="mb-6 text-lg font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Tools in this collection
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                {tools.map((tool) => {
                  const typeConfig = TYPE_CONFIG[tool.type];
                  const categoryConfig = CATEGORY_CONFIG[tool.category];
                  const authors = getToolAuthors(tool);
                  const primaryAuthor = authors[0];

                  return (
                    <Link
                      key={tool.id}
                      href={`/tools/${tool.id}`}
                      className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02]"
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      {/* Hover glow */}
                      <div
                        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{
                          background: `radial-gradient(circle at 50% 0%, ${typeConfig.color}10, transparent 70%)`,
                        }}
                      />

                      {/* Hover border */}
                      <div
                        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{
                          boxShadow: `inset 0 0 0 1px ${typeConfig.color}30`,
                        }}
                      />

                      <div className="relative p-4">
                        {/* Badges */}
                        <div className="mb-3 flex flex-wrap gap-2">
                          <span
                            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wider"
                            style={{
                              background: `${typeConfig.color}15`,
                              color: typeConfig.color,
                              border: `1px solid ${typeConfig.color}25`,
                            }}
                          >
                            {typeConfig.label}
                          </span>
                          <span
                            className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
                            style={{
                              background: `${categoryConfig.color}12`,
                              color: categoryConfig.color,
                            }}
                          >
                            {categoryConfig.label}
                          </span>
                        </div>

                        {/* Tool Name with Arrow */}
                        <div className="flex items-start justify-between gap-2">
                          <h3
                            className="text-base font-semibold transition-colors duration-300 group-hover:text-[var(--accent-primary)]"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {tool.name}
                          </h3>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--text-tertiary)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mt-1 flex-shrink-0 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 group-hover:stroke-[var(--accent-primary)]"
                          >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </div>

                        {/* Description */}
                        <p
                          className="mt-1.5 line-clamp-2 text-sm"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {tool.description}
                        </p>

                        {/* Author */}
                        <div className="mt-3 flex items-center gap-2">
                          {primaryAuthor?.picture ? (
                            <Image
                              src={primaryAuthor.picture}
                              alt={primaryAuthor.name}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                          ) : (
                            <div
                              className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
                              style={{
                                background: `${categoryConfig.color}30`,
                                color: categoryConfig.color,
                              }}
                            >
                              {primaryAuthor?.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            {primaryAuthor?.name}
                            {authors.length > 1 && ` +${authors.length - 1}`}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
