"use client";

import { useState, useEffect, useRef } from "react";

interface ScrollState {
  scrollDirection: "up" | "down" | null;
  hasScrolledPastThreshold: boolean;
  scrollY: number;
}

interface UseScrollDirectionOptions {
  threshold?: number; // Minimum scroll delta to detect direction change
  scrollThreshold?: number; // How far to scroll before showing (in vh percentage)
}

export function useScrollDirection(options: UseScrollDirectionOptions = {}) {
  const { threshold = 10, scrollThreshold = 50 } = options;

  const [state, setState] = useState<ScrollState>({
    scrollDirection: null,
    hasScrolledPastThreshold: false,
    scrollY: 0,
  });

  // Use refs to avoid stale closures
  const lastScrollYRef = useRef(0);
  const directionRef = useRef<"up" | "down" | null>(null);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;
    let ticking = false;

    const updateScrollState = () => {
      const currentScrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const scrollThresholdPx = (viewportHeight * scrollThreshold) / 100;

      // Determine direction using ref to avoid stale closure
      if (currentScrollY > lastScrollYRef.current + threshold) {
        directionRef.current = "down";
      } else if (currentScrollY < lastScrollYRef.current - threshold) {
        directionRef.current = "up";
      }

      // Check if user has scrolled past threshold
      const pastThreshold = currentScrollY > scrollThresholdPx;

      setState({
        scrollDirection: directionRef.current,
        hasScrolledPastThreshold: pastThreshold,
        scrollY: currentScrollY,
      });

      lastScrollYRef.current = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollState);
        ticking = true;
      }
    };

    // Initial check
    updateScrollState();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold, scrollThreshold]);

  return state;
}
