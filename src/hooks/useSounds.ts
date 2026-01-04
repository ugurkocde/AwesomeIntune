"use client";

import { useCallback, useEffect, useState } from "react";
import {
  initAudio,
  toggleMute,
  isSoundEnabled,
  loadSoundPreference,
  playHover,
  playClick,
  playSuccess,
  playWhoosh,
  playFilterChange,
} from "~/lib/sounds";

export function useSounds() {
  const [enabled, setEnabled] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load preference on mount
  useEffect(() => {
    loadSoundPreference();
    setEnabled(isSoundEnabled());
  }, []);

  // Initialize audio on first user interaction
  const init = useCallback(() => {
    if (!initialized) {
      const success = initAudio();
      if (success) {
        setInitialized(true);
        loadSoundPreference();
        setEnabled(isSoundEnabled());
      }
    }
  }, [initialized]);

  const toggle = useCallback(() => {
    init();
    const newState = toggleMute();
    setEnabled(newState);
  }, [init]);

  const hover = useCallback(() => {
    init();
    playHover();
  }, [init]);

  const click = useCallback(() => {
    init();
    playClick();
  }, [init]);

  const success = useCallback(() => {
    init();
    playSuccess();
  }, [init]);

  const whoosh = useCallback(() => {
    init();
    playWhoosh();
  }, [init]);

  const filterChange = useCallback(() => {
    init();
    playFilterChange();
  }, [init]);

  return {
    enabled,
    toggle,
    hover,
    click,
    success,
    whoosh,
    filterChange,
    init,
  };
}
