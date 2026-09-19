"use client";

import { useCallback, useEffect, useState } from "react";

// One key per saved tool, so two tabs toggling different tools do not
// overwrite each other's changes.
const FAVORITES_PREFIX = "awesomeintune:favorite:";
const FAVORITES_EVENT = "awesomeintune:favorites-changed";

/**
 * Read the saved tool IDs. Safe on the server and when storage is blocked.
 */
export function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  const ids: string[] = [];
  try {
    for (let index = 0; index < window.localStorage.length; index++) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(FAVORITES_PREFIX)) {
        const id = key.slice(FAVORITES_PREFIX.length);
        if (id) ids.push(id);
      }
    }
  } catch {
    return [];
  }
  return ids;
}

function setFavorite(id: string, active: boolean): void {
  try {
    const key = FAVORITES_PREFIX + id;
    if (active) window.localStorage.setItem(key, "1");
    else window.localStorage.removeItem(key);
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
    const active = readFavorites().includes(id);
    setFavorite(id, !active);
    setFavorites(readFavorites());
    window.dispatchEvent(new Event(FAVORITES_EVENT));
  }, []);

  return {
    favorites,
    toggle,
    isFavorite: (id: string) => favorites.includes(id),
  };
}
