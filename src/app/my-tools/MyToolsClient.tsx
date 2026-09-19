"use client";

import Link from "next/link";
import type { Tool } from "~/types/tool";
import { useFavorites } from "~/hooks/useFavorites";
import { ToolCard } from "~/components/tools/ToolCard";

export function MyToolsClient({ tools }: { tools: Tool[] }) {
  const { favorites } = useFavorites();
  const saved = tools.filter((tool) => favorites.includes(tool.id));

  if (saved.length === 0) {
    return (
      <div
        className="rounded-2xl p-10 text-center"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <h2
          className="text-lg font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          No saved tools yet
        </h2>
        <p
          className="mx-auto mt-2 max-w-md text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          Browse the directory and use the bookmark button on a tool to keep it
          here for later.
        </p>
        <Link href="/#tools" className="btn btn-primary mt-6 inline-flex">
          Browse tools
        </Link>
      </div>
    );
  }

  return (
    <div
      className="grid gap-6"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(340px, 100%), 1fr))" }}
    >
      {saved.map((tool, index) => (
        <ToolCard key={tool.id} tool={tool} index={index} />
      ))}
    </div>
  );
}
