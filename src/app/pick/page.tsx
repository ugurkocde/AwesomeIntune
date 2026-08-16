import { OutboundLink } from "~/components/OutboundLink";
import { JoinCommunityCta } from "~/components/pick/JoinCommunityCta";
import { PICK_PROGRAM } from "~/lib/pick-config";
import { picks } from "~/lib/picks";

type ContentItem = {
  title: string;
  body: React.ReactNode;
};

const headingFont = "font-[family-name:var(--font-pick)]";

function SectionHeading({
  id,
  eyebrow,
  children,
}: {
  id: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-10 max-w-3xl">
      <p className="font-mono text-[11px] font-bold tracking-[0.16em] text-[var(--accent-primary)] uppercase">
        {eyebrow}
      </p>
      <h2
        id={id}
        className={`${headingFont} mt-3 text-3xl leading-tight font-bold tracking-[-0.025em] text-balance text-[var(--text-primary)] sm:text-4xl`}
      >
        {children}
      </h2>
    </div>
  );
}

function NumberedCards({ items }: { items: readonly ContentItem[] }) {
  return (
    <ol className="grid gap-4 lg:grid-cols-3">
      {items.map((item, index) => (
        <li
          key={item.title}
          className="rounded-2xl border border-[color:var(--border-subtle)] bg-[var(--bg-secondary)] p-6 shadow-[var(--shadow-sm)]"
        >
          <span
            aria-hidden="true"
            className="flex h-10 w-10 rotate-45 items-center justify-center rounded-[9px] bg-[linear-gradient(135deg,#005a9e,#19a7df)] text-white"
          >
            <span className="-rotate-45 font-mono text-xs font-bold">
              {index + 1}
            </span>
          </span>
          <h3
            className={`${headingFont} mt-6 text-xl leading-snug font-bold text-[var(--text-primary)]`}
          >
            {item.title}
          </h3>
          <div className="mt-3 text-[15px] leading-7 text-[var(--text-secondary)]">
            {item.body}
          </div>
        </li>
      ))}
    </ol>
  );
}

function FeatureCards({ items }: { items: readonly ContentItem[] }) {
  return (
    <ul className="grid gap-4 lg:grid-cols-3">
      {items.map((item) => (
        <li
          key={item.title}
          className="rounded-2xl border border-[color:var(--border-subtle)] bg-[var(--bg-secondary)] p-6"
        >
          <div
            aria-hidden="true"
            className="h-2.5 w-2.5 rotate-45 bg-[var(--accent-primary)]"
          />
          <h3
            className={`${headingFont} mt-5 text-xl font-bold text-[var(--text-primary)]`}
          >
            {item.title}
          </h3>
          <div className="mt-2 text-[15px] leading-7 text-[var(--text-secondary)]">
            {item.body}
          </div>
        </li>
      ))}
    </ul>
  );
}

