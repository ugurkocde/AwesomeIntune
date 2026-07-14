"use client";

import Image from "next/image";
import { trackSponsorClick } from "~/lib/plausible";

/**
 * Dedicated sponsor band rendered directly beneath the hero. Standalone so it
 * is always visible regardless of hero height or viewport. Location stays
 * "hero" in tracking for analytics continuity with the previous placement.
 */
export function SponsorStrip() {
  return (
    <section aria-label="Sponsors" className="container-main pb-10">
      <div className="flex flex-wrap items-center justify-center gap-8 rounded-2xl border border-[color:var(--border-subtle)] bg-white px-6 py-6 sm:gap-12 sm:px-10">
        <span className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
          Sponsored by
        </span>
        <a
          href="https://eido.io/?utm_source=awesome_intune"
          target="_blank"
          rel="noopener noreferrer"
          className="sponsor-logo-link group block transition-transform duration-300 hover:scale-[1.02]"
          onClick={() => trackSponsorClick("eido", "hero")}
        >
          {/* Light logo for dark theme (default) */}
          <Image
            src="/sponsors/eido-light.svg"
            alt="eido - Sponsor"
            width={144}
            height={48}
            className="sponsor-logo-dark h-auto w-[100px] opacity-80 transition-opacity duration-300 group-hover:opacity-100 sm:w-[120px]"
          />
          {/* Dark logo for light theme */}
          <Image
            src="/sponsors/eido-dark.svg"
            alt="eido - Sponsor"
            width={144}
            height={48}
            className="sponsor-logo-light h-auto w-[100px] transition-opacity duration-300 group-hover:opacity-100 sm:w-[120px]"
          />
        </a>
        <a
          href="https://zerotouch.ai/?utm_source=awesome_intune"
          target="_blank"
          rel="noopener noreferrer"
          className="sponsor-logo-link group block transition-transform duration-300 hover:scale-[1.02]"
          onClick={() => trackSponsorClick("zerotouch", "hero")}
        >
          <Image
            src="/sponsors/zerotouch-light.png"
            alt="ZeroTouch - Sponsor"
            width={200}
            height={80}
            className="sponsor-logo-dark h-12 w-auto opacity-80 transition-opacity duration-300 group-hover:opacity-100 sm:h-16"
          />
          <Image
            src="/sponsors/zerotouch-dark.png"
            alt="ZeroTouch - Sponsor"
            width={200}
            height={80}
            className="sponsor-logo-light h-12 w-auto transition-opacity duration-300 group-hover:opacity-100 sm:h-16"
          />
        </a>
        <a
          href="https://devicie.com/?utm_source=awesome_intune"
          target="_blank"
          rel="noopener noreferrer"
          className="group block transition-transform duration-300 hover:scale-[1.02]"
          onClick={() => trackSponsorClick("devicie", "hero")}
        >
          <Image
            src="/sponsors/devicie.png"
            alt="Devicie - Sponsor"
            width={150}
            height={55}
            className="h-9 w-auto opacity-70 brightness-0 transition-opacity duration-300 group-hover:opacity-100 sm:h-[44px]"
          />
        </a>
      </div>
    </section>
  );
}
