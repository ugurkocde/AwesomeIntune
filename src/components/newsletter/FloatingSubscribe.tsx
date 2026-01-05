"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import { usePathname } from "next/navigation";
import { useSubscriptionPersistence } from "~/hooks/useLocalStorage";
import { useScrollDirection } from "~/hooks/useScrollDirection";
import { useIsMobile } from "~/hooks/useIsMobile";
import { trackNewsletterSignup } from "~/lib/plausible";
import "./FloatingSubscribeStyles.css";

type FormState = "collapsed" | "expanded" | "loading" | "success" | "error";

const EXPO_EASE = [0.22, 1, 0.36, 1] as const;
const APPEARANCE_DELAY = 2500; // 2.5 seconds

export function FloatingSubscribe() {
  const [formState, setFormState] = useState<FormState>("collapsed");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [shouldShow, setShouldShow] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const { isMobile, isLoaded: mobileLoaded } = useIsMobile();
  const { hasScrolledPastThreshold } = useScrollDirection({ scrollThreshold: 50 });
  const { dismissed, subscribed, isLoaded: persistenceLoaded, dismiss, markSubscribed } = useSubscriptionPersistence();

  // Fetch subscriber count on mount
  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/subscriber-count");
        const data = (await res.json()) as { count: number };
        if (data.count > 0) {
          setSubscriberCount(data.count);
        }
      } catch {
        // Silently fail - social proof is optional
      }
    }
    void fetchCount();
  }, []);

  // Delayed appearance
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldShow(true);
    }, APPEARANCE_DELAY);
    return () => clearTimeout(timer);
  }, []);

  // Focus input when expanded
  useEffect(() => {
    if (formState === "expanded" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [formState]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && formState === "expanded") {
        setFormState("collapsed");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [formState]);

  // Click outside to collapse
  useEffect(() => {
    if (formState !== "expanded") return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        e.target instanceof Node &&
        containerRef.current &&
        !containerRef.current.contains(e.target)
      ) {
        setFormState("collapsed");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [formState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email?.includes("@")) {
      setFormState("error");
      setErrorMessage("Please enter a valid email address");
      return;
    }

    setFormState("loading");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as { success?: boolean; message?: string; error?: string };

      if (response.ok && data.success) {
        setFormState("success");
        trackNewsletterSignup("floating");
        markSubscribed();

        // Haptic feedback on mobile
        if (isMobile && navigator.vibrate) {
          navigator.vibrate(100);
        }

        // Auto-dismiss after celebration
        setTimeout(() => {
          setFormState("collapsed");
        }, isMobile ? 2000 : 3000);
      } else {
        setFormState("error");
        setErrorMessage(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setFormState("error");
      setErrorMessage("Failed to subscribe. Please try again.");
    }
  };

  const handleDismiss = useCallback(() => {
    setFormState("collapsed");
    dismiss();
  }, [dismiss]);

  const handleExpand = useCallback(() => {
    setFormState("expanded");
    setErrorMessage("");
  }, []);

  const handleCollapse = useCallback(() => {
    setFormState("collapsed");
  }, []);

  // Determine visibility
  // Once shown, stays visible until dismissed or subscribed (no scroll-based hiding)
  const isHiddenRoute = pathname === "/submit";
  const isHiddenByPersistence = dismissed || subscribed;
  const isReady = persistenceLoaded && mobileLoaded && shouldShow;

  const isVisible =
    isReady &&
    !isHiddenRoute &&
    !isHiddenByPersistence &&
    hasScrolledPastThreshold;

  // Animation variants
  const orbVariants: Variants = {
    hidden: { opacity: 0, scale: 0.6, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: prefersReducedMotion
        ? { duration: 0.2 }
        : { type: "spring" as const, stiffness: 400, damping: 25 },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 20,
      transition: { duration: 0.2, ease: EXPO_EASE },
    },
  };

  const panelVariants: Variants = {
    collapsed: {
      width: isMobile ? 48 : 56,
      height: isMobile ? 48 : 56,
      borderRadius: isMobile ? 24 : 28,
    },
    expanded: {
      width: isMobile ? "calc(100vw - 32px)" : 340,
      height: "auto",
      borderRadius: isMobile ? "16px 16px 0 0" : 16,
      transition: prefersReducedMotion
        ? { duration: 0.2 }
        : { type: "spring" as const, stiffness: 400, damping: 25 },
    },
  };

  const contentVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: prefersReducedMotion
        ? { duration: 0.1 }
        : { delay: i * 0.05, duration: 0.3, ease: EXPO_EASE },
    }),
  };

  // Mobile bottom sheet position
  const mobileSheetVariants: Variants = {
    hidden: { y: "100%", opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: prefersReducedMotion
        ? { duration: 0.2 }
        : { type: "spring" as const, stiffness: 400, damping: 25 },
    },
    exit: {
      y: "100%",
      opacity: 0,
      transition: { duration: 0.2, ease: EXPO_EASE },
    },
  };

  if (!isVisible && formState === "collapsed") {
    return null;
  }

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMobile && formState === "expanded" && (
          <motion.div
            className="floating-subscribe-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCollapse}
          />
        )}
      </AnimatePresence>

      {/* Main container */}
      <AnimatePresence mode="wait">
        {formState !== "collapsed" || isVisible ? (
          <motion.div
            ref={containerRef}
            className={`floating-subscribe-container ${isMobile ? "mobile" : "desktop"} ${formState}`}
            role="complementary"
            aria-label="Newsletter subscription"
            variants={isMobile && formState === "expanded" ? mobileSheetVariants : orbVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <AnimatePresence mode="wait">
              {formState === "collapsed" ? (
                <motion.button
                  key="orb"
                  className="floating-subscribe-orb"
                  onClick={handleExpand}
                  aria-label="Subscribe to newsletter"
                  aria-expanded={false}
                  variants={orbVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                >
                  {/* Bell icon with notification dot */}
                  <svg
                    className="floating-subscribe-icon"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                  <span className="floating-subscribe-dot" />
                </motion.button>
              ) : (
                <motion.div
                  key="panel"
                  className="floating-subscribe-panel"
                  variants={panelVariants}
                  initial="collapsed"
                  animate="expanded"
                  drag={isMobile ? "y" : false}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0, bottom: 0.5 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.y > 100 || info.velocity.y > 500) {
                      handleCollapse();
                    }
                  }}
                >
                  {/* Scan line effect (desktop only) */}
                  {!isMobile && !prefersReducedMotion && <div className="floating-subscribe-scanline" />}

                  {/* Close button */}
                  <motion.button
                    className="floating-subscribe-close"
                    onClick={handleDismiss}
                    aria-label="Dismiss newsletter signup"
                    custom={0}
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </motion.button>

                  {/* Drag handle for mobile */}
                  {isMobile && <div className="floating-subscribe-drag-handle" />}

                  <AnimatePresence mode="wait">
                    {formState === "success" ? (
                      <motion.div
                        key="success"
                        className="floating-subscribe-success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        {/* Animated checkmark */}
                        <svg
                          className="floating-subscribe-checkmark"
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <motion.circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="var(--signal-success)"
                            strokeWidth="2"
                            fill="rgba(0, 255, 136, 0.1)"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                          <motion.path
                            d="M9 12l2 2 4-4"
                            stroke="var(--signal-success)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                          />
                        </svg>
                        <p className="floating-subscribe-success-text">You&apos;re connected!</p>
                        <p className="floating-subscribe-success-subtext">Check your email to confirm.</p>

                        {/* Confetti particles (desktop only) */}
                        {!isMobile && !prefersReducedMotion && <ConfettiParticles />}
                      </motion.div>
                    ) : (
                      <motion.form
                        key="form"
                        className="floating-subscribe-form"
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <motion.h3
                          className="floating-subscribe-title"
                          custom={1}
                          variants={contentVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          Stay Connected
                        </motion.h3>

                        {subscriberCount !== null && subscriberCount > 0 && (
                          <motion.p
                            className="floating-subscribe-social-proof"
                            custom={2}
                            variants={contentVariants}
                            initial="hidden"
                            animate="visible"
                          >
                            Join {subscriberCount.toLocaleString()}+ Intune admins
                          </motion.p>
                        )}

                        <motion.div
                          className="floating-subscribe-input-group"
                          custom={3}
                          variants={contentVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <input
                            ref={inputRef}
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (formState === "error") {
                                setFormState("expanded");
                                setErrorMessage("");
                              }
                            }}
                            placeholder="Enter your email"
                            disabled={formState === "loading"}
                            className="floating-subscribe-input"
                            aria-label="Email address"
                            aria-invalid={formState === "error"}
                            aria-describedby={formState === "error" ? "floating-subscribe-error" : undefined}
                          />
                        </motion.div>

                        <motion.button
                          type="submit"
                          disabled={formState === "loading"}
                          className="floating-subscribe-submit"
                          custom={4}
                          variants={contentVariants}
                          initial="hidden"
                          animate="visible"
                          whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                        >
                          {formState === "loading" ? (
                            <span className="floating-subscribe-loading">
                              <motion.svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              >
                                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                              </motion.svg>
                              Connecting...
                            </span>
                          ) : (
                            <span className="floating-subscribe-submit-text">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
                              </svg>
                              Notify Me
                            </span>
                          )}
                        </motion.button>

                        <AnimatePresence>
                          {formState === "error" && errorMessage && (
                            <motion.p
                              id="floating-subscribe-error"
                              className="floating-subscribe-error"
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              role="alert"
                            >
                              {errorMessage}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

// Confetti particles component
function ConfettiParticles() {
  const PARTICLE_COUNT = 30;
  const colors = ["var(--accent-primary)", "var(--signal-success)", "var(--signal-purple)"];

  return (
    <div className="floating-subscribe-confetti">
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <motion.div
          key={i}
          className="floating-subscribe-confetti-particle"
          style={{
            background: colors[i % colors.length],
            left: `${50 + (Math.random() - 0.5) * 60}%`,
            top: "50%",
          }}
          initial={{
            y: 0,
            x: 0,
            scale: 0,
            rotate: 0,
            opacity: 0,
          }}
          animate={{
            y: [0, -80 - Math.random() * 120, 150 + Math.random() * 80],
            x: (Math.random() - 0.5) * 200,
            scale: [0, 1, 0.5],
            rotate: Math.random() * 720,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.2 + Math.random() * 0.4,
            ease: [0.22, 1, 0.36, 1],
            delay: Math.random() * 0.15,
          }}
        />
      ))}
    </div>
  );
}
