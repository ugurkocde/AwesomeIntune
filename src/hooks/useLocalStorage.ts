"use client";

import { useState, useEffect, useCallback } from "react";

interface SubscriptionPersistence {
  dismissed: boolean;
  dismissedAt: number | null;
  subscribed: boolean;
  subscribedAt: number | null;
}

const STORAGE_KEY = "awesome-intune-floating-subscribe";
const DISMISS_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const defaultState: SubscriptionPersistence = {
  dismissed: false,
  dismissedAt: null,
  subscribed: false,
  subscribedAt: null,
};

export function useSubscriptionPersistence() {
  const [state, setState] = useState<SubscriptionPersistence>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SubscriptionPersistence;

        // Check if dismissal has expired
        if (parsed.dismissedAt && Date.now() - parsed.dismissedAt > DISMISS_EXPIRY_MS) {
          parsed.dismissed = false;
          parsed.dismissedAt = null;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        }

        setState(parsed);
      }
    } catch {
      // Invalid JSON or localStorage error - use defaults
    }
    setIsLoaded(true);
  }, []);

  const dismiss = useCallback(() => {
    setState((prev) => {
      const newState: SubscriptionPersistence = {
        ...prev,
        dismissed: true,
        dismissedAt: Date.now(),
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      } catch {
        // localStorage might be full or disabled
      }
      return newState;
    });
  }, []);

  const markSubscribed = useCallback(() => {
    setState((prev) => {
      const newState: SubscriptionPersistence = {
        ...prev,
        subscribed: true,
        subscribedAt: Date.now(),
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      } catch {
        // localStorage might be full or disabled
      }
      return newState;
    });
  }, []);

  const reset = useCallback(() => {
    setState(defaultState);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore errors
    }
  }, []);

  return {
    ...state,
    isLoaded,
    dismiss,
    markSubscribed,
    reset,
  };
}
