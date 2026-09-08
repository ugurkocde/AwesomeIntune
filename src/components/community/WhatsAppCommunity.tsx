import Image from "next/image";
import { CommunityAvatars } from "./CommunityAvatars";
import { WHATSAPP_COMMUNITY } from "~/lib/whatsapp-community";

export function WhatsAppIcon({
  className = "h-5 w-5",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.52 3.48A11.86 11.86 0 0 0 12.05 0C5.47 0 .12 5.35.12 11.93c0 2.1.55 4.15 1.59 5.96L.02 24l6.26-1.64a11.9 11.9 0 0 0 5.77 1.47h.01c6.57 0 11.92-5.35 11.92-11.93 0-3.19-1.24-6.18-3.46-8.42ZM12.06 21.8a9.88 9.88 0 0 1-5.04-1.38l-.36-.21-3.72.98.99-3.62-.24-.37a9.87 9.87 0 0 1-1.51-5.27c0-5.46 4.45-9.91 9.88-9.91a9.83 9.83 0 0 1 7 2.91 9.82 9.82 0 0 1 2.89 7c0 5.46-4.44 9.87-9.89 9.87Zm5.44-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.05-.18-.3-.02-.46.13-.61.13-.13.3-.35.44-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.48 0 1.46 1.06 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.48.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.18-1.41-.08-.13-.27-.2-.57-.35Z" />
    </svg>
  );
}

export function WhatsAppCommunityLink({
  iconOnly = false,
}: {
  iconOnly?: boolean;
}) {
  if (!WHATSAPP_COMMUNITY.inviteUrl) return null;
  return (
    <a
      href={WHATSAPP_COMMUNITY.inviteUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={
        iconOnly
          ? "Join our WhatsApp community (opens in a new tab)"
          : undefined
      }
      title={iconOnly ? "Join our WhatsApp community" : undefined}
      className={`inline-flex min-h-11 touch-manipulation items-center gap-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)] ${iconOnly ? "w-11 justify-center" : "px-3"}`}
    >
      <WhatsAppIcon />
      {!iconOnly && (
        <>
          Join us on WhatsApp
          <span className="sr-only"> (opens in a new tab)</span>
        </>
      )}
    </a>
  );
}

export function WhatsAppCommunityCard() {
  const { inviteUrl, memberCount } = WHATSAPP_COMMUNITY;
  if (!inviteUrl) return null;
  return (
    <section
      aria-labelledby="whatsapp-community-heading"
      className="group overflow-hidden rounded-2xl border border-[color:var(--border-subtle)] bg-[var(--bg-secondary)] shadow-[var(--shadow-md)]"
    >
      <div className="flex items-start gap-4 p-5 sm:p-6">
        <Image
          src="/awesome-a-512.png"
          alt=""
          width={64}
          height={64}
          className="h-14 w-14 shrink-0 rounded-2xl motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:-rotate-3 sm:h-16 sm:w-16"
        />
        <div className="min-w-0">
          <p className="mb-1 text-[11px] font-semibold tracking-[0.12em] text-[var(--text-tertiary)] uppercase">
            The people behind the tools
          </p>
          <h2
            id="whatsapp-community-heading"
            className="font-display text-xl leading-tight font-bold tracking-tight text-[var(--text-primary)]"
          >
            Talk Intune with us.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
            Share tools, ask questions, and compare approaches with other Intune
            admins.
          </p>
        </div>
      </div>
      <div className="mx-5 mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[color:var(--border-subtle)] bg-[var(--bg-primary)] p-3 sm:mx-6 sm:mb-6">
        <div className="flex w-full items-center justify-between gap-3 px-1">
          <div>
            {memberCount !== null ? (
              <>
                <p className="font-display text-2xl leading-none font-bold text-[var(--text-primary)] tabular-nums">
                  {new Intl.NumberFormat("en-US").format(memberCount)}
                </p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  community members
                </p>
              </>
            ) : (
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                Awesome Intune
                <br />
                on WhatsApp
              </p>
            )}
          </div>
          <CommunityAvatars />
        </div>
        <a
          href={inviteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-lg bg-[#146c43] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#105535] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)] max-[390px]:w-full"
        >
          <WhatsAppIcon className="h-[18px] w-[18px] shrink-0" />
          Join the community<span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </section>
  );
}
