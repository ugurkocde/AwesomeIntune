"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Tool } from "~/types/tool";
import {
  CATEGORY_CONFIG,
  TYPE_CONFIG,
  WORKS_WITH_CONFIG,
} from "~/lib/constants";
import { getToolSlug } from "~/lib/tools";

const MAX_TOOLS = 3;

function securityLabel(tool: Tool): string {
  const check = tool.securityCheck;
  if (!check) return tool.repoUrl ? "Not scanned" : "Curated";
  const status =
    check.status ??
    (check.filesScanned > 0 && check.passed === check.total
      ? "passed"
      : undefined);
  if (status === "passed") return "Verified";
  if (status === "failed") return "Checks failed";
  if (status === "scan_error") return "Scan error";
  if (check.filesScanned === 0) return "Not applicable";
  return `${check.passed}/${check.total} checks passed`;
}

function formatUpdated(tool: Tool): string {
  if (!tool.repoStats?.lastUpdated) return "Unknown";
  return new Date(tool.repoStats.lastUpdated).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

const ROWS: Array<{ label: string; value: (tool: Tool) => React.ReactNode }> = [
  {
    label: "Category",
    value: (tool) => CATEGORY_CONFIG[tool.category].label,
  },
  { label: "Type", value: (tool) => TYPE_CONFIG[tool.type].label },
  { label: "Author", value: (tool) => tool.author },
  { label: "Security scan", value: (tool) => securityLabel(tool) },
  {
    label: "Works with",
    value: (tool) =>
      tool.worksWith?.length
        ? tool.worksWith
            .map((tag) => WORKS_WITH_CONFIG[tag]?.label ?? tag)
            .join(", ")
        : "Not specified",
  },
  {
    label: "GitHub stars",
    value: (tool) => tool.repoStats?.stars?.toLocaleString() ?? "Unknown",
  },
  { label: "Last updated", value: (tool) => formatUpdated(tool) },
  {
    label: "Links",
    value: (tool) => (
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        <Link
          href={`/tools/${getToolSlug(tool)}`}
          className="font-semibold text-[var(--accent-primary)] hover:underline"
        >
          Details
        </Link>
        {tool.repoUrl && (
          <a
            href={tool.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[var(--accent-primary)] hover:underline"
          >
            GitHub
          </a>
        )}
        {tool.websiteUrl && (
          <a
            href={tool.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[var(--accent-primary)] hover:underline"
          >
            Website
          </a>
        )}
      </div>
    ),
  },
];

export function CompareClient({ tools }: { tools: Tool[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = (params.get("tools") ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    // Deduplicate so a repeated ID cannot create duplicate columns or keys.
    const valid = [...new Set(requested)]
      .filter((id) => tools.some((tool) => tool.id === id))
      .slice(0, MAX_TOOLS);
    if (valid.length) setSelected(valid);
  }, [tools]);

  const updateUrl = (ids: string[]) => {
    const url = ids.length ? `/compare?tools=${ids.join(",")}` : "/compare";
    window.history.replaceState(null, "", url);
  };

  const toggle = (id: string) => {
    setSelected((previous) => {
      const next = previous.includes(id)
        ? previous.filter((value) => value !== id)
        : previous.length >= MAX_TOOLS
          ? previous
          : [...previous, id];
      updateUrl(next);
      return next;
    });
  };

  const selectedTools = selected
    .map((id) => tools.find((tool) => tool.id === id))
    .filter((tool): tool is Tool => Boolean(tool));

  const candidates = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return tools
      .filter(
        (tool) =>
          !selected.includes(tool.id) &&
          (!normalized ||
            tool.name.toLowerCase().includes(normalized) ||
            tool.description.toLowerCase().includes(normalized))
      )
      .slice(0, 8);
  }, [query, selected, tools]);

  return (
    <div>
      <div
        className="rounded-2xl p-5"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <label
          htmlFor="compare-search"
          className="mb-2 block text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Add a tool {selected.length}/{MAX_TOOLS}
        </label>
        <input
          id="compare-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search 170+ tools by name or description"
          className="input"
        />

        {selected.length >= MAX_TOOLS ? (
          <p
            className="mt-3 text-sm"
            style={{ color: "var(--text-tertiary)" }}
          >
            Remove a tool below to add another.
          </p>
        ) : (
          candidates.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {candidates.map((tool) => (
                <li key={tool.id}>
                  <button
                    type="button"
                    onClick={() => toggle(tool.id)}
                    className="chip"
                  >
                    {tool.name}
                  </button>
                </li>
              ))}
            </ul>
          )
        )}
      </div>

      {selectedTools.length < 2 ? (
        <p
          className="mt-8 rounded-2xl p-6 text-center text-sm"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-secondary)",
          }}
        >
          Select at least two tools to see a comparison.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="w-40 p-3 align-bottom"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Attribute
                </th>
                {selectedTools.map((tool) => (
                  <th key={tool.id} scope="col" className="p-3 align-bottom">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/tools/${getToolSlug(tool)}`}
                        className="font-display text-base font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {tool.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggle(tool.id)}
                        aria-label={`Remove ${tool.name} from the comparison`}
                        className="rounded-md px-1.5 text-lg leading-none"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        ×
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr
                  key={row.label}
                  style={{ borderTop: "1px solid var(--border-subtle)" }}
                >
                  <th
                    scope="row"
                    className="p-3 align-top font-medium"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {row.label}
                  </th>
                  {selectedTools.map((tool) => (
                    <td
                      key={tool.id}
                      className="p-3 align-top"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {row.value(tool)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
