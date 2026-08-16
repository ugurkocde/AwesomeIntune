import Link from "next/link";
import Image from "next/image";
import { OutboundLink } from "~/components/OutboundLink";
import { JoinCommunityCta } from "~/components/pick/JoinCommunityCta";
import { PickCountdown } from "~/components/pick/PickCountdown";
import { PICK_PROGRAM } from "~/lib/pick-config";
import { picks, type Pick } from "~/lib/picks";

type ContentItem = {
  title: string;
  body: React.ReactNode;
  icon?: React.ReactNode;
};

const headingFont = "font-[family-name:var(--font-pick)]";
const inlineLinkClass =
  "rounded-sm font-semibold text-[var(--accent-primary)] underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]";

// Official Claude mark served by claude.com, embedded to avoid a third-party request.
const claudeLogo =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAEYElEQVR4nMVXW4hVVRjedrMii+6FRRRFUQ9iVNAFKipoKAeC1vrXGTUkSn0xGpyz/nVmHjpRYJQvZQ+R0EOXhyQksQsVKFo9WBORdc6sf59RiWlUyCmly5SWJ/69195n7T3nOo31w2Lm/Ovyf+v7b2sHQQcZXbnyVCoVrpsYFGcE/4eQgdcJoU6oDo2PqMubrakOL7uUNGwkLW6ZU+PVtQNXxMbjYTU83x4kfDenALaX7zqFEI54IH6ulMVZMwAgTLr5z+cUAAtp+ZTPQqjVE4En9XL5JEI4FjGE8FqQkxDVUIhqNERYFcxGamv65ocIoQdib12Ik5N5Wlu4IAVnoOjvJVTDqfsQfuO1bY2NG3E1aVkaQ3VbBgTKJZlYQLksnSuJ6xsA5L2pcQOP+XsIYcoH3lRIw2du8V+Mvh4E85I5i/BRaggh5PiI9FrenejHSg+dH4EqijsJ4WjGdaiGOtIdImzKoDawdbcZONe76bGUBSMfjUGr5Y7i76N1eullhHAwaxw2+ZdpKVXOZ4RtOer2WK1uciy84un3VcritMTPoZFbOF4I1a7c/mqzzGkpdY5qLUv+bQnhTzJq0AH8xbvZKkJ4yf1+mlC+nDP+aw0LNwSzETJwc6jh2+yB8j1r5Iue7muL8JZz186c8Xpo1Irg30htTd98i+qZXED97f1/nBB+yBt2pfvtZmfuK684vWbU4lp56dndAzFqMSHsbm5o5uCc52Dcg+KcUBfuCzWMuACnOMOidYfTBlcZFOftLy85sxMbhLDOO6DlCBF+4uDLseUPPuPd6GAaEQsJ4Q83Mc11PfK9gZ0c2YTqDfa7Raldyq3rlglvHOCUJqPKhNBndf+CzO0oimD4wlE06W7Qq5FM6kXtGeGR0Axc1bWvm9HOhYhrOB9ULQ5cw/7sYJzpHSOEHYRyM/ueBzcqi/IFaxSSUdCxLOeFHyOhgTdd5LcDMMW1gTtgh3j5JCnnbYX9ZQ08Swi/JxFOBjZEf1seLjdzlYz3Fu6P9sd1Ytpbd5gzpaVhpohQPh4FUCO6t9eKcCMhVBJDbUB8nA+2OJPEHXxu0mOaitXi2lxNP2KNXM1l2iK843Tb0pZrYEOSctyULMJXMWA1une4cHHQi1gjV2fo1fB+8hi1Gp50+h85fUMtn4vXqHsI1avZHpGyM26HxJVdGa8HwbxGE1KHOO9TYCV5uyvJx0NUD7COiwmv5YZTK4kLXQDGgTgiFvIj1v2e7LopWa0eZmp96uIuKPc7RtYnekI5EencU4vzvtGI5JZIF7tpOr7QLJ7to/xhgupTx8oujm7WV4riEmfsqP/YIC0/zD/dCGGRK3IHegZgG+33oO/LsAgPumifmFEvGpV0anxo+UUxs/0LmN2ejFMUXGlzWZSZi+s6G/lyBmiUMmVBq/6eb50IFxEuq7WSuDXICSF84FJwa34umtewngx8w608OBFCydeQho0nxEDQCQDfkGu9l6r/PYhOXzpdyD/VGsqNWs3dHgAAAABJRU5ErkJggg==";

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
          <div className="mt-3 text-base leading-7 text-[var(--text-secondary)]">
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
          {item.icon ? (
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#d7d0c4] bg-[#f7f4ed] shadow-sm">
              {item.icon}
            </div>
          ) : (
            <div
              aria-hidden="true"
              className="flex h-11 w-11 items-center justify-center"
            >
              <span className="h-2.5 w-2.5 rotate-45 bg-[var(--accent-primary)]" />
            </div>
          )}
          <h3
            className={`${headingFont} mt-5 text-xl font-bold text-[var(--text-primary)]`}
          >
            {item.title}
          </h3>
          <div className="mt-2 text-base leading-7 text-[var(--text-secondary)]">
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
            <div className="mt-1.5 text-base leading-7 break-words text-[var(--text-secondary)]">
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

