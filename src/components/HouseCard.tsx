"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  HOUSE_MESSAGES,
  houseAdUrl,
  pickHouseMessage,
  type HouseMessage,
} from "~/lib/house-ad";
import { trackHouseAdClick } from "~/lib/plausible";

// Reading the property can throw where storage is blocked.
function browserStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

interface HouseCardProps {
  placement: "home_grid" | "home_list";
  className?: string;
}

/**
 * One row for TenuVault inside the tool list, labelled as the maintainer's
 * own product so nobody mistakes it for a directory entry or a sponsor. It
 * spans the full width between two rows of tools and takes no tool's place.
 *
 * The pages are static, so the visitor's message is only known in the browser.
 * The row is rendered with its full size from the start and the text fades in
 * once the message is picked: the tools after it never move.
 */
export function HouseCard({ placement, className = "" }: HouseCardProps) {
  const [message, setMessage] = useState<HouseMessage | null>(null);

  useEffect(() => {
    setMessage(pickHouseMessage(browserStorage()));
  }, []);

  // The longer message holds the space until the visitor's own one is known.
  const shown = message ?? HOUSE_MESSAGES.restore;
  const ready = message !== null;
  const fade = `transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`;

  return (
    <aside
      aria-label="TenuVault, from the maker of Awesome Intune"
      data-house-card={ready ? shown.id : "pending"}
      className={`rounded-[14px] border border-[color:var(--border-accent)] bg-[var(--bg-secondary)] p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] ${className}`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        <Image
          src="/images/tenuvault-icon.svg"
          alt=""
          width={48}
          height={48}
          className="hidden h-12 w-12 flex-none rounded-xl sm:block"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-[var(--text-tertiary)] uppercase">
            TenuVault · From the maker of Awesome Intune
          </p>
          <div
            className={`mt-1.5 min-h-[5.5rem] sm:min-h-[4.25rem] ${fade}`}
            aria-hidden={!ready}
          >
            <p className="font-display text-[17px] leading-tight font-bold text-[var(--text-primary)]">
              {shown.headline}
            </p>
            <p className="mt-1.5 text-[13px] leading-[1.6] text-[var(--text-secondary)]">
              {shown.body}
            </p>
          </div>
        </div>
        <div className="flex flex-none flex-wrap gap-2.5">
          <Link
            href="/tools/tenuvault"
            className="flex flex-1 items-center justify-center rounded-xl border border-[color:var(--border-subtle)] bg-[var(--bg-tertiary)] px-4 py-2.5 text-sm font-medium whitespace-nowrap text-[var(--text-secondary)] transition-[background-color,color] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
          >
            Directory entry
          </Link>
          <a
            href={houseAdUrl(shown, placement)}
            target="_blank"
            rel="sponsored noopener"
            tabIndex={ready ? undefined : -1}
            onClick={() => trackHouseAdClick(shown.id, placement)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--accent-solid)] px-4 py-2.5 text-sm font-medium whitespace-nowrap text-white transition-[background-color,opacity,transform] hover:bg-[var(--accent-solid-hover)] active:scale-[0.98] ${fade}`}
          >
            {shown.action}
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
          </a>
        </div>
      </div>
    </aside>
  );
}
