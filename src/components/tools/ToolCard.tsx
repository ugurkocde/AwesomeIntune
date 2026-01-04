"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState, useEffect, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Tool } from "~/types/tool";
import { TYPE_CONFIG, CATEGORY_CONFIG } from "~/lib/constants";

interface ToolCardProps {
  tool: Tool;
  index?: number;
  aiExplanation?: string;
  confidenceScore?: number;
}

export function ToolCard({ tool, index = 0, aiExplanation, confidenceScore }: ToolCardProps) {
  const router = useRouter();
  const typeConfig = TYPE_CONFIG[tool.type];
  const categoryConfig = CATEGORY_CONFIG[tool.category];
  const cardRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Mouse position for 3D tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring config for smooth animation
  const springConfig = { damping: 20, stiffness: 300 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);

  // Glow position
  const glowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), springConfig);
  const glowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), springConfig);

  // Create transformed background gradients at top level to avoid hydration mismatch
  const glowBackground = useTransform(
    [glowX, glowY],
    ([x, y]: number[]) =>
      `radial-gradient(600px circle at ${String(x)}% ${String(y)}%, ${typeConfig.color}15, transparent 40%)`
  );

  const shineBackground = useTransform(
    [glowX, glowY],
    ([x, _y]: number[]) =>
      `linear-gradient(${135 + (Number(x) - 50) * 0.5}deg, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 60%)`
  );

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleCardClick = () => {
    router.push(`/tools/${tool.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="block cursor-pointer"
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <motion.article
        ref={cardRef}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{
          duration: 0.6,
          delay: index * 0.08,
          ease: [0.22, 1, 0.36, 1],
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          transformPerspective: 1000,
        }}
        className="group relative"
      >
      {/* Card Container */}
      <motion.div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: "rgba(17, 25, 34, 0.8)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
        whileHover={{
          scale: 1.02,
          borderColor: `${typeConfig.color}40`,
          boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 60px -15px ${typeConfig.color}30`,
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Dynamic Glow Effect */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: isMounted
              ? glowBackground
              : `radial-gradient(600px circle at 50% 50%, ${typeConfig.color}15, transparent 40%)`,
          }}
        />

        {/* Top Accent Gradient */}
        <div
          className="absolute left-0 right-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `linear-gradient(90deg, transparent, ${typeConfig.color}, transparent)`,
          }}
        />

        {/* 3D Shine Effect */}
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: isMounted
              ? shineBackground
              : `linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 60%)`,
          }}
        />

        <div className="relative p-6" style={{ transform: "translateZ(50px)" }}>
          {/* Header Row */}
          <div className="mb-4 flex items-start justify-between">
            {/* Type Badge */}
            <motion.span
              className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider"
              style={{
                background: `${typeConfig.color}15`,
                color: typeConfig.color,
                border: `1px solid ${typeConfig.color}25`,
                boxShadow: `0 0 20px ${typeConfig.color}10`,
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: `0 0 25px ${typeConfig.color}20`,
              }}
            >
              {tool.type === "powershell-module" || tool.type === "powershell-script" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.181 2.974c.568.3.819.972.568 1.525l-8.167 17.03c-.317.687-1.186.823-1.687.345l-4.59-4.374c-.318-.303-.352-.805-.079-1.143l5.083-6.283-5.818 3.333c-.48.274-1.085.105-1.37-.384l-4.922-8.458c-.303-.52-.112-1.193.426-1.492l20.556-1.099z" />
                </svg>
              ) : tool.type === "web-app" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              )}
              {typeConfig.label}
            </motion.span>
          </div>

          {/* Tool Name */}
          <h3
            className="font-display text-xl font-bold leading-tight transition-colors duration-300 group-hover:text-[var(--accent-primary)]"
            style={{ color: "var(--text-primary)" }}
          >
            {tool.name}
          </h3>

          {/* Description */}
          <p
            className="mt-3 line-clamp-2 text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {tool.description}
          </p>

          {/* AI Explanation */}
          {aiExplanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-lg p-3"
              style={{
                background: "rgba(0, 212, 255, 0.05)",
                border: "1px solid rgba(0, 212, 255, 0.15)",
              }}
            >
              <div className="flex items-start gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--accent-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5 flex-shrink-0"
                >
                  <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
                </svg>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    {confidenceScore !== undefined && (
                      <span
                        className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold"
                        style={{
                          background: confidenceScore >= 90
                            ? "rgba(16, 185, 129, 0.15)"
                            : "rgba(0, 212, 255, 0.15)",
                          color: confidenceScore >= 90
                            ? "rgb(16, 185, 129)"
                            : "var(--accent-primary)",
                          border: confidenceScore >= 90
                            ? "1px solid rgba(16, 185, 129, 0.3)"
                            : "1px solid rgba(0, 212, 255, 0.3)",
                        }}
                      >
                        {confidenceScore}% match
                      </span>
                    )}
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--accent-primary)" }}
                  >
                    {aiExplanation}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Author */}
          <div className="mt-5 flex items-center gap-3">
            <motion.div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold"
              style={{
                background: tool.authorPicture
                  ? "transparent"
                  : `linear-gradient(135deg, ${categoryConfig.color}40, ${categoryConfig.color}20)`,
                color: categoryConfig.color,
                border: `1px solid ${categoryConfig.color}30`,
              }}
              whileHover={{ scale: 1.1 }}
            >
              {tool.authorPicture ? (
                <Image
                  src={tool.authorPicture}
                  alt={tool.author}
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              ) : (
                tool.author.charAt(0).toUpperCase()
              )}
            </motion.div>
            <div>
              {tool.githubUrl ? (
                <a
                  href={tool.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm font-medium transition-colors hover:text-[var(--accent-primary)]"
                  style={{ color: "var(--text-primary)" }}
                >
                  {tool.author}
                </a>
              ) : (
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {tool.author}
                </span>
              )}
              <div className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                {categoryConfig.label}
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div
            className="mt-6 flex items-center gap-3 border-t pt-5"
            style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
          >
            {/* View Details Link */}
            <Link
              href={`/tools/${tool.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all hover:bg-white/5 hover:text-[var(--text-primary)]"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                color: "var(--text-secondary)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Details
            </Link>
            {tool.repoUrl && (
              <motion.a
                href={tool.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  color: "var(--text-secondary)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                }}
                whileHover={{
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "var(--text-primary)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </motion.a>
            )}
            {tool.downloadUrl && (
              <motion.a
                href={tool.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium"
                style={{
                  background: `linear-gradient(135deg, ${typeConfig.color}, ${typeConfig.color}cc)`,
                  color: "white",
                  boxShadow: `0 4px 15px ${typeConfig.color}30`,
                }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: `0 6px 20px ${typeConfig.color}40`,
                }}
                whileTap={{ scale: 0.98 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download
              </motion.a>
            )}
            {tool.websiteUrl && !tool.downloadUrl && (
              <motion.a
                href={tool.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium"
                style={{
                  background: `linear-gradient(135deg, ${typeConfig.color}, ${typeConfig.color}cc)`,
                  color: "white",
                  boxShadow: `0 4px 15px ${typeConfig.color}30`,
                }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: `0 6px 20px ${typeConfig.color}40`,
                }}
                whileTap={{ scale: 0.98 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                Visit
              </motion.a>
            )}
          </div>
        </div>
      </motion.div>
      </motion.article>
    </div>
  );
}