function formatProgramDeadline(date: string) {
  const formatted = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: PICK_PROGRAM.timeZone,
  }).format(new Date(date));

  return `${formatted} ${PICK_PROGRAM.timeZone}`;
}

function formatPrizeCap() {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    currencyDisplay: "code",
    maximumFractionDigits: 0,
  }).format(PICK_PROGRAM.prize.maxReimbursementEurPerWinner);
}

function formatPrizeDuration() {
  const { durationMonths } = PICK_PROGRAM.prize;
  return `${durationMonths} ${durationMonths === 1 ? "month" : "months"}`;
}

function groupPicksByMonth(sortedPicks: readonly Pick[]) {
  return sortedPicks.reduce<Map<string, Pick[]>>((groups, pick) => {
    const monthPicks = groups.get(pick.month) ?? [];
    monthPicks.push(pick);
    groups.set(pick.month, monthPicks);
    return groups;
  }, new Map());
}

const howItWorks: readonly ContentItem[] = [
  {
    title: "Share something useful",
    body: (
      <>
        Post your own tool, script, module, blog post, walkthrough, or
        substantial troubleshooting write-up in the Awesome Intune LinkedIn
        group. There is no entry form and no registration.
      </>
    ),
  },
  {
    title: "Awesome Intune reviews the month",
    body: (
      <>
        Qualifying contributions are reviewed manually after the calendar month
        closes in {PICK_PROGRAM.timeZone}. The published criteria are applied
        consistently, without using likes, comments, views, or impressions.
      </>
    ),
  },
  {
    title: "Picks are announced",
    body: (
      <>
        Up to {PICK_PROGRAM.winnersPerMonth} Picks are announced on this page
        and Awesome Intune social channels. Each winner then messages{" "}
        <OutboundLink
          href={PICK_PROGRAM.recognitionPostAuthor.linkedInProfileUrl}
          className={inlineLinkClass}
        >
          {PICK_PROGRAM.recognitionPostAuthor.name} on LinkedIn
        </OutboundLink>{" "}
        within {PICK_PROGRAM.prize.claimWindowDays} days to claim the prize.
      </>
    ),
  },
];

const criteria: readonly ContentItem[] = [
  {
    title: "Usefulness to Intune admins, 50%",
    body: "How directly the contribution helps Intune admins, transfers useful knowledge, or makes a solution easier for others to apply.",
  },
  {
    title: "Originality, 30%",
    body: "Whether the contribution brings a distinct idea, approach, improvement, or perspective to the community.",
  },
  {
    title: "Effort and depth, 20%",
    body: "The meaningful research, implementation, testing, documentation, or explanation demonstrated by the work.",
  },
];

