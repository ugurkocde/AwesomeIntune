"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const MOBILE_BREAKPOINT = 640; // Tailwind's 'sm' breakpoint
const DEBOUNCE_MS = 100;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
  }, []);

  useEffect(() => {
    // Initial check
    checkMobile();
    setIsLoaded(true);

    // Debounced resize handler
    const handleResize = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(checkMobile, DEBOUNCE_MS);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [checkMobile]);

  return { isMobile, isLoaded };
}
