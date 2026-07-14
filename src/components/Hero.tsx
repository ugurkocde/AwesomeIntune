"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SponsorStrip } from "./SponsorStrip";
import { SearchBar } from "./tools/SearchBar";
import { shouldUseAiSearch } from "~/lib/aiSearch";
import { CATEGORY_CONFIG, TYPE_CONFIG } from "~/lib/constants";
import { isVerified } from "~/lib/tools";
import type { Tool, ToolCategory } from "~/types/tool";

interface HeroProps {
  tools: Tool[];
  toolCount: number;
  authorCount: number;
  verifiedCount: number;
}

function HeroSearchInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [value, setValue] = useState(urlQuery);
  const isHandoffPending = useRef(false);

  const handoffToDirectory = useCallback(() => {
    requestAnimationFrame(() => {
      const toolsSection = document.getElementById("tools");
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const isMobile = window.matchMedia("(max-width: 639px)").matches;

      toolsSection?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });

      if (isMobile) {
        (document.activeElement as HTMLElement | null)?.blur();
        document
          .getElementById("tool-results-heading")
          ?.focus({ preventScroll: true });
      } else {
        document
          .getElementById("directory-search")
          ?.focus({ preventScroll: true });
      }
    });
  }, []);

  useEffect(() => {
    setValue(urlQuery);
    if (isHandoffPending.current) {
      isHandoffPending.current = false;
      handoffToDirectory();
    }
  }, [handoffToDirectory, urlQuery]);

  const handleSubmit = () => {
    const query = value.trim();
    if (query === urlQuery.trim()) {
      handoffToDirectory();
      return;
    }

    isHandoffPending.current = true;
    router.replace(
      query ? `/?q=${encodeURIComponent(query)}#tools` : "/#tools",
    );
  };

  return (
    <SearchBar
      value={value}
      onChange={setValue}
      onSubmit={handleSubmit}
      inputId="hero-search"
      ariaControls="tool-search-results"
      placeholder="Describe your problem, e.g. “devices not syncing”…"
      isAiMode={shouldUseAiSearch(value)}
    />
  );
}

function HeroSearch() {
  return (
    <Suspense
      fallback={
        <SearchBar
          value=""
          onChange={() => undefined}
          onSubmit={() => undefined}
          inputId="hero-search"
          ariaControls="tool-search-results"
          placeholder="Describe your problem, e.g. “devices not syncing”…"
        />
      }
    >
      <HeroSearchInner />
    </Suspense>
  );
}

export function Hero({
  tools,
  toolCount,
  authorCount,
  verifiedCount,
}: HeroProps) {
  const newestTools = useMemo(
    () =>
      [...tools]
        .sort(
          (a, b) =>
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
        )
        .slice(0, 5),
    [tools],
  );

  const categoryStats = useMemo(() => {
    const counts = new Map<ToolCategory, number>();
    tools.forEach((tool) =>
      counts.set(tool.category, (counts.get(tool.category) ?? 0) + 1),
    );
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [tools]);

  return (
    <section className="pt-[68px]">
      <div className="container-main grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.2fr_0.9fr] lg:gap-16 lg:py-[72px]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(0,120,212,0.2)] bg-[rgba(0,120,212,0.08)] px-3.5 py-1.5 text-xs font-semibold text-[var(--accent-primary)]">
            <ShieldCheckIcon className="h-3.5 w-3.5" />
            Every tool security-scanned or hand-vetted
          </span>

          <h1 className="font-display mt-5 max-w-3xl text-[clamp(3rem,6vw,3.875rem)] leading-[1.03] font-extrabold tracking-[-0.03em] text-balance text-[var(--text-primary)]">
            Every Intune tool worth knowing.
          </h1>
          <p className="mt-[18px] max-w-[520px] text-base leading-[1.65] text-[var(--text-secondary)] sm:text-lg">
            {toolCount}+ free tools, scripts and modules, curated by the
            community, scanned for security, and searchable by the problem you
            are facing.
          </p>

          <div className="mt-[30px] max-w-[540px]">
            <HeroSearch />
            <div
              className="mt-3.5 flex flex-wrap gap-2"
              aria-label="Popular categories"
            >
              {categoryStats.map(([category, count]) => {
                const config = CATEGORY_CONFIG[category];
                return (
                  <Link
                    key={category}
                    href={`/?category=${category}#tools`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border-subtle)] bg-white px-3 py-1.5 text-[13px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[color:var(--border-accent)] hover:text-[var(--accent-primary)]"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: config.color }}
                      aria-hidden="true"
                    />
                    {config.label}
                    <span className="text-slate-400">{count}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-stretch gap-5 sm:gap-7">
            <Stat value={`${toolCount}+`} label="free tools" />
            <Divider />
            <Stat
              value={String(verifiedCount)}
              label="passed all 6 security checks"
            />
            <Divider />
            <Stat value={`${authorCount}+`} label="community contributors" />
          </div>
        </div>

        <aside
          className="self-start rounded-2xl border border-[color:var(--border-subtle)] bg-white p-2 shadow-[0_20px_50px_rgba(15,23,42,0.07)]"
          aria-label="Newest additions"
        >
          <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5">
            <h2 className="font-display text-sm font-bold text-[var(--text-primary)]">
              Newest additions
            </h2>
            <Link
              href="#tools"
              className="text-xs font-medium text-[var(--accent-primary)] hover:text-[var(--accent-secondary)]"
            >
              All tools →
            </Link>
          </div>
          <div>
            {newestTools.map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.id}`}
                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-slate-100"
              >
                <span className="font-display flex h-[34px] w-[34px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-bold text-[var(--accent-primary)]">
                  {tool.authorPicture ? (
                    <Image
                      src={tool.authorPicture}
                      alt=""
                      width={34}
                      height={34}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    tool.author.charAt(0).toUpperCase()
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-[var(--text-primary)]">
                    {tool.name}
                  </span>
                  <span className="block truncate text-xs text-[var(--text-tertiary)]">
                    {TYPE_CONFIG[tool.type].label} · {tool.author}
                  </span>
                </span>
                {isVerified(tool) && (
                  <ShieldCheckIcon className="h-4 w-4 shrink-0 text-[var(--signal-success)]" />
                )}
              </Link>
            ))}
          </div>
        </aside>
      </div>

      <SponsorStrip />
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="max-w-[150px]">
      <div className="font-display text-[26px] leading-none font-extrabold text-[var(--text-primary)]">
        {value}
      </div>
      <div className="mt-1 text-xs leading-tight text-[var(--text-tertiary)]">
        {label}
      </div>
    </div>
  );
}

function Divider() {
  return <span className="w-px bg-[var(--border-subtle)]" aria-hidden="true" />;
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
