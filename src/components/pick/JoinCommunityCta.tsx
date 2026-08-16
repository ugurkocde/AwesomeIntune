import { OutboundLink } from "~/components/OutboundLink";
import { PICK_PROGRAM } from "~/lib/pick-config";

type JoinCommunityCtaProps = {
  appearance?: "hero" | "primary";
  className?: string;
};

export function JoinCommunityCta({
  appearance = "primary",
  className = "",
}: JoinCommunityCtaProps) {
  const appearanceClasses =
    appearance === "hero"
      ? "bg-white text-[#005a9e] hover:bg-[#e7f8ff] focus-visible:outline-white"
      : "bg-[var(--accent-solid)] text-white hover:bg-[var(--accent-solid-hover)] focus-visible:outline-[var(--accent-primary)]";

  return (
    <OutboundLink
      href={PICK_PROGRAM.linkedInGroupUrl}
      aria-label="Join the Awesome Intune community on LinkedIn"
      className={`inline-flex min-h-12 touch-manipulation items-center justify-center gap-2 rounded-[10px] px-5 py-3 text-sm font-bold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 ${appearanceClasses} ${className}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className="shrink-0"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
      <span>Join the community</span>
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
        className="shrink-0"
      >
        <path d="M15 3h6v6" />
        <path d="M10 14 21 3" />
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      </svg>
    </OutboundLink>
  );
}
