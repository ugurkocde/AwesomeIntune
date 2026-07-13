"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Suspense, useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CharReveal } from "./TextReveal";
import { SponsorStrip } from "./SponsorStrip";
import { SearchBar } from "./tools/SearchBar";
import { SearchExamples } from "./tools/SearchExamples";
import { useIsMobile } from "~/hooks/useIsMobile";
import { useStats, formatNumber } from "~/hooks/useStats";
import { useDebounce } from "~/hooks/useDebounce";
import { shouldUseAiSearch } from "~/lib/aiSearch";

interface HeroProps {
  toolCount: number;
  authorCount: number;
}

/**
 * Hero search box. Writes the query to the URL (`/?q=`) so the directory below
 * reacts via its URL-synced filters, and scrolls to it on first input. Reads
 * the `q` param too, so deep links and the directory's own SearchBar keep the
 * hero input in sync. The useSearchParams call is Suspense-wrapped inside
 * HeroSearch, so only the search box bails to client-side rendering - the rest
 * of the hero stays statically rendered.
 */
function HeroSearchInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [value, setValue] = useState(urlQuery);
  const debounced = useDebounce(value, 350);
  const hasScrolledRef = useRef(false);
  const lastWrittenQueryRef = useRef(urlQuery);

  // Sync debounced input -> URL. Per-keystroke updates use replace so Back
  // does not step through query fragments.
  useEffect(() => {
    const q = debounced.trim();
    if (!q) return; // never clobber the directory's filters when the hero is empty
    if (q === lastWrittenQueryRef.current) return;
    lastWrittenQueryRef.current = q;
    router.replace(`/?q=${encodeURIComponent(q)}`, { scroll: false });
  }, [debounced, router]);

  // Sync URL -> input for external changes (deep links, the directory's
  // SearchBar, back/forward). Our own writes are skipped via the ref above.
  useEffect(() => {
    if (urlQuery === lastWrittenQueryRef.current) return;
    lastWrittenQueryRef.current = urlQuery;
    setValue(urlQuery);
  }, [urlQuery]);

  const handleChange = (next: string) => {
    setValue(next);
    if (next && !hasScrolledRef.current) {
      hasScrolledRef.current = true;
      document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" });
    }
    if (!next) hasScrolledRef.current = false;
  };

  return (
    <>
      <SearchBar
        value={value}
        onChange={handleChange}
        isAiMode={shouldUseAiSearch(debounced)}
      />
      <div className="mt-4">
        <SearchExamples isVisible={value.length === 0} onExampleClick={handleChange} />
      </div>
    </>
  );
}

function HeroSearch() {
  return (
    <div className="mx-auto w-full max-w-xl">
      <Suspense
        fallback={
          <>
            <SearchBar value="" onChange={() => undefined} />
            <div className="mt-4">
              <SearchExamples isVisible onExampleClick={() => undefined} />
            </div>
          </>
        }
      >
        <HeroSearchInner />
      </Suspense>
    </div>
  );
}

export function Hero({ toolCount, authorCount }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { isMobile } = useIsMobile();
  const { stats } = useStats();

  const shouldReduceMotion = prefersReducedMotion === true || isMobile;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], shouldReduceMotion ? [1, 1] : [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen flex-col overflow-hidden pt-24"
    >
      {/* Subtle Center Glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="h-[280px] w-[560px] rounded-full opacity-15 blur-[60px] sm:h-[360px] sm:w-[760px] sm:blur-[120px]"
          style={{
            background:
              "radial-gradient(ellipse, var(--accent-primary) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Main Content - fills the available height so the directory sits below the fold */}
      <motion.div
        style={shouldReduceMotion ? undefined : { y, opacity }}
        className="container-main relative z-10 flex flex-1 flex-col items-center justify-center text-center"
      >
        <div className="mx-auto w-full max-w-4xl">
          {/* Wordmark */}
          <h1 className="font-display text-6xl font-black leading-[0.9] tracking-tight sm:text-7xl md:text-8xl lg:text-[9rem]">
            <span className="block">
              <CharReveal className="text-gradient" delay={0.1}>
                AWESOME
              </CharReveal>
            </span>
            <span className="block" style={{ color: "var(--text-primary)" }}>
              <CharReveal delay={0.35}>INTUNE</CharReveal>
            </span>
          </h1>

          {/* Outcome subhead */}
          <p
            className="mx-auto mt-6 max-w-xl text-lg md:text-xl"
            style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}
          >
            {toolCount}+ free, security-scanned and community-vetted tools for Microsoft Intune.{" "}
            <br className="hidden sm:block" />
            <span style={{ color: "var(--text-tertiary)" }}>
              Describe your problem - find the right tool in seconds.
            </span>
          </p>

          {/* Embedded search */}
          <div className="mt-8">
            <HeroSearch />
          </div>

          {/* Proof row */}
          <div
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm"
            style={{ color: "var(--text-tertiary)" }}
          >
            <ProofItem value={`${toolCount}+`} label="tools" />
            <Dot />
            <ProofItem value={`${authorCount}+`} label="contributors" />
            {stats && stats.totalViews > 0 && (
              <>
                <Dot />
                <ProofItem value={formatNumber(stats.totalViews)} label="views" />
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Sponsors anchored at the bottom of the full-height hero */}
      <SponsorStrip />
    </section>
  );
}

function ProofItem({ value, label }: { value: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span style={{ color: "var(--accent-primary)", fontWeight: 600 }}>{value}</span>
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
    </span>
  );
}

function Dot() {
  return (
    <span aria-hidden className="opacity-40">
      &middot;
    </span>
  );
}