const prize: readonly ContentItem[] = [
  {
    title: "Hall of Fame recognition",
    body: "Each announced Pick and contribution is featured on this page. Winners can ask for their entry to be removed or anonymized.",
  },
  {
    title: "LinkedIn shoutout",
    body: (
      <>
        A dedicated recognition post from{" "}
        <OutboundLink
          href={PICK_PROGRAM.recognitionPostAuthor.linkedInProfileUrl}
          className={inlineLinkClass}
        >
          {PICK_PROGRAM.recognitionPostAuthor.name}&apos;s LinkedIn account
        </OutboundLink>{" "}
        celebrates the knowledge shared.
      </>
    ),
  },
  {
    title: `${formatPrizeDuration()} of ${PICK_PROGRAM.prize.subscriptionName}`,
    body: `Each announced Pick can claim reimbursement for the actual eligible subscription cost, up to ${formatPrizeCap()}, after messaging the organizer and providing a valid receipt.`,
    icon: (
      <Image
        src={claudeLogo}
        width={32}
        height={32}
        alt=""
        aria-hidden="true"
        unoptimized
      />
    ),
  },
];

const essentialRules: readonly ContentItem[] = [
  {
    title: "Who may be recognized",
    body: "People aged 18 or older who belong to the Awesome Intune LinkedIn group when they post and when selections are finalized.",
  },
  {
    title: "What is reviewed",
    body: "Original, substantive, free, and vendor-neutral knowledge shared in the group during the calendar month.",
  },
  {
    title: "How Picks are selected",
    body: "Usefulness 50%, originality 30%, and effort and depth 20%. Engagement numbers are ignored.",
  },
  {
    title: "How winners claim",
    body: (
      <>
        After the announcement, each winner messages{" "}
        <OutboundLink
          href={PICK_PROGRAM.recognitionPostAuthor.linkedInProfileUrl}
          className={inlineLinkClass}
        >
          {PICK_PROGRAM.recognitionPostAuthor.name} on LinkedIn
        </OutboundLink>{" "}
        within {PICK_PROGRAM.prize.claimWindowDays} days. Following the profile
        is optional.
      </>
    ),
  },
];