function TermsList({ items }: { items: readonly ContentItem[] }) {
  return (
    <ol className="grid gap-x-12 gap-y-8 md:grid-cols-2">
      {items.map((item, index) => (
        <li key={item.title} className="flex min-w-0 gap-3">
          <span className="mt-0.5 shrink-0 font-mono text-xs font-bold text-[var(--accent-primary)]">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <h3
              className={`${headingFont} text-base font-bold text-[var(--text-primary)]`}
            >
              {item.title}
            </h3>
            <div className="mt-1.5 text-sm leading-6 break-words text-[var(--text-secondary)]">
              {item.body}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function ExternalArrow() {
  return (
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
      className="shrink-0"
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function formatPickMonth(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  if (!year || !monthNumber) return month;

  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
}

function formatProgramDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function formatPrizeValue() {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    currencyDisplay: "code",
    maximumFractionDigits: 0,
  }).format(PICK_PROGRAM.prize.approximateValueEur);
}

const howItWorks: readonly ContentItem[] = [
  {
    title: "Post in the group",
    body: (
      <>
        Share your own tool, script, module, blog post, walkthrough, or
        substantial troubleshooting write-up in the Awesome Intune LinkedIn
        group. No entry form is needed. Posting is entering. Reshares without
        your own contribution, pure link drops, and promotional posts do not
        qualify.
      </>
    ),
  },
  {
    title: "The jury reviews at month end",
    body: (
      <>
        Every qualifying post from the calendar month is reviewed. Calendar
        months follow {PICK_PROGRAM.timeZone} time. {PICK_PROGRAM.jury.lead} and
        invited community co-jurors make the final decision.
      </>
    ),
  },
  {
    title: "The winner is featured and receives the prize",
    body: (
      <>
        Pick of the Month opens on the 1st. One winner is announced in the first
        week of the following month and receives a permanent place in the Hall
        of Fame.
      </>
    ),
  },
];

const criteria: readonly ContentItem[] = [
  {
    title: "Usefulness to Intune admins",
    body: "How directly and practically the contribution helps Intune admins solve real work.",
  },
  {
    title: "Originality",
    body: "Whether the contribution brings a distinct idea, approach, or perspective to the community.",
  },
  {
    title: "Effort and depth",
    body: "The meaningful research, implementation, testing, or explanation demonstrated by the work.",
  },
];

const prize: readonly ContentItem[] = [
  {
    title: "Permanent Hall of Fame entry",
    body: "The winner and contribution remain featured on this page.",
  },
  {
    title: "LinkedIn shoutout",
    body: `A dedicated recognition post from ${PICK_PROGRAM.jury.lead}'s LinkedIn account.`,
  },
  {
    title: `${PICK_PROGRAM.prize.durationMonths} months of ${PICK_PROGRAM.prize.subscriptionName}`,
    body: `Reimbursed after a valid payment receipt is provided, with an approximate value of ${formatPrizeValue()}.`,
  },
];

const terms: readonly ContentItem[] = [
  {
    title: "Organizer",
    body: `${PICK_PROGRAM.organizer.name}, ${PICK_PROGRAM.organizer.address}.`,
  },
  {
    title: "Eligibility",
    body: "Members of the Awesome Intune LinkedIn group who are at least 18 years old are eligible. Jurors cannot win while serving on the jury.",
  },
  {
    title: "Participation",
    body: "Participation is automatic through a qualifying post published in the group during the relevant calendar month. Participation is free, and no purchase is necessary.",
  },
  {
    title: "Winner selection",
    body: "The jury selects the winner using the published criteria. The jury's decision is final. Legal recourse is excluded.",
  },
  {
    title: "Winner contact",
    body: "Winners are contacted by LinkedIn direct message. If a winner does not respond within 14 days, the jury may select another winner.",
  },
  {
    title: "Publication and consent",
    body: (
      <>
        By participating, members consent to being named as a winner with their
        name, profile link, and post link on this page and on Awesome Intune
        social channels. The GDPR basis is consent. Consent can be revoked at
        any time by LinkedIn direct message to the organizer or by email to{" "}
        <a
          href={`mailto:${PICK_PROGRAM.contact.email}`}
          className="font-semibold text-[var(--accent-primary)] underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current"
        >
          {PICK_PROGRAM.contact.email}
        </a>
        .
      </>
    ),
  },
  {
    title: "Prize",
    body: `The prize is not transferable, and there is no cash alternative. Reimbursement of the ${PICK_PROGRAM.prize.subscriptionName} subscription requires a valid payment receipt.`,
  },
  {
    title: "LinkedIn independence",
    body: "This program is not sponsored, endorsed, administered by, or associated with LinkedIn.",
  },
  {
    title: "Future changes",
    body: "The organizer may amend or discontinue the program with effect for future months.",
  },
];

export default function PickPage() {
  const sortedPicks = [...picks].sort((a, b) => b.month.localeCompare(a.month));
  const firstMonth = formatPickMonth(PICK_PROGRAM.firstEligibleMonth);
  const firstEligibleDate = formatProgramDate(PICK_PROGRAM.firstEligibleDate);

  return (
    <div className="overflow-hidden bg-[var(--bg-primary)]">
      <section
        aria-labelledby="pick-title"
        className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#005a9e_0%,#0078d4_55%,#19a7df_100%)] pt-[68px] text-white"
      >
        <div
          aria-hidden="true"
          className="absolute top-28 -right-24 h-80 w-80 rotate-45 rounded-[52px] border border-white/15 bg-white/5"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-28 h-72 w-72 rotate-45 rounded-[44px] border border-[#bceeff]/20 bg-[#63d2fa]/10"
        />
        <div className="container-main relative py-20 sm:py-24 lg:py-28">
          <div className="max-w-5xl">
            <p className="font-mono text-xs font-bold tracking-[0.17em] text-[#bceeff] uppercase">
              Monthly community recognition
            </p>
            <h1
              id="pick-title"
              translate="no"
              className={`${headingFont} mt-5 text-[clamp(4.25rem,12vw,8.5rem)] leading-[0.88] font-bold tracking-[-0.065em] text-balance text-white`}
            >
              Awesome Pick
            </h1>
            <p className="mt-10 max-w-3xl text-xl leading-8 text-pretty text-white/90 sm:text-2xl sm:leading-9">
              Every month we recognize the most useful community contribution in
              the Awesome Intune group.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <JoinCommunityCta appearance="hero" />
              <a
                href="#rules"
                className="inline-flex min-h-12 touch-manipulation items-center justify-center rounded-[10px] border border-white/45 px-5 py-3 text-sm font-bold text-white transition-colors duration-200 hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                See the rules
              </a>
            </div>

            <div className="mt-12 grid max-w-4xl gap-4 rounded-2xl border border-white/20 bg-[#005a9e]/35 p-5 backdrop-blur-sm sm:grid-cols-2 sm:p-6">
              <p className="text-sm leading-6 text-white/90 sm:pr-8">
                <strong className="text-white">Started in {firstMonth}.</strong>{" "}
                Every qualifying post published from {firstEligibleDate} is
                included.
              </p>
              <p className="border-t border-white/15 pt-4 text-sm leading-6 text-white/90 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-8">
                <strong className="text-white">No entry form.</strong> Posting
                your own qualifying contribution in the group is all it takes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="how-it-works"
        className="container-main py-20 sm:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <SectionHeading id="how-it-works" eyebrow="Simple by design">
            How it works
          </SectionHeading>
          <NumberedCards items={howItWorks} />
        </div>
      </section>

      <section
        aria-labelledby="criteria"
        className="border-y border-[color:var(--border-subtle)] bg-[var(--bg-secondary)] py-20 sm:py-24"
      >
        <div className="container-main">
          <div className="mx-auto max-w-6xl">
            <SectionHeading id="criteria" eyebrow="Published in order">
              Selection criteria
            </SectionHeading>
            <FeatureCards items={criteria} />

            <div className="mt-8 rounded-2xl border border-[color:var(--border-accent)] bg-[var(--accent-glow)] p-6 sm:p-8">
              <p className="max-w-4xl text-lg leading-8 text-[var(--text-primary)]">
                <strong>
                  Likes and comments are not the selection metric.
                </strong>{" "}
                Engagement may give the jury context, but it never decides the
                winner. No contribution is ranked or featured because someone
                paid.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="prize"
        className="container-main py-20 sm:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <SectionHeading id="prize" eyebrow="Recognition that lasts">
            What the winner receives
          </SectionHeading>
          <FeatureCards items={prize} />
        </div>
      </section>

      <section
        aria-labelledby="hall-of-fame"
        className="border-y border-[color:var(--border-subtle)] bg-[var(--bg-secondary)] py-20 sm:py-24"
      >
        <div className="container-main">
          <div className="mx-auto max-w-6xl">
            <SectionHeading id="hall-of-fame" eyebrow="Every Pick, preserved">
              Hall of Fame
            </SectionHeading>

            {sortedPicks.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                {sortedPicks.map((pick) => (
                  <article
                    key={pick.month}
                    className="rounded-2xl border border-[color:var(--border-subtle)] bg-[var(--bg-primary)] p-6 shadow-[var(--shadow-sm)]"
                  >
                    <time
                      dateTime={pick.month}
                      className="font-mono text-xs font-bold tracking-[0.12em] text-[var(--accent-primary)] uppercase"
                    >
                      {formatPickMonth(pick.month)}
                    </time>
                    <h3
                      className={`${headingFont} mt-4 text-2xl font-bold break-words text-[var(--text-primary)]`}
                    >
                      <OutboundLink
                        href={pick.winnerLinkedIn}
                        className="inline-flex items-center gap-2 transition-colors hover:text-[var(--accent-primary)]"
                      >
                        {pick.winnerName}
                        <ExternalArrow />
                      </OutboundLink>
                    </h3>
                    <p className="mt-3 leading-7 break-words text-[var(--text-secondary)]">
                      {pick.contribution}
                    </p>
                    <OutboundLink
                      href={pick.postUrl}
                      className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-bold text-[var(--accent-primary)] underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current"
                    >
                      Winning post
                      <ExternalArrow />
                    </OutboundLink>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-[color:var(--border-accent)] bg-[var(--accent-glow)] p-6 sm:p-10">
                <h3
                  className={`${headingFont} text-2xl font-bold text-balance text-[var(--text-primary)] sm:text-3xl`}
                >
                  First Pick: {firstMonth}
                </h3>
                <p className="mt-3 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
                  The first place in the Hall of Fame is waiting. Post your own
                  contribution in the group to be in the running.
                </p>
                <div className="mt-7">
                  <JoinCommunityCta />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section
        id="rules"
        aria-labelledby="terms-title"
        className="scroll-mt-24 py-20 sm:py-24"
      >
        <div className="container-main">
          <div className="mx-auto max-w-6xl">
            <SectionHeading id="terms-title" eyebrow="The complete rules">
              Participation terms
            </SectionHeading>

            <p className="mb-6 rounded-2xl border border-[color:var(--border-medium)] bg-[var(--bg-secondary)] p-5 text-sm leading-6 text-[var(--text-secondary)] sm:p-6">
              This program is not sponsored, endorsed, administered by, or
              associated with LinkedIn.
            </p>

            <details className="group rounded-2xl border border-[color:var(--border-subtle)] bg-[var(--bg-secondary)] shadow-[var(--shadow-sm)]">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 font-bold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)] sm:px-6 [&::-webkit-details-marker]:hidden">
                <span>Read the full terms</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="shrink-0 transition-transform duration-200 group-open:rotate-180"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <div className="border-t border-[color:var(--border-subtle)] px-5 py-8 sm:px-8 sm:py-10">
                <TermsList items={terms} />
              </div>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}
