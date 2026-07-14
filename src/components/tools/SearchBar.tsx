"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear?: () => void;
  placeholder?: string;
  isAiSearching?: boolean;
  isAiMode?: boolean;
  inputId?: string;
  ariaControls?: string;
  submitLabel?: string;
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = "Describe your problem or search for tools…",
  isAiSearching = false,
  isAiMode = false,
  inputId,
  ariaControls,
  submitLabel = "Search",
}: SearchBarProps) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.form
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
      }
      className="group relative w-full"
      role="search"
      aria-busy={isAiSearching || undefined}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {/* Search/AI Icon */}
      <div
        className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2"
        style={{
          color: isAiMode ? "var(--accent-primary)" : "var(--text-tertiary)",
        }}
        aria-hidden="true"
      >
        <AnimatePresence mode="wait">
          {isAiSearching ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, rotate: 0 }}
              animate={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 1, rotate: 360 }
              }
              exit={{ opacity: 0 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0.2 }
                  : {
                      rotate: { duration: 1, repeat: Infinity, ease: "linear" },
                    }
              }
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            </motion.div>
          ) : isAiMode ? (
            <motion.div
              key="ai"
              initial={
                prefersReducedMotion ? false : { opacity: 0, scale: 0.8 }
              }
              animate={{ opacity: 1, scale: 1 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.8 }
              }
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
              </svg>
            </motion.div>
          ) : (
            <motion.div
              key="search"
              initial={
                prefersReducedMotion ? false : { opacity: 0, scale: 0.8 }
              }
              animate={{ opacity: 1, scale: 1 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.8 }
              }
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search tools"
        aria-controls={ariaControls}
        name="tool-search"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
        className="input input-lg w-full shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
        style={{
          height: "56px",
          fontSize: "1rem",
          paddingLeft: "56px",
          paddingRight: value ? "148px" : "112px",
          borderColor: isAiMode ? "var(--accent-primary)" : undefined,
          boxShadow: isAiMode ? "0 0 0 1px var(--accent-glow)" : undefined,
        }}
      />

      {/* Clear Button */}
      <AnimatePresence>
        {value && (
          <motion.button
            type="button"
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={
              prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }
            }
            onClick={() => {
              onChange("");
              onClear?.();
            }}
            className="absolute top-1/2 right-[96px] -translate-y-1/2 rounded-full p-1.5 transition-colors hover:bg-[var(--bg-tertiary)]"
            style={{ color: "var(--text-tertiary)" }}
            aria-label="Clear search"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      <button
        type="submit"
        className="absolute top-1/2 right-2 inline-flex h-10 -translate-y-1/2 items-center justify-center rounded-[10px] bg-[var(--accent-primary)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-secondary)] focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2"
      >
        {submitLabel}
      </button>

      {/* Focus Ring Enhancement */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[14px] opacity-0 transition-opacity duration-200 group-focus-within:opacity-100"
        style={{
          boxShadow: "0 0 0 4px var(--accent-glow)",
        }}
      />
    </motion.form>
  );
}
