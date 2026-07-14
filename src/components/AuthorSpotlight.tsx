import Image from "next/image";
import Link from "next/link";
import type { AuthorForSpotlight } from "~/lib/tools.server";

interface AuthorSpotlightProps {
  authors: AuthorForSpotlight[];
}

export function AuthorSpotlight({ authors }: AuthorSpotlightProps) {
  const topAuthors = [...authors]
    .sort((a, b) => b.toolCount - a.toolCount || a.name.localeCompare(b.name))
    .slice(0, 6);

  if (topAuthors.length === 0) return null;

  return (
    <section className="border-y border-[color:var(--border-subtle)] bg-slate-50 py-14 sm:py-16">
      <div className="container-main">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-bold text-[var(--text-primary)]">
            Community contributors
          </h2>
          <Link
            href="/authors"
            className="text-sm font-medium text-[var(--accent-primary)] hover:text-[var(--accent-secondary)]"
          >
            View all contributors →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {topAuthors.map((author) => (
            <Link
              key={author.slug}
              href={`/authors/${author.slug}`}
              className="flex min-w-0 flex-col items-center gap-2 rounded-[14px] border border-[color:var(--border-subtle)] bg-white px-3 py-5 text-center shadow-[0_2px_10px_rgba(15,23,42,0.03)] transition-[transform,border-color,box-shadow] hover:-translate-y-0.5 hover:border-[color:var(--border-accent)] hover:shadow-[0_12px_24px_rgba(15,23,42,0.08)]"
            >
              <span className="font-display flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-lg font-bold text-[var(--accent-primary)]">
                {author.picture ? (
                  <Image
                    src={author.picture}
                    alt=""
                    width={48}
                    height={48}
                    loading="eager"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  author.name.charAt(0).toUpperCase()
                )}
              </span>
              <span className="w-full truncate text-[13px] font-semibold text-[var(--text-primary)]">
                {author.name}
              </span>
              <span className="text-[11px] text-slate-400">
                {author.toolCount} {author.toolCount === 1 ? "tool" : "tools"}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
