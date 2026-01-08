import Link from "next/link";
import Image from "next/image";
import type { Tool } from "~/types/tool";
import { TYPE_CONFIG, CATEGORY_CONFIG } from "~/lib/constants";
import { getToolAuthors } from "~/lib/tools";

interface RelatedToolsProps {
  tools: Tool[];
  currentToolId: string;
}

export function RelatedTools({ tools, currentToolId }: RelatedToolsProps) {
  const filteredTools = tools.filter((t) => t.id !== currentToolId);

  if (filteredTools.length === 0) return null;

  return (
    <div
      className="mt-10 border-t pt-8"
      style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}
    >
      <div className="mb-6 flex items-center gap-3">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-secondary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <h2
          className="text-lg font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          You might also like
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filteredTools.slice(0, 4).map((tool) => {
          const typeConfig = TYPE_CONFIG[tool.type];
          const categoryConfig = CATEGORY_CONFIG[tool.category];
          const authors = getToolAuthors(tool);
          const primaryAuthor = authors[0];

          return (
            <Link
              key={tool.id}
              href={`/tools/${tool.id}`}
              className="group relative overflow-hidden rounded-xl transition-all hover:scale-[1.02]"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div className="p-4">
                {/* Type Badge */}
                <span
                  className="mb-3 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wider"
                  style={{
                    background: `${typeConfig.color}15`,
                    color: typeConfig.color,
                    border: `1px solid ${typeConfig.color}25`,
                  }}
                >
                  {typeConfig.label}
                </span>

                {/* Tool Name */}
                <h3
                  className="text-base font-semibold transition-colors group-hover:text-[var(--accent-primary)]"
                  style={{ color: "var(--text-primary)" }}
                >
                  {tool.name}
                </h3>

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
  );
}