const terms: readonly ContentItem[] = [
  {
    title: "Organizer",
    body: `${PICK_PROGRAM.organizer.name}, ${PICK_PROGRAM.organizer.address}.`,
  },
  {
    title: "Eligibility",
    body: "People who are at least 18 years old and belong to the Awesome Intune LinkedIn group when they publish their contribution and when selections are finalized may be considered. Following Ugur Koc or any other personal profile is not required and does not affect eligibility. The organizer, anyone materially involved in administering or selecting the Picks, and their household members cannot be selected.",
  },
  {
    title: "Timing",
    body: `Each cycle covers contributions posted during a calendar month in ${PICK_PROGRAM.timeZone}. The first cycle includes qualifying posts published from ${formatProgramDate(PICK_PROGRAM.firstEligibleDate)}. Announcements are planned for the first week of the following month, but eligibility or integrity checks may delay publication.`,
  },
  {
    title: "Qualifying contributions",
    body: "A contribution must be the member's own substantive tool, script, module, blog post, walkthrough, or troubleshooting write-up shared in the group. A substantial update to earlier work can qualify when the new post explains the added value. Pure reshares, unexplained link drops, and posts mainly promoting a paid offer, lead-generation funnel, or commercial service do not qualify.",
  },
  {
    title: "Review, not automatic entry",
    body: "The organizer reviews eligible group posts for potential recognition. Posting does not create a contract or guarantee selection. Participation in the recognition process is free, and no purchase is required to be considered.",
  },
  {
    title: "Selection",
    body: `The organizer may select up to ${PICK_PROGRAM.winnersPerMonth} equal Picks using usefulness to Intune admins (50%), originality (30%), and effort and depth (20%). Likes, comments, views, impressions, audience size, and other engagement signals are not considered. A minimum quality threshold applies, so fewer than ${PICK_PROGRAM.winnersPerMonth} Picks may be selected. If scores are tied, usefulness is compared first, followed by the organizer's final decision. Legal recourse is excluded.`,
  },
  {
    title: "Repeat and collaborative work",
    body: "A person may receive no more than one Pick in a month, but may be recognized in a later month for a distinct contribution. The same contribution can be recognized only once. For collaborative work, the recognition and prize go to the eligible group member who published the qualifying post, while collaborators may be credited with their permission.",
  },
  {
    title: "Integrity and availability",
    body: "The poster must own the contribution or have permission to share it. Plagiarized, unlawful, deceptive, unsafe, or rights-infringing content is excluded. The post must remain accessible when selection is completed. If it is removed later, the Hall of Fame may retain the published description and mark the contribution link as unavailable unless the winner requests removal.",
  },
  {
    title: "Announcement and prize contact",
    body: (
      <>
        Selected Picks are announced on this page and Awesome Intune social
        channels without advance contact. To claim the prize, a winner must
        message{" "}
        <OutboundLink
          href={PICK_PROGRAM.recognitionPostAuthor.linkedInProfileUrl}
          className={inlineLinkClass}
        >
          {PICK_PROGRAM.recognitionPostAuthor.name} on LinkedIn
        </OutboundLink>{" "}
        within {PICK_PROGRAM.prize.claimWindowDays} days after the announcement.
        If no message arrives in time, the reimbursement offer expires, but the
        recognition remains unless the winner asks for removal.
      </>
    ),
  },
  {
    title: "Publication and removal",
    body: (
      <>
        Awesome Intune may publish a selected person&apos;s name, LinkedIn
        profile link, post link, and contribution description on this page and
        its social channels. A winner may object or request removal by LinkedIn
        direct message or email to{" "}
        <a
          href={`mailto:${PICK_PROGRAM.contact.email}`}
          className="font-semibold text-[var(--accent-primary)] underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current"
        >
          {PICK_PROGRAM.contact.email}
        </a>
        . The Hall of Fame entry and references under Awesome Intune&apos;s
        control will then be removed or anonymized where reasonably possible.
        Copies already shared by third parties may remain outside the
        organizer&apos;s control. See the{" "}
        <Link
          href="/privacy#awesome-pick"
          className="font-semibold text-[var(--accent-primary)] underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current"
        >
          Privacy Policy
        </Link>
        .
      </>
    ),
  },
  {
    title: "Prize claim",
    body: `Each announced Pick may claim the actual eligible cost of ${formatPrizeDuration()} of ${PICK_PROGRAM.prize.subscriptionName}, up to ${formatPrizeCap()} including applicable tax. The winner must send a LinkedIn message within ${PICK_PROGRAM.prize.claimWindowDays} days after the announcement and provide a valid receipt using the instructions received in reply. Following the organizer's profile is welcome but not required. An existing annual subscription may be claimed at its documented monthly-equivalent cost. Currency-conversion and payment-provider charges are not reimbursed. The winner is responsible for any personal tax obligations.`,
  },
  {
    title: "Prize limits",
    body: `The prize is personal, non-transferable, and has no cash alternative. A purchase is not required to be considered, but reimbursement requires proof of an eligible subscription cost through a valid receipt. ${PICK_PROGRAM.prize.subscriptionName} must be legally available to the winner. If it is unavailable where a Pick lives, the recognition remains but no substitute prize is provided.`,
  },
  {
    title: "Platform and provider independence",
    body: `This program is not sponsored, endorsed, administered by, or associated with LinkedIn or Anthropic. ${PICK_PROGRAM.prize.subscriptionName} is purchased independently and reimbursed by the organizer.`,
  },
  {
    title: "Future changes",
    body: "The organizer may amend or discontinue the program with effect for future months. Changes do not reduce a prize already claimed from a completed cycle.",
  },
];

