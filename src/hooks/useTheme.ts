"use client";

import { useCallback, useEffect, useState } from "react";
import {
  isColorTheme,
  THEME_CHANGE_EVENT,
  THEME_STORAGE_KEY,
  type ColorTheme,
} from "~/lib/theme";

function getSystemTheme(): ColorTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getActiveTheme(): ColorTheme {
  const activeTheme = document.documentElement.dataset.theme;
  return isColorTheme(activeTheme) ? activeTheme : getSystemTheme();
}

function applyTheme(theme: ColorTheme, persist: boolean) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#0b1220" : "#f8fafc");

  if (persist) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // The theme still applies when storage is unavailable.
    }
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<ColorTheme>("light");

  useEffect(() => {
    setThemeState(getActiveTheme());

    const syncTheme = () => setThemeState(getActiveTheme());
    const syncStoredTheme = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;

      const nextTheme = isColorTheme(event.newValue)
        ? event.newValue
        : getSystemTheme();
      applyTheme(nextTheme, false);
      setThemeState(nextTheme);
    };
    const syncSystemTheme = (event: MediaQueryListEvent) => {
      try {
        if (window.localStorage.getItem(THEME_STORAGE_KEY)) return;
      } catch {
        // Follow the system preference when storage is unavailable.
      }

      const nextTheme: ColorTheme = event.matches ? "dark" : "light";
      applyTheme(nextTheme, false);
      setThemeState(nextTheme);
    };
    const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");

    window.addEventListener(THEME_CHANGE_EVENT, syncTheme);
    window.addEventListener("storage", syncStoredTheme);
    colorScheme.addEventListener("change", syncSystemTheme);

    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, syncTheme);
      window.removeEventListener("storage", syncStoredTheme);
      colorScheme.removeEventListener("change", syncSystemTheme);
    };
  }, []);

  const setTheme = useCallback((nextTheme: ColorTheme) => {
    applyTheme(nextTheme, true);
    setThemeState(nextTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(getActiveTheme() === "dark" ? "light" : "dark");
  }, [setTheme]);

  return { theme, setTheme, toggleTheme };
}
