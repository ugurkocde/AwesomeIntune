"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import { CharReveal } from "./TextReveal";
import { trackSponsorClick } from "~/lib/plausible";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  // Single viewport detection for both text animations to prevent race conditions on mobile
  const isHeadlineInView = useInView(headlineRef, { once: true, margin: "-50px" });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Subtle Center Glow - Static for performance */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="h-[400px] w-[800px] rounded-full opacity-15 blur-[120px]"
          style={{
            background:
              "radial-gradient(ellipse, var(--accent-primary) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Main Content */}
      <motion.div
        style={{ y, opacity, scale }}
        className="container-main relative z-10 flex min-h-screen flex-col items-center justify-center"
      >
        <div className="mx-auto max-w-5xl text-center">
          {/* Main Headline */}
          <h1
            ref={headlineRef}
            className="font-display text-6xl font-black leading-[0.95] tracking-tight md:text-7xl lg:text-[9rem]"
          >
            <span className="block">
              <CharReveal className="text-gradient" delay={0.2} isAnimating={isHeadlineInView}>
                AWESOME
              </CharReveal>
            </span>
            <span className="block" style={{ color: "var(--text-primary)" }}>
              <CharReveal delay={0.6} isAnimating={isHeadlineInView}>INTUNE</CharReveal>
            </span>
          </h1>

          {/* Single Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-8 max-w-xl text-lg md:text-xl"
            style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}
          >
            The community toolkit for Microsoft Intune.
            <br />
            <span style={{ color: "var(--text-tertiary)" }}>
              Curated by experts, trusted by thousands.
            </span>
          </motion.p>

          {/* Single CTA - Simple button without magnetic effect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12"
          >
            <motion.a
              href="#tools"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-10 py-5 text-lg font-semibold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <span
                className="absolute inset-0 transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(0,212,255,0.4)]"
                style={{
                  background:
                    "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                }}
              />
              <span
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))",
                }}
              />
              <span className="relative z-10 flex items-center gap-3 text-[var(--bg-primary)]">
                Explore Tools
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform duration-300 group-hover:translate-y-0.5"
                >
                  <path d="M12 5v14" />
                  <path d="m19 12-7 7-7-7" />
                </svg>
              </span>
            </motion.a>
          </motion.div>

          {/* Sponsor Section */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 flex flex-col items-center gap-3"
          >
            <span
              className="text-[11px] font-medium uppercase tracking-[0.2em]"
              style={{ color: "var(--text-tertiary)", opacity: 0.7 }}
            >
              Sponsored by
            </span>
            <a
              href="https://eido.io/?utm_source=awesome_intune"
              target="_blank"
              rel="noopener noreferrer"
              className="sponsor-logo-link group block transition-all duration-300 hover:scale-[1.02]"
              onClick={() => trackSponsorClick("eido", "hero")}
            >
              {/* Light logo for dark theme (default) */}
              <img
                src="/sponsors/eido-light.svg"
                alt="eido - Sponsor"
                className="sponsor-logo-dark h-auto w-[130px] opacity-80 transition-opacity duration-300 group-hover:opacity-100"
              />
              {/* Dark logo for light theme */}
              <img
                src="/sponsors/eido-dark.svg"
                alt="eido - Sponsor"
                className="sponsor-logo-light h-auto w-[130px] transition-opacity duration-300 group-hover:opacity-100"
              />
            </a>
          </motion.div>

        </div>

        {/* Scroll Indicator - Positioned at bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0, duration: 1 }}
          className="absolute bottom-8"
        >
          <a
            href="#tools"
            className="group inline-flex flex-col items-center gap-2 transition-transform hover:translate-y-1"
          >
            <span
              className="text-xs uppercase tracking-[0.25em] transition-colors group-hover:text-[var(--accent-primary)]"
              style={{ color: "var(--text-tertiary)" }}
            >
              Scroll
            </span>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="transition-colors group-hover:stroke-[var(--accent-primary)]"
              style={{ stroke: "var(--text-tertiary)" }}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
