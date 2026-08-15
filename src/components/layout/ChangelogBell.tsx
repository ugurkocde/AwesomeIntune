"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CHANGELOG_ARCHIVE_URL,
  CHANGELOG_LAST_SEEN_KEY,
  CHANGELOG_SEEN_EVENT,
  getEntryUrl,
  getPublicChangelog,
  type PublicChangelogFeed,
} from "~/lib/changelog";

type LoadState = "idle" | "loading" | "success" | "error";

interface IdleWindow {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout: number },
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
}

const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatEntryDate(value: string): string {
  const date = new Date(value.includes("T") ? value : `${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

function focusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => element.getAttribute("aria-hidden") !== "true");
}

export function ChangelogBell() {
  const generatedId = useId().replaceAll(":", "");
  const panelId = `changelog-panel-${generatedId}`;
  const titleId = `changelog-title-${generatedId}`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [feed, setFeed] = useState<PublicChangelogFeed | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [hasUnread, setHasUnread] = useState(false);

  const applyFeed = useCallback((nextFeed: PublicChangelogFeed) => {
    setFeed(nextFeed);
    setLoadState("success");

    const latestEntry = nextFeed.entries.at(0);
    if (!latestEntry) {
      setHasUnread(false);
      return;
    }

    try {
      setHasUnread(
        window.localStorage.getItem(CHANGELOG_LAST_SEEN_KEY) !== latestEntry.id,
      );
    } catch {
      setHasUnread(false);
    }
  }, []);

  const loadFeed = useCallback(async () => {
    setLoadState("loading");
    try {
      applyFeed(await getPublicChangelog());
    } catch {
      setLoadState("error");
    }
  }, [applyFeed]);

  const closePanel = useCallback(() => {
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  const openPanel = useCallback(() => {
    setOpen(true);
    void loadFeed();
  }, [loadFeed]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleSeen = () => setHasUnread(false);
    window.addEventListener(CHANGELOG_SEEN_EVENT, handleSeen);
    return () => window.removeEventListener(CHANGELOG_SEEN_EVENT, handleSeen);
  }, []);

  useEffect(() => {
    const idleWindow = window as unknown as IdleWindow;
    const startLoading = () => void loadFeed();

    if (idleWindow.requestIdleCallback) {
      const handle = idleWindow.requestIdleCallback(startLoading, {
        timeout: 3000,
      });
      return () => idleWindow.cancelIdleCallback?.(handle);
    }

    const handle = window.setTimeout(startLoading, 1500);
    return () => window.clearTimeout(handle);
  }, [loadFeed]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() =>
      closeButtonRef.current?.focus(),
    );

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePanel();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = focusableElements(panelRef.current);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0]!;
      const last = focusable.at(-1)!;
      const active = document.activeElement;

      if (
        event.shiftKey &&
        (active === first || !panelRef.current.contains(active))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (active === last || !panelRef.current.contains(active))
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [closePanel, open]);

  useEffect(() => {
    if (!open || !feed?.entries[0]) return;

    try {
      window.localStorage.setItem(CHANGELOG_LAST_SEEN_KEY, feed.entries[0].id);
      setHasUnread(false);
      window.dispatchEvent(new Event(CHANGELOG_SEEN_EVENT));
    } catch {
      // The panel remains usable when storage is disabled.
    }
  }, [feed, open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openPanel}
        className="relative flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
        aria-label={
          hasUnread ? "Open changelog, new updates available" : "Open changelog"
        }
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        title="What’s new"
      >
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
        {hasUnread && (
          <span
            data-testid="changelog-unread-dot"
            className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-[var(--accent-primary)] ring-2 ring-[var(--header-bg)]"
            aria-hidden="true"
          />
        )}
      </button>

      {mounted &&
        open &&
        createPortal(
          <div className="fixed inset-0 z-[100]">
            <button
              type="button"
              className="changelog-backdrop absolute inset-0 h-full w-full cursor-default bg-slate-950/55 backdrop-blur-[2px]"
              onClick={closePanel}
              aria-label="Close changelog"
              tabIndex={-1}
            />
            <section
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="changelog-sheet absolute inset-y-0 right-0 flex h-[100dvh] w-full flex-col border-[color:var(--border-subtle)] bg-[var(--bg-secondary)] shadow-[var(--shadow-lg)] sm:max-w-[440px] sm:border-l"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="changelog-sheet-header flex shrink-0 items-start justify-between gap-4 border-b border-[color:var(--border-subtle)] px-5 py-5 sm:px-6">
                <div>
                  <p className="font-mono text-[11px] font-semibold tracking-[0.13em] text-[var(--accent-primary)] uppercase">
                    AwesomeIntune
                  </p>
                  <h2
                    id={titleId}
                    className="font-display mt-1 text-xl font-bold tracking-[-0.02em] text-balance text-[var(--text-primary)]"
                  >
                    Latest updates
                  </h2>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closePanel}
                  className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                  aria-label="Close changelog"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="m6 6 12 12M18 6 6 18" />
                  </svg>
                </button>
              </header>

              <div
                className="changelog-sheet-content min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6"
                aria-live="polite"
              >
                {loadState === "loading" && !feed && (
                  <div
                    className="space-y-4"
                    aria-label="Loading updates"
                    role="status"
                  >
                    {[0, 1, 2].map((item) => (
                      <div
                        key={item}
                        className="overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--border-subtle)] p-4"
                      >
                        <div className="h-3 w-24 rounded bg-[var(--bg-tertiary)]" />
                        <div className="mt-4 h-5 w-3/4 rounded bg-[var(--bg-tertiary)]" />
                        <div className="mt-3 h-3 w-full rounded bg-[var(--bg-tertiary)]" />
                        <div className="mt-2 h-3 w-4/5 rounded bg-[var(--bg-tertiary)]" />
                      </div>
                    ))}
                    <span className="sr-only">Loading updates…</span>
                  </div>
                )}

                {loadState === "error" && (
                  <div
                    className="flex min-h-64 flex-col items-center justify-center rounded-[var(--radius-lg)] border border-[color:var(--border-subtle)] bg-[var(--bg-primary)] px-6 text-center"
                    role="alert"
                  >
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--text-tertiary)"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 9v4m0 4h.01" />
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                    <h3 className="mt-4 font-semibold text-[var(--text-primary)]">
                      Updates are temporarily unavailable
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                      The rest of AwesomeIntune is unaffected. Try loading the
                      updates again.
                    </p>
                    <button
                      type="button"
                      onClick={() => void loadFeed()}
                      className="mt-5 min-h-11 cursor-pointer rounded-[10px] bg-[var(--accent-solid)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-solid-hover)]"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {loadState === "success" && feed?.entries.length === 0 && (
                  <div className="flex min-h-64 flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[color:var(--border-medium)] bg-[var(--bg-primary)] px-6 text-center">
                    <h3 className="font-semibold text-[var(--text-primary)]">
                      No updates yet
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                      Product news and improvements will appear here.
                    </p>
                  </div>
                )}

                {feed && feed.entries.length > 0 && (
                  <ol className="space-y-4">
                    {feed.entries.map((entry) => (
                      <li key={entry.id}>
                        <article className="changelog-entry rounded-[var(--radius-lg)] border border-[color:var(--border-subtle)] bg-[var(--bg-primary)] p-4 transition-colors hover:border-[color:var(--border-accent)]">
                          <time
                            dateTime={entry.publishedOn}
                            className="font-mono text-[11px] font-medium tracking-[0.08em] text-[var(--text-tertiary)] uppercase"
                          >
                            {formatEntryDate(entry.publishedOn)}
                          </time>
                          <h3 className="font-display mt-2 text-[17px] font-semibold tracking-[-0.01em] text-pretty break-words text-[var(--text-primary)]">
                            {entry.title}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-pretty break-words text-[var(--text-secondary)]">
                            {entry.summary}
                          </p>
                          <a
                            href={getEntryUrl(entry.id)}
                            className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-md py-2 text-sm font-semibold text-[var(--accent-primary)] hover:text-[var(--accent-secondary)]"
                          >
                            View on changelog
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="m9 18 6-6-6-6" />
                            </svg>
                          </a>
                        </article>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              <footer className="changelog-sheet-footer shrink-0 border-t border-[color:var(--border-subtle)] bg-[var(--bg-secondary)] p-4 sm:px-6">
                <a
                  href={CHANGELOG_ARCHIVE_URL}
                  className="flex min-h-11 w-full cursor-pointer items-center justify-center rounded-[10px] border border-[color:var(--border-medium)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:border-[color:var(--border-accent)] hover:bg-[var(--accent-glow)]"
                >
                  View all updates
                </a>
              </footer>
            </section>
          </div>,
          document.body,
        )}
    </>
  );
}
