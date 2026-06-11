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
    <section aria-label="Sponsors" className="relative py-10 sm:py-12">
      <div className="container-main flex flex-col items-center gap-4">
        <span
          className="text-[11px] font-medium uppercase tracking-[0.2em]"
          style={{ color: "var(--text-tertiary)", opacity: 0.7 }}
        >
          Sponsored by
        </span>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          <a
            href="https://eido.io/?utm_source=awesome_intune"
            target="_blank"
            rel="noopener noreferrer"
            className="sponsor-logo-link group block transition-all duration-300 hover:scale-[1.02]"
            onClick={() => trackSponsorClick("eido", "hero")}
          >
            {/* Light logo for dark theme (default) */}
            <Image
              src="/sponsors/eido-light.svg"
              alt="eido - Sponsor"
              width={144}
              height={48}
              className="sponsor-logo-dark h-auto w-[108px] opacity-80 transition-opacity duration-300 group-hover:opacity-100 sm:w-[144px]"
            />
            {/* Dark logo for light theme */}
            <Image
              src="/sponsors/eido-dark.svg"
              alt="eido - Sponsor"
              width={144}
              height={48}
              className="sponsor-logo-light h-auto w-[108px] transition-opacity duration-300 group-hover:opacity-100 sm:w-[144px]"
            />
          </a>
          <a
            href="https://zerotouch.ai/?utm_source=awesome_intune"
            target="_blank"
            rel="noopener noreferrer"
            className="sponsor-logo-link group block transition-all duration-300 hover:scale-[1.02]"
            onClick={() => trackSponsorClick("zerotouch", "hero")}
          >
            <Image
              src="/sponsors/zerotouch-light.png"
              alt="ZeroTouch - Sponsor"
              width={200}
              height={80}
              className="sponsor-logo-dark h-[60px] w-auto opacity-80 transition-opacity duration-300 group-hover:opacity-100 sm:h-[80px]"
            />
            <Image
              src="/sponsors/zerotouch-dark.png"
              alt="ZeroTouch - Sponsor"
              width={200}
              height={80}
              className="sponsor-logo-light h-[60px] w-auto transition-opacity duration-300 group-hover:opacity-100 sm:h-[80px]"
            />
          </a>
          <a
            href="https://devicie.com/?utm_source=awesome_intune"
            target="_blank"
            rel="noopener noreferrer"
            className="group block transition-all duration-300 hover:scale-[1.02]"
            onClick={() => trackSponsorClick("devicie", "hero")}
          >
            <Image
              src="/sponsors/devicie.png"
              alt="Devicie - Sponsor"
              width={150}
              height={55}
              className="h-[43px] w-auto opacity-80 transition-opacity duration-300 group-hover:opacity-100 sm:h-[55px]"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
