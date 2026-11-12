"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  HOUSE_MESSAGES,
  HOUSE_MESSAGE_IDS,
  houseAdUrl,
  houseMessageFor,
  type HouseMessage,
} from "~/lib/house-ad";
import { trackHouseAdClick } from "~/lib/plausible";

interface HouseCardProps {
  placement: "home_grid" | "home_list";
  className?: string;
}

const MESSAGES = HOUSE_MESSAGE_IDS.map((id) => HOUSE_MESSAGES[id]);

/**
 * One row for TenuVault inside the tool list, labelled as the maintainer's
 * own product so nobody mistakes it for a directory entry or a sponsor. It
 * spans the full width between two rows of tools and takes no tool's place.
 *
 * The pages are static and may be served a day after they were built, so the
 * day's message is only known in the browser. Every message is laid out in
 * the same place and only the day's one is visible: the row has its final
 * size at any width, the tools after it never move, and nothing is visible or
 * clickable before the message is known.
 */
export function HouseCard({ placement, className = "" }: HouseCardProps) {
  const [message, setMessage] = useState<HouseMessage | null>(null);

  useEffect(() => {
    setMessage(houseMessageFor(new Date()));
  }, []);

  const link = message ?? MESSAGES[0]!;
  const stacked = (candidate: HouseMessage) =>
    `col-start-1 row-start-1 transition-opacity duration-300 ${
      candidate.id === message?.id ? "opacity-100" : "invisible opacity-0"
    }`;

  return (
    <aside
      aria-label="TenuVault, from the maker of Awesome Intune"
      data-house-card={message ? message.id : "pending"}
      className={`rounded-[14px] border border-[color:var(--border-subtle)] bg-[var(--bg-secondary)] p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] ${className}`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-[var(--text-tertiary)] uppercase">
            TenuVault · From the maker of Awesome Intune
          </p>
          <div className="mt-1.5 grid">
            {MESSAGES.map((candidate) => (
              <div
                key={candidate.id}
                aria-hidden={candidate.id !== message?.id}
                className={stacked(candidate)}
              >
                <p className="font-display text-[17px] leading-tight font-bold text-[var(--text-primary)]">
                  {candidate.headline}
                </p>
                <p className="mt-1.5 text-[13px] leading-[1.6] text-[var(--text-secondary)]">
                  {candidate.body}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-none flex-wrap gap-2.5">
          <Link
            href="/tools/tenuvault"
            className="flex flex-1 items-center justify-center rounded-xl border border-[color:var(--border-subtle)] bg-[var(--bg-tertiary)] px-4 py-2.5 text-sm font-medium whitespace-nowrap text-[var(--text-secondary)] transition-[background-color,color] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
          >
            Details
          </Link>
          <a
            href={houseAdUrl(link, placement)}
            target="_blank"
            rel="sponsored noopener"
            onClick={() => trackHouseAdClick(link.tag, placement)}
            className={`grid flex-1 rounded-xl border border-[color:var(--accent-primary)] px-4 py-2.5 text-sm font-medium whitespace-nowrap text-[var(--accent-primary)] transition-[background-color,color,opacity] duration-300 hover:bg-[var(--accent-glow)] hover:text-[var(--accent-secondary)] ${
              message ? "opacity-100" : "invisible opacity-0"
            }`}
          >
            {/* Both labels share one cell, so the button is as wide as the
                longer one and the row wraps the same way for either. */}
            {MESSAGES.map((candidate) => (
              <span
                key={candidate.id}
                aria-hidden={candidate.id !== message?.id}
                className={`col-start-1 row-start-1 inline-flex items-center justify-center gap-2 ${
                  candidate.id === message?.id ? "" : "invisible"
                }`}
              >
                {candidate.action}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </span>
            ))}
            <span className="sr-only">(opens in new tab)</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
