"use client";

import { motion, useScroll, useTransform, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { CharReveal } from "./TextReveal";
import { trackSponsorClick } from "~/lib/plausible";
import { useIsMobile } from "~/hooks/useIsMobile";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { isMobile } = useIsMobile();

  // Disable heavy animations on mobile or when user prefers reduced motion
  // prefersReducedMotion returns true/false/null, so we check explicitly
  const shouldReduceMotion = prefersReducedMotion === true || isMobile;

  // Single viewport detection for both text animations to prevent race conditions on mobile
  const isHeadlineInView = useInView(headlineRef, { once: true, margin: "-50px" });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Disable parallax scroll transforms on mobile for better performance
  const y = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], shouldReduceMotion ? [1, 1] : [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], shouldReduceMotion ? [1, 1] : [1, 0.95]);

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Subtle Center Glow - Static for performance, reduced blur on mobile */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="h-[300px] w-[600px] rounded-full opacity-15 blur-[60px] sm:h-[400px] sm:w-[800px] sm:blur-[120px]"
          style={{
            background:
              "radial-gradient(ellipse, var(--accent-primary) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Main Content */}
      <motion.div
        style={shouldReduceMotion ? undefined : { y, opacity, scale }}
        className="container-main relative z-10 flex min-h-screen flex-col items-center justify-center will-change-transform"
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
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
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
                  className="sponsor-logo-dark h-auto w-[120px] sm:w-[160px] opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                />
                {/* Dark logo for light theme */}
                <img
                  src="/sponsors/eido-dark.svg"
                  alt="eido - Sponsor"
                  className="sponsor-logo-light h-auto w-[120px] sm:w-[160px] transition-opacity duration-300 group-hover:opacity-100"
                />
              </a>
              <a
                href="https://zerotouch.ai/?utm_source=awesome_intune"
                target="_blank"
                rel="noopener noreferrer"
                className="sponsor-logo-link group block transition-all duration-300 hover:scale-[1.02]"
                onClick={() => trackSponsorClick("zerotouch", "hero")}
              >
                {/* Light logo for dark theme (default) */}
                <img
                  src="/sponsors/zerotouch-light.png"
                  alt="ZeroTouch - Sponsor"
                  className="sponsor-logo-dark h-[60px] sm:h-[80px] w-auto opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                />
                {/* Dark logo for light theme */}
                <img
                  src="/sponsors/zerotouch-dark.png"
                  alt="ZeroTouch - Sponsor"
                  className="sponsor-logo-light h-[60px] sm:h-[80px] w-auto transition-opacity duration-300 group-hover:opacity-100"
                />
              </a>
              <a
                href="https://www.recastsoftware.com/?utm_source=sponsored_writer&utm_medium=referral&utm_campaign=awesomeintune"
                target="_blank"
                rel="noopener noreferrer"
                className="group block transition-all duration-300 hover:scale-[1.02]"
                onClick={() => trackSponsorClick("recast", "hero")}
              >
                <img
                  src="/sponsors/recast.png"
                  alt="Recast - Sponsor"
                  className="h-[52px] sm:h-[68px] w-auto opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                />
              </a>
              <a
                href="https://devicie.com/?utm_source=awesome_intune"
                target="_blank"
                rel="noopener noreferrer"
                className="group block transition-all duration-300 hover:scale-[1.02]"
                onClick={() => trackSponsorClick("devicie", "hero")}
              >
                <img
                  src="/sponsors/devicie.png"
                  alt="Devicie - Sponsor"
                  className="h-[70px] sm:h-[90px] w-auto opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                />
              </a>
            </div>
          </motion.div>

        </div>

        {/* Scroll Indicator - Positioned at bottom, hidden on short viewports to avoid overlap with sponsors */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0, duration: 1 }}
          className="absolute bottom-8 hidden [@media(min-height:800px)]:block"
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
