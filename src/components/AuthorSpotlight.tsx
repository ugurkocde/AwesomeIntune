"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import type { AuthorForSpotlight } from "~/lib/tools.server";
import type { ViewCounts } from "~/hooks/useViewTracking";
import { formatViewCount } from "~/hooks/useViewTracking";

interface AuthorSpotlightProps {
  authors: AuthorForSpotlight[];
}

export function AuthorSpotlight({ authors }: AuthorSpotlightProps) {
  const [viewCounts, setViewCounts] = useState<ViewCounts>({});
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Fetch view counts
  useEffect(() => {
    let isMounted = true;

    const fetchViewCounts = async () => {
      try {
        const response = await fetch("/api/views");
        if (response.ok && isMounted) {
          const counts = (await response.json()) as ViewCounts;
          setViewCounts(counts);
        }
      } catch (error) {
        console.error("Failed to fetch view counts:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchViewCounts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sort authors by impact (total views across their tools) and take top 6
  const topAuthors = useMemo(() => {
    const authorsWithImpact = authors.map((author) => {
      const impact = author.toolIds.reduce(
        (sum, id) => sum + (viewCounts[id] ?? 0),
        0
      );
      return { ...author, impact };
    });

    return authorsWithImpact
      .sort((a, b) => {
        // Sort by impact descending
        if (b.impact !== a.impact) return b.impact - a.impact;
        // Secondary sort by tool count
        if (b.toolCount !== a.toolCount) return b.toolCount - a.toolCount;
        // Tertiary sort by name for stability
        return a.name.localeCompare(b.name);
      })
      .slice(0, 6);
  }, [authors, viewCounts]);

  // Scroll handlers
  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 300;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-16 sm:py-24"
      style={{ background: "rgba(0, 0, 0, 0.2)" }}
    >
      {/* Subtle top gradient */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 10%, rgba(0, 212, 255, 0.2), transparent 90%)",
        }}
      />

      <div className="container-main">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h2
                className="text-xl font-bold sm:text-2xl md:text-3xl"
                style={{ color: "var(--text-primary)" }}
              >
                Community Contributors
              </h2>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium sm:gap-1.5 sm:px-3 sm:py-1 sm:text-xs"
                style={{
                  background: "rgba(139, 92, 246, 0.12)",
                  border: "1px solid rgba(139, 92, 246, 0.2)",
                  color: "#8b5cf6",
                }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="sm:h-3 sm:w-3"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                Ranked by impact
              </span>
            </div>
            <p
              className="mt-1.5 text-xs sm:mt-2 sm:text-sm md:text-base"
              style={{ color: "var(--text-secondary)" }}
            >
              Top contributors sorted by total views across their tools
            </p>
          </div>

          {/* Desktop Navigation Arrows */}
          <div className="hidden gap-2 sm:flex">
            <button
              onClick={() => scroll("left")}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:scale-105"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
              aria-label="Scroll left"
            >
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
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:scale-105"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
              aria-label="Scroll right"
            >
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
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative -mx-4 sm:mx-0">
          {/* Gradient fade edges - desktop only */}
          <div
            className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 hidden w-8 sm:block"
            style={{
              background:
                "linear-gradient(to right, var(--bg-primary), transparent)",
            }}
          />
          <div
            className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 hidden w-8 sm:block"
            style={{
              background:
                "linear-gradient(to left, var(--bg-primary), transparent)",
            }}
          />

          {/* Scrollable container */}
          <div
            ref={scrollContainerRef}
            className="scrollbar-hide flex gap-3 overflow-x-auto px-4 pb-4 sm:gap-4 sm:px-0"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {topAuthors.map((author, index) => (
              <motion.div
                key={author.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{ scrollSnapAlign: "start" }}
              >
                <AuthorCard
                  author={author}
                  isLoading={isLoading}
                />
              </motion.div>
            ))}
          </div>

          {/* Mobile scroll hint */}
          <div className="mt-3 flex items-center justify-center gap-1.5 sm:hidden">
            <span
              className="text-[10px] uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              Swipe to explore
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-tertiary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

interface AuthorCardProps {
  author: AuthorForSpotlight & { impact: number };
  isLoading: boolean;
}

function AuthorCard({ author, isLoading }: AuthorCardProps) {
  return (
    <Link
      href={`/authors/${author.slug}`}
      className="group relative flex w-[240px] flex-shrink-0 flex-col overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg sm:w-[280px] sm:rounded-2xl"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Hover gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(0, 212, 255, 0.08), transparent 70%)",
        }}
      />

      {/* Top accent line on hover */}
      <div
        className="absolute left-0 right-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(90deg, transparent 10%, rgba(0, 212, 255, 0.5), transparent 90%)",
        }}
      />

      <div className="relative p-4 sm:p-5">
        {/* Avatar and Name */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Avatar */}
          <div
            className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full sm:h-16 sm:w-16"
            style={{
              background: author.picture
                ? undefined
                : "linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(139, 92, 246, 0.3))",
              border: "2px solid rgba(0, 212, 255, 0.2)",
            }}
          >
            {author.picture ? (
              <Image
                src={author.picture}
                alt={author.name}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            ) : (
              <span
                className="text-base font-bold sm:text-xl"
                style={{ color: "var(--accent-primary)" }}
              >
                {author.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            )}
          </div>

          {/* Name and Tool Count */}
          <div className="min-w-0 flex-1">
            <h3
              className="truncate text-sm font-semibold transition-colors duration-200 group-hover:text-[var(--accent-primary)] sm:text-base"
              style={{ color: "var(--text-primary)" }}
            >
              {author.name}
            </h3>
            <p
              className="mt-0.5 text-[11px] sm:text-xs"
              style={{ color: "var(--text-tertiary)" }}
            >
              {author.toolCount} {author.toolCount === 1 ? "tool" : "tools"}
            </p>
          </div>
        </div>

        {/* Impact Score */}
        <div className="mt-3 flex items-center gap-2 sm:mt-4">
          <div
            className="flex items-center gap-1 rounded-lg px-2 py-1 sm:gap-1.5 sm:px-3 sm:py-1.5"
            style={{
              background: "rgba(139, 92, 246, 0.12)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="sm:h-3.5 sm:w-3.5"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            {isLoading ? (
              <span className="h-3 w-6 animate-pulse rounded bg-white/10 sm:h-4 sm:w-8" />
            ) : (
              <span className="text-xs font-semibold sm:text-sm" style={{ color: "#8b5cf6" }}>
                {formatViewCount(author.impact)}
              </span>
            )}
            <span className="text-[10px] sm:text-xs" style={{ color: "var(--text-tertiary)" }}>
              impact
            </span>
          </div>
        </div>

        {/* Top Tools */}
        {author.topTools.length > 0 && (
          <div className="mt-3 sm:mt-4">
            <p
              className="mb-1.5 text-[9px] font-medium uppercase tracking-wider sm:mb-2 sm:text-[10px]"
              style={{ color: "var(--text-tertiary)" }}
            >
              Top Tools
            </p>
            <div className="flex flex-wrap gap-1 sm:gap-1.5">
              {author.topTools.map((tool) => (
                <span
                  key={tool.id}
                  className="inline-block max-w-[100px] truncate rounded-md px-1.5 py-0.5 text-[10px] sm:max-w-[120px] sm:px-2 sm:py-1 sm:text-xs"
                  style={{
                    background: "rgba(0, 212, 255, 0.08)",
                    color: "var(--text-secondary)",
                    border: "1px solid rgba(0, 212, 255, 0.12)",
                  }}
                  title={tool.name}
                >
                  {tool.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Arrow indicator */}
        <div
          className="absolute bottom-3 right-3 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 sm:bottom-4 sm:right-4"
          style={{ color: "var(--accent-primary)" }}
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
            className="sm:h-4 sm:w-4"
          >
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
