"use client";

import { useCallback, useEffect, useState } from "react";

// One key per saved tool, so two tabs toggling different tools do not
// overwrite each other's changes.
const FAVORITES_PREFIX = "awesomeintune:favorite:";
const FAVORITES_EVENT = "awesomeintune:favorites-changed";

// In-memory mirror so favorites still work within this document when
// localStorage is unavailable, for example in private mode.
let memoryFavorites: string[] | null = null;
let storageBroken = false;

/**
 * Read the saved tool IDs. Safe on the server and when storage is blocked.
 */
export function readFavorites(): string[] {
  if (typeof window === "undefined" || storageBroken) {
    return memoryFavorites ?? [];
  }

  const ids: string[] = [];
  try {
    for (let index = 0; index < window.localStorage.length; index++) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(FAVORITES_PREFIX)) {
        const id = key.slice(FAVORITES_PREFIX.length);
        if (id) ids.push(id);
      }
    }
    memoryFavorites = ids;
    return ids;
  } catch {
    storageBroken = true;
    return memoryFavorites ?? [];
  }
}

function setFavorite(id: string, active: boolean): void {
  const base = memoryFavorites ?? readFavorites();
  memoryFavorites = active
    ? Array.from(new Set([...base, id]))
    : base.filter((value) => value !== id);

  if (storageBroken) return;

  try {
    const key = FAVORITES_PREFIX + id;
    if (active) window.localStorage.setItem(key, "1");
    else window.localStorage.removeItem(key);
  } catch {
    // A failed write means storage is unavailable for this document; keep the
    // in-memory mirror as the source of truth.
    storageBroken = true;
  }
}

/**
 * Saved tools stored in localStorage, kept in sync across every component on
 * the page and across tabs. `ready` is false until the first client read, so
 * consumers can avoid flashing an empty state during hydration.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setFavorites(readFavorites());
    sync();
    setReady(true);
    window.addEventListener(FAVORITES_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(FAVORITES_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const active = (memoryFavorites ?? readFavorites()).includes(id);
    setFavorite(id, !active);
    setFavorites(memoryFavorites ?? []);
    window.dispatchEvent(new Event(FAVORITES_EVENT));
  }, []);

  return {
    favorites,
    ready,
    toggle,
    isFavorite: (id: string) => favorites.includes(id),
  };
}
