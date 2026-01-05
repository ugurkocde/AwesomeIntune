"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { GITHUB_RAW_BASE_URL } from "~/lib/constants";

interface ScreenshotGalleryProps {
  screenshots: string[];
  toolName: string;
  accentColor: string;
}

// In development, serve from local API route
// In production, serve from GitHub raw URLs
// Screenshots are stored in public/screenshots/ so we need to prepend 'public/' for GitHub raw URLs
function getScreenshotUrl(path: string): string {
  if (process.env.NODE_ENV === "development") {
    return `/api/screenshots/${path}`;
  }
  return `${GITHUB_RAW_BASE_URL}/public/${path}`;
}

export function ScreenshotGallery({
  screenshots,
  toolName,
  accentColor,
}: ScreenshotGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [lightboxImageLoaded, setLightboxImageLoaded] = useState(false);

  // Track mount state for portal (SSR safety)
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Check for already-loaded images after hydration (handles cached images)
  useEffect(() => {
    if (!isMounted) return;

    const alreadyLoaded = new Set<number>();
    imageRefs.current.forEach((img, index) => {
      if (img && img.complete && img.naturalWidth > 0) {
        alreadyLoaded.add(index);
      }
    });

    if (alreadyLoaded.size > 0) {
      setLoadedImages((prev) => new Set([...prev, ...alreadyLoaded]));
    }
  }, [isMounted]);

  // Reset lightbox image loaded state when changing images
  useEffect(() => {
    setLightboxImageLoaded(false);
  }, [lightboxIndex]);

  // Handle image load
  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index));
  }, []);

  // Limit to 5 screenshots max
  const displayScreenshots = (screenshots ?? []).slice(0, 5);
  const screenshotCount = displayScreenshots.length;

  // Update scroll indicators
  const updateScrollState = useCallback(() => {
    const container = scrollRef.current;
    if (!container || screenshotCount === 0) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    // Calculate active index based on scroll position
    const itemWidth = container.scrollWidth / screenshotCount;
    const newIndex = Math.round(scrollLeft / itemWidth);
    setActiveIndex(Math.min(newIndex, screenshotCount - 1));
  }, [screenshotCount]);

  // Scroll to specific index
  const scrollToIndex = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container || screenshotCount === 0) return;

    const itemWidth = container.scrollWidth / screenshotCount;
    container.scrollTo({
      left: itemWidth * index,
      behavior: "smooth",
    });
  }, [screenshotCount]);

  // Navigate to previous/next screenshot
  const goToPrevious = useCallback(() => {
    if (activeIndex > 0) {
      scrollToIndex(activeIndex - 1);
    }
  }, [activeIndex, scrollToIndex]);

  const goToNext = useCallback(() => {
    if (activeIndex < screenshotCount - 1) {
      scrollToIndex(activeIndex + 1);
    }
  }, [activeIndex, screenshotCount, scrollToIndex]);

  // Lightbox functions
  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    document.body.style.overflow = "";
  }, []);

  const lightboxPrevious = useCallback(() => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  }, [lightboxIndex]);

  const lightboxNext = useCallback(() => {
    if (lightboxIndex !== null && lightboxIndex < screenshotCount - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  }, [lightboxIndex, screenshotCount]);

  // Handle keyboard events for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;

      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        lightboxPrevious();
      } else if (e.key === "ArrowRight") {
        lightboxNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, closeLightbox, lightboxPrevious, lightboxNext]);

  // Set up scroll listener
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    updateScrollState();
    container.addEventListener("scroll", updateScrollState);
    return () => container.removeEventListener("scroll", updateScrollState);
  }, [updateScrollState]);

  // Early return after all hooks
  if (!screenshots || screenshots.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mt-10 border-t pt-10"
      style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}
    >
      {/* Section Header */}
      <div className="mb-6 flex items-center gap-3">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{
            background: `${accentColor}15`,
            boxShadow: `0 0 20px ${accentColor}10`,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: accentColor }}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <span
          className="text-sm font-semibold uppercase tracking-widest"
          style={{ color: "var(--text-tertiary)" }}
        >
          Screenshots
        </span>
        {displayScreenshots.length > 1 && (
          <span
            className="ml-auto text-xs"
            style={{ color: "var(--text-tertiary)" }}
          >
            {activeIndex + 1} / {displayScreenshots.length}
          </span>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Left fade gradient */}
        <div
          className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 transition-opacity duration-300"
          style={{
            background: "linear-gradient(to right, var(--bg-primary), transparent)",
            opacity: canScrollLeft ? 1 : 0,
          }}
        />

        {/* Right fade gradient */}
        <div
          className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 transition-opacity duration-300"
          style={{
            background: "linear-gradient(to left, var(--bg-primary), transparent)",
            opacity: canScrollRight ? 1 : 0,
          }}
        />

        {/* Left Arrow Button */}
        {displayScreenshots.length > 1 && (
          <button
            onClick={goToPrevious}
            aria-label="Previous screenshot"
            className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-300"
            style={{
              background: "rgba(0, 0, 0, 0.85)",
              border: `1px solid ${activeIndex === 0 ? "rgba(255, 255, 255, 0.1)" : accentColor + "50"}`,
              opacity: activeIndex === 0 ? 0.3 : 1,
              cursor: activeIndex === 0 ? "default" : "pointer",
              boxShadow: activeIndex === 0 ? "none" : `0 0 20px ${accentColor}30`,
            }}
            disabled={activeIndex === 0}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: activeIndex === 0 ? "rgba(255, 255, 255, 0.3)" : accentColor }}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {/* Right Arrow Button */}
        {displayScreenshots.length > 1 && (
          <button
            onClick={goToNext}
            aria-label="Next screenshot"
            className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-300"
            style={{
              background: "rgba(0, 0, 0, 0.85)",
              border: `1px solid ${activeIndex === screenshotCount - 1 ? "rgba(255, 255, 255, 0.1)" : accentColor + "50"}`,
              opacity: activeIndex === screenshotCount - 1 ? 0.3 : 1,
              cursor: activeIndex === screenshotCount - 1 ? "default" : "pointer",
              boxShadow: activeIndex === screenshotCount - 1 ? "none" : `0 0 20px ${accentColor}30`,
            }}
            disabled={activeIndex === screenshotCount - 1}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: activeIndex === screenshotCount - 1 ? "rgba(255, 255, 255, 0.3)" : accentColor }}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}

        {/* Scrollable container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto py-4 scroll-smooth"
          style={{
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {displayScreenshots.map((screenshot, index) => {
            const imageUrl = getScreenshotUrl(screenshot);

            return (
              <button
                key={screenshot}
                onClick={() => openLightbox(index)}
                className="group relative block flex-shrink-0 cursor-pointer overflow-hidden rounded-xl text-left transition-all duration-300 hover:scale-[1.02]"
                style={{
                  scrollSnapAlign: "center",
                  width: displayScreenshots.length === 1 ? "100%" : "calc(85% - 8px)",
                  minWidth: displayScreenshots.length === 1 ? "100%" : "280px",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: `0 4px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)`,
                }}
              >
                {/* Loading skeleton */}
                {!loadedImages.has(index) && (
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      minHeight: "200px",
                    }}
                  >
                    <div
                      className="absolute inset-0 animate-pulse"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${accentColor}10, transparent)`,
                        animation: "shimmer 1.5s infinite",
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
                        style={{ borderColor: `${accentColor}40`, borderTopColor: "transparent" }}
                      />
                    </div>
                  </div>
                )}

                {/* Hover glow effect */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${accentColor}15, transparent 70%)`,
                  }}
                />

                {/* Image - using img tag for external GitHub raw URLs */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={(el) => { imageRefs.current[index] = el; }}
                  src={imageUrl}
                  alt={`${toolName} screenshot ${index + 1}`}
                  loading={index === 0 ? "eager" : "lazy"}
                  onLoad={() => handleImageLoad(index)}
                  className="w-full object-cover transition-all duration-500"
                  style={{
                    maxHeight: "400px",
                    minHeight: "200px",
                    opacity: loadedImages.has(index) ? 1 : 0,
                  }}
                />

                {/* Hover overlay with "Click to expand" */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                  <span
                    className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white transition-transform duration-300 group-hover:scale-105"
                    style={{
                      background: `${accentColor}30`,
                      border: `1px solid ${accentColor}50`,
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="15 3 21 3 21 9" />
                      <polyline points="9 21 3 21 3 15" />
                      <line x1="21" y1="3" x2="14" y2="10" />
                      <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                    Click to expand
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pagination Dots */}
      {displayScreenshots.length > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          {displayScreenshots.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              aria-label={`Go to screenshot ${index + 1}`}
              className="relative h-2 transition-all duration-300"
              style={{
                width: index === activeIndex ? "24px" : "8px",
                borderRadius: "4px",
                background:
                  index === activeIndex
                    ? accentColor
                    : "rgba(255, 255, 255, 0.2)",
                boxShadow:
                  index === activeIndex
                    ? `0 0 12px ${accentColor}60`
                    : "none",
              }}
            />
          ))}
        </div>
      )}

      {/* Swipe hint for mobile - only show on first visit */}
      {displayScreenshots.length > 1 && (
        <p
          className="mt-3 text-center text-xs md:hidden"
          style={{ color: "var(--text-tertiary)" }}
        >
          Swipe to see more
        </p>
      )}

      {/* Lightbox Modal - Portal to body to ensure it covers everything */}
      {isMounted && lightboxIndex !== null && createPortal(
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 flex items-center justify-center p-4 md:p-8"
          style={{ zIndex: 9999 }}
          onClick={closeLightbox}
        >
          {/* Backdrop - fully covers the screen */}
          <div
            className="fixed inset-0"
            style={{
              background: "rgba(0, 0, 0, 0.98)",
              zIndex: -1,
            }}
          />

          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="fixed right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 hover:scale-110"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
            aria-label="Close lightbox"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Image counter */}
          {displayScreenshots.length > 1 && (
            <div
              className="fixed left-4 top-4 rounded-full px-4 py-2 text-sm font-medium text-white"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              {lightboxIndex + 1} / {displayScreenshots.length}
            </div>
          )}

          {/* Previous button */}
          {displayScreenshots.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                lightboxPrevious();
              }}
              className="fixed left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-300 hover:scale-110"
              style={{
                background: lightboxIndex === 0 ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.1)",
                border: `1px solid ${lightboxIndex === 0 ? "rgba(255, 255, 255, 0.1)" : accentColor + "50"}`,
                opacity: lightboxIndex === 0 ? 0.3 : 1,
                cursor: lightboxIndex === 0 ? "default" : "pointer",
              }}
              disabled={lightboxIndex === 0}
              aria-label="Previous screenshot"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: lightboxIndex === 0 ? "rgba(255, 255, 255, 0.3)" : "white" }}
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* Next button */}
          {displayScreenshots.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                lightboxNext();
              }}
              className="fixed right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-300 hover:scale-110"
              style={{
                background: lightboxIndex === screenshotCount - 1 ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.1)",
                border: `1px solid ${lightboxIndex === screenshotCount - 1 ? "rgba(255, 255, 255, 0.1)" : accentColor + "50"}`,
                opacity: lightboxIndex === screenshotCount - 1 ? 0.3 : 1,
                cursor: lightboxIndex === screenshotCount - 1 ? "default" : "pointer",
              }}
              disabled={lightboxIndex === screenshotCount - 1}
              aria-label="Next screenshot"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: lightboxIndex === screenshotCount - 1 ? "rgba(255, 255, 255, 0.3)" : "white" }}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}

          {/* Image container - centered with proper constraints */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex items-center justify-center"
            style={{
              maxWidth: "calc(100vw - 120px)",
              maxHeight: "calc(100vh - 120px)",
              minWidth: "200px",
              minHeight: "200px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox loading indicator */}
            {!lightboxImageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="h-12 w-12 animate-spin rounded-full border-3 border-t-transparent"
                  style={{ borderColor: `${accentColor}60`, borderTopColor: "transparent", borderWidth: "3px" }}
                />
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getScreenshotUrl(displayScreenshots[lightboxIndex] ?? "")}
              alt={`${toolName} screenshot ${lightboxIndex + 1}`}
              onLoad={() => setLightboxImageLoaded(true)}
              className="rounded-lg object-contain transition-opacity duration-300"
              style={{
                maxWidth: "calc(100vw - 120px)",
                maxHeight: "calc(100vh - 120px)",
                boxShadow: `0 0 60px ${accentColor}30`,
                opacity: lightboxImageLoaded ? 1 : 0,
              }}
            />
          </motion.div>

          {/* Keyboard hint */}
          <div
            className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-2 text-xs text-white/50"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
            }}
          >
            Press ESC to close{displayScreenshots.length > 1 ? " | Arrow keys to navigate" : ""}
          </div>
        </motion.div>,
        document.body
      )}
    </motion.div>
  );
}
