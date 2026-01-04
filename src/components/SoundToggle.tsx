"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSounds } from "~/hooks/useSounds";

export function SoundToggle() {
  const { enabled, toggle, click } = useSounds();

  const handleClick = () => {
    click();
    toggle();
  };

  return (
    <motion.button
      onClick={handleClick}
      className="group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
      whileHover={{
        borderColor: "rgba(0, 212, 255, 0.3)",
        background: "rgba(0, 212, 255, 0.05)",
      }}
      whileTap={{ scale: 0.95 }}
      title={enabled ? "Mute sounds" : "Enable sounds"}
    >
      {/* Glow effect when enabled */}
      <AnimatePresence>
        {enabled && (
          <motion.div
            className="absolute inset-0 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              boxShadow: "0 0 20px rgba(0, 212, 255, 0.2), inset 0 0 10px rgba(0, 212, 255, 0.1)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Sound wave icon */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative z-10 transition-colors"
        style={{
          color: enabled ? "var(--accent-primary)" : "var(--text-tertiary)",
        }}
      >
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <AnimatePresence mode="wait">
          {enabled ? (
            <motion.g
              key="enabled"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 5 }}
            >
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </motion.g>
          ) : (
            <motion.g
              key="disabled"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <line x1="22" y1="2" x2="14" y2="10" />
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      {/* Pulse animation when enabled */}
      <AnimatePresence>
        {enabled && (
          <>
            {Array.from({ length: 3 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-xl"
                initial={{ opacity: 0.5, scale: 1 }}
                animate={{
                  opacity: 0,
                  scale: 1.5,
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.3,
                  repeat: Infinity,
                }}
                style={{
                  inset: -2,
                  border: "1px solid var(--accent-primary)",
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