const frequentlyAskedQuestions: readonly ContentItem[] = [
  {
    title: "Do likes or impressions help a post get selected?",
    body: "No. Engagement numbers are not reviewed or scored. A quiet post with excellent practical knowledge has the same opportunity as a widely seen post.",
  },
  {
    title: "Do I need to enter or register?",
    body: "No form or registration is needed. You must be at least 18 years old and belong to the Awesome Intune LinkedIn group when you share the post and when selections are finalized.",
  },
  {
    title: "Can an update to existing work be recognized?",
    body: "Yes. A substantial update can qualify when the post clearly explains the new work and the value it adds. A simple reshare or link without meaningful new context does not qualify.",
  },
  {
    title: `Will there always be ${PICK_PROGRAM.winnersPerMonth} Picks?`,
    body: `Up to ${PICK_PROGRAM.winnersPerMonth} equal Picks may be named each month. The quality threshold comes first, so a month can have fewer selections.`,
  },
  {
    title: "When are the Picks announced?",
    body: "The target is the first week of the following month. Eligibility or integrity checks can occasionally make the announcement later.",
  },
  {
    title: "How does a winner claim the prize?",
    body: (
      <>
        After the announcement, message{" "}
        <OutboundLink
          href={PICK_PROGRAM.recognitionPostAuthor.linkedInProfileUrl}
          className={inlineLinkClass}
        >
          {PICK_PROGRAM.recognitionPostAuthor.name} on LinkedIn
        </OutboundLink>{" "}
        within {PICK_PROGRAM.prize.claimWindowDays} days. You will receive the
        reimbursement instructions in reply.
      </>
    ),
  },
  {
    title: `Do I have to follow ${PICK_PROGRAM.recognitionPostAuthor.name}?`,
    body: "No. Following is welcome, but it is not required for eligibility, selection, announcement, or the prize. Winners only need to use the linked profile to send their claim message.",
  },
];

