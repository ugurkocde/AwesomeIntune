"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type ToastType = "success" | "error" | "info";

interface Toast {
  type: ToastType;
  title: string;
  message: string;
}

const toastConfig: Record<string, Toast> = {
  confirmed: {
    type: "success",
    title: "Email Confirmed",
    message: "You will now receive notifications when new tools are added.",
  },
  "already-confirmed": {
    type: "info",
    title: "Already Confirmed",
    message: "Your email was already confirmed.",
  },
  unsubscribed: {
    type: "success",
    title: "Unsubscribed",
    message: "You have been removed from the mailing list.",
  },
  error: {
    type: "error",
    title: "Something went wrong",
    message: "Please try again or contact support.",
  },
};

export function SubscriptionToast() {
  const searchParams = useSearchParams();
  const [toast, setToast] = useState<Toast | null>(null);
  const hasProcessed = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const status = searchParams.get("subscription");

    // Only process once per page load
    if (status && toastConfig[status] && !hasProcessed.current) {
      hasProcessed.current = true;
      setToast(toastConfig[status]);

      // Clean up URL without triggering navigation
      const url = new URL(window.location.href);
      url.searchParams.delete("subscription");
      url.searchParams.delete("message");
      window.history.replaceState({}, "", url.pathname);

      // Auto-dismiss after 5 seconds
      timerRef.current = setTimeout(() => {
        setToast(null);
      }, 5000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [searchParams]);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        );
      case "error":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case "info":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
    }
  };

  const getColors = (type: ToastType) => {
    switch (type) {
      case "success":
        return {
          bg: "rgba(0, 255, 136, 0.1)",
          border: "rgba(0, 255, 136, 0.3)",
          icon: "var(--signal-success)",
        };
      case "error":
        return {
          bg: "rgba(255, 68, 68, 0.1)",
          border: "rgba(255, 68, 68, 0.3)",
          icon: "var(--signal-error)",
        };
      case "info":
        return {
          bg: "rgba(0, 212, 255, 0.1)",
          border: "rgba(0, 212, 255, 0.3)",
          icon: "var(--accent-primary)",
        };
    }
  };

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -20, x: "-50%" }}
          className="fixed left-1/2 top-24 z-50"
        >
          <div
            className="flex items-start gap-3 rounded-lg px-5 py-4 shadow-lg"
            style={{
              background: getColors(toast.type).bg,
              border: `1px solid ${getColors(toast.type).border}`,
              backdropFilter: "blur(10px)",
            }}
          >
            <div style={{ color: getColors(toast.type).icon }}>
              {getIcon(toast.type)}
            </div>
            <div>
              <p
                className="font-medium"
                style={{ color: "var(--text-primary)", fontSize: "14px" }}
              >
                {toast.title}
              </p>
              <p
                style={{ color: "var(--text-secondary)", fontSize: "13px" }}
              >
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="ml-4 rounded p-1 transition-colors hover:bg-white/10"
              style={{ color: "var(--text-tertiary)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
