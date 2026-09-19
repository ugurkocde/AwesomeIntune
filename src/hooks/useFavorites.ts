"use client";

import { useCallback, useEffect, useState } from "react";

const FAVORITES_KEY = "awesomeintune:favorites";
const FAVORITES_EVENT = "awesomeintune:favorites-changed";

/**
 * Read the saved tool IDs. Safe on the server and when storage is blocked.
 */
export function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

function writeFavorites(ids: string[]): void {
  try {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  } catch {
    // Storage can be blocked (private mode); the list is best effort only.
  }
}

/**
 * Saved tools stored in localStorage, kept in sync across every component on
 * the page and across tabs.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setFavorites(readFavorites());
    sync();
    window.addEventListener(FAVORITES_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(FAVORITES_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const current = readFavorites();
    const next = current.includes(id)
      ? current.filter((value) => value !== id)
      : [...current, id];
    writeFavorites(next);
    setFavorites(next);
    window.dispatchEvent(new Event(FAVORITES_EVENT));
  }, []);

  return {
    favorites,
    toggle,
    isFavorite: (id: string) => favorites.includes(id),
  };
}