export default function PickPage() {
  const sortedPicks = [...picks].sort((a, b) => b.month.localeCompare(a.month));
  const picksByMonth = groupPicksByMonth(sortedPicks);
  const firstMonth = formatPickMonth(PICK_PROGRAM.firstEligibleMonth);
  const firstEligibleDate = formatProgramDate(PICK_PROGRAM.firstEligibleDate);
  const currentCycleDeadline = formatProgramDeadline(
    PICK_PROGRAM.currentCycle.closesAt,
  );

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
        <div className="container-main relative py-16 sm:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div>
              <p className="font-mono text-xs font-bold tracking-[0.17em] text-[#bceeff] uppercase">
                Monthly community recognition
              </p>
              <h1
                id="pick-title"
                translate="no"
                className={`${headingFont} mt-5 text-[clamp(4rem,9vw,7rem)] leading-[0.88] font-bold tracking-[-0.065em] text-balance text-white`}
              >
                Awesome Pick
              </h1>
              <p className="mt-8 max-w-2xl text-xl leading-8 text-pretty text-white/90 sm:text-2xl sm:leading-9">
                Every month we recognize community contributions for the value
                and knowledge they share with Intune admins.
              </p>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/80">
                Not the most likes. Not the biggest audience. The most useful
                work, judged on what it gives back to the community.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <JoinCommunityCta appearance="hero" />
                <a
                  href="#rules"
                  className="inline-flex min-h-12 touch-manipulation items-center justify-center rounded-[10px] border border-white/45 px-5 py-3 text-sm font-bold text-white transition-colors duration-200 hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  See the rules
                </a>
              </div>
            </div>

            <div>
              <PickCountdown
                target={PICK_PROGRAM.currentCycle.closesAt}
                cycleLabel={PICK_PROGRAM.currentCycle.label}
                deadlineLabel={currentCycleDeadline}
                announcementLabel={
                  PICK_PROGRAM.currentCycle.announcementDisplay
                }
              />
              <p className="mt-4 px-1 text-sm leading-6 text-white/75">
                The first cycle includes qualifying contributions posted from{" "}
                {firstEligibleDate}. You must belong to the LinkedIn group, but
                no form or registration is required.
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
            <SectionHeading id="criteria" eyebrow="Clear and consistent">
              Selection criteria
            </SectionHeading>
            <FeatureCards items={criteria} />

            <div className="mt-8 rounded-2xl border border-[color:var(--border-accent)] bg-[var(--accent-glow)] p-6 sm:p-8">
              <h3
                className={`${headingFont} text-2xl font-bold text-balance text-[var(--text-primary)] sm:text-3xl`}
              >
                Value over visibility
              </h3>
              <p className="mt-3 max-w-4xl text-lg leading-8 text-[var(--text-primary)]">
                Likes, comments, views, impressions, and audience size are not
                selection criteria. Awesome Pick rewards practical value,
                transferable knowledge, originality, and thoughtful effort. A
                contribution can be selected even if very few people saw it.
              </p>
              <p className="mt-3 max-w-4xl text-base leading-7 text-[var(--text-secondary)]">
                Engagement is not used as context or as a tie-breaker. No
                contribution is featured because someone paid. Following the
                organizer or any personal profile is not required or considered,
                and no monthly Pick is ranked above another.
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
          <SectionHeading id="prize" eyebrow="Equal recognition">
            What every Pick receives
          </SectionHeading>
          <FeatureCards items={prize} />
          <div className="mt-6 flex flex-col gap-5 rounded-2xl border border-[color:var(--border-accent)] bg-[var(--accent-glow)] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="max-w-3xl">
              <h3
                className={`${headingFont} text-2xl font-bold text-[var(--text-primary)]`}
              >
                Announced as a Pick?
              </h3>
              <p className="mt-2 text-base leading-7 text-[var(--text-secondary)]">
                Message {PICK_PROGRAM.recognitionPostAuthor.name} on LinkedIn
                within {PICK_PROGRAM.prize.claimWindowDays} days to receive the
                reimbursement instructions. Following the profile is welcome,
                but never required.
              </p>
            </div>
            <OutboundLink
              href={PICK_PROGRAM.recognitionPostAuthor.linkedInProfileUrl}
              className="inline-flex min-h-12 shrink-0 touch-manipulation items-center justify-center gap-2 rounded-[10px] bg-[var(--accent-solid)] px-5 py-3 text-sm font-bold text-white transition-colors duration-200 hover:bg-[var(--accent-solid-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
            >
              Message Ugur on LinkedIn
              <ExternalArrow />
            </OutboundLink>
          </div>
          <p className="mt-6 max-w-4xl text-base leading-7 text-[var(--text-secondary)]">
            The prize is a thank-you, not the purpose of the program. The real
            reward is making valuable community knowledge easier to discover and
            giving its creator lasting credit.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="hall-of-fame"
        className="border-y border-[color:var(--border-subtle)] bg-[var(--bg-secondary)] py-20 sm:py-24"
      >
        <div className="container-main">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              id="hall-of-fame"
              eyebrow="Community knowledge, preserved"
            >
              Hall of Fame
            </SectionHeading>

            {sortedPicks.length > 0 ? (
              <div className="space-y-10">
                {[...picksByMonth].map(([month, monthPicks]) => (
                  <section key={month} aria-labelledby={`picks-${month}`}>
                    <h3
                      id={`picks-${month}`}
                      className={`${headingFont} mb-4 text-2xl font-bold text-[var(--text-primary)]`}
                    >
                      {formatPickMonth(month)}
                    </h3>
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                      {monthPicks.map((pick) => (
                        <article
                          key={`${pick.month}-${pick.postUrl}`}
                          className="rounded-2xl border border-[color:var(--border-subtle)] bg-[var(--bg-primary)] p-6 shadow-[var(--shadow-sm)]"
                        >
                          <p className="font-mono text-xs font-bold tracking-[0.12em] text-[var(--accent-primary)] uppercase">
                            Awesome Pick
                          </p>
                          <h4
                            className={`${headingFont} mt-4 text-2xl font-bold break-words text-[var(--text-primary)]`}
                          >
                            <OutboundLink
                              href={pick.winnerLinkedIn}
                              className="inline-flex items-center gap-2 transition-colors hover:text-[var(--accent-primary)]"
                            >
                              {pick.winnerName}
                              <ExternalArrow />
                            </OutboundLink>
                          </h4>
                          <p className="mt-3 leading-7 break-words text-[var(--text-secondary)]">
                            {pick.contribution}
                          </p>
                          {pick.postAvailable === false ? (
                            <p className="mt-5 text-sm font-semibold text-[var(--text-muted)]">
                              Contribution link unavailable
                            </p>
                          ) : (
                            <OutboundLink
                              href={pick.postUrl}
                              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-bold text-[var(--accent-primary)] underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current"
                            >
                              Recognized contribution
                              <ExternalArrow />
                            </OutboundLink>
                          )}
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-[color:var(--border-accent)] bg-[var(--accent-glow)] p-6 sm:p-10">
                <h3
                  className={`${headingFont} text-2xl font-bold text-balance text-[var(--text-primary)] sm:text-3xl`}
                >
                  First cohort: {firstMonth}
                </h3>
                <p className="mt-3 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
                  The first Hall of Fame entries are waiting to be discovered.
                  Share your own substantial contribution in the group during
                  the current cycle.
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
        aria-labelledby="faq-title"
        className="container-main py-20 sm:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <SectionHeading id="faq-title" eyebrow="Good to know">
            Frequently asked questions
          </SectionHeading>
          <div className="grid gap-4 md:grid-cols-2">
            {frequentlyAskedQuestions.map((item) => (
              <details
                key={item.title}
                className="group rounded-2xl border border-[color:var(--border-subtle)] bg-[var(--bg-secondary)]"
              >
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 font-bold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)] [&::-webkit-details-marker]:hidden">
                  <span>{item.title}</span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="shrink-0 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>
                <div className="border-t border-[color:var(--border-subtle)] px-5 py-5 text-base leading-7 text-[var(--text-secondary)]">
                  {item.body}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section
        id="rules"
        aria-labelledby="terms-title"
        className="scroll-mt-24 border-t border-[color:var(--border-subtle)] bg-[var(--bg-secondary)] py-20 sm:py-24"
      >
        <div className="container-main">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              id="terms-title"
              eyebrow="Transparent from the start"
            >
              Program terms
            </SectionHeading>

            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              {essentialRules.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-[color:var(--border-subtle)] bg-[var(--bg-primary)] p-5"
                >
                  <h3
                    className={`${headingFont} font-bold text-[var(--text-primary)]`}
                  >
                    {item.title}
                  </h3>
                  <p className="mt-2 text-base leading-7 text-[var(--text-secondary)]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>

            <p className="mb-6 rounded-2xl border border-[color:var(--border-medium)] bg-[var(--bg-primary)] p-5 text-base leading-7 text-[var(--text-secondary)] sm:p-6">
              This independent community recognition program is not sponsored,
              endorsed, administered by, or associated with LinkedIn or
              Anthropic.
            </p>

            <details className="group rounded-2xl border border-[color:var(--border-subtle)] bg-[var(--bg-primary)] shadow-[var(--shadow-sm)]">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 font-bold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)] sm:px-6 [&::-webkit-details-marker]:hidden">
                <span>Read the complete program terms</span>
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
                  className="shrink-0 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
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
