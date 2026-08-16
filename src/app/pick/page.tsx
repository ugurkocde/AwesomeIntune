import { JoinCommunityCta } from "~/components/pick/JoinCommunityCta";
import { OutboundLink } from "~/components/OutboundLink";
import { PICK_PROGRAM } from "~/lib/pick-config";
import { picks } from "~/lib/picks";

type ContentItem = {
  title: string;
  body: React.ReactNode;
};

type TermItem = {
  title: string;
  body: React.ReactNode;
};

const headingFont = "font-[family-name:var(--font-pick)]";

function BilingualColumns({
  children,
  pairId,
}: {
  children: [React.ReactNode, React.ReactNode];
  pairId: string;
}) {
  return (
    <div
      className="grid gap-10 md:grid-cols-2 md:gap-0"
      data-language-pair={pairId}
    >
      <div lang="en" className="md:pr-10 lg:pr-14">
        <p className="mb-5 font-mono text-[11px] font-bold tracking-[0.16em] text-[var(--accent-primary)] uppercase">
          English
        </p>
        {children[0]}
      </div>
      <div
        lang="de"
        className="border-t border-[color:var(--border-subtle)] pt-10 md:border-t-0 md:border-l md:pt-0 md:pl-10 lg:pl-14"
      >
        <p className="mb-5 font-mono text-[11px] font-bold tracking-[0.16em] text-[var(--accent-primary)] uppercase">
          Deutsch
        </p>
        {children[1]}
      </div>
    </div>
  );
}

function SectionHeading({ en, de }: { en: string; de: string }) {
  return (
    <h2
      className={`${headingFont} mb-10 text-3xl leading-tight font-bold tracking-[-0.025em] text-balance text-[var(--text-primary)] sm:text-4xl`}
    >
      <span lang="en">{en}</span>
      <span aria-hidden="true" className="mx-2 text-[var(--border-medium)]">
        /
      </span>
      <span lang="de">{de}</span>
    </h2>
  );
}

function NumberedList({ items }: { items: readonly ContentItem[] }) {
  return (
    <ol className="space-y-4">
      {items.map((item, index) => (
        <li
          key={item.title}
          className="rounded-2xl border border-[color:var(--border-subtle)] bg-[var(--bg-secondary)] p-5 shadow-[var(--shadow-sm)] sm:p-6"
        >
          <div className="flex gap-4">
            <span
              aria-hidden="true"
              className="mt-1 flex h-9 w-9 shrink-0 rotate-45 items-center justify-center rounded-[8px] bg-[linear-gradient(135deg,#005a9e,#19a7df)] text-white"
            >
              <span className="-rotate-45 font-mono text-xs font-bold">
                {index + 1}
              </span>
            </span>
            <div>
              <h3
                className={`${headingFont} text-lg leading-snug font-bold text-[var(--text-primary)]`}
              >
                {item.title}
              </h3>
              <div className="mt-2 text-[15px] leading-7 text-[var(--text-secondary)]">
                {item.body}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function FeatureList({ items }: { items: readonly ContentItem[] }) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li
          key={item.title}
          className="border-l-2 border-[var(--accent-primary)] py-2 pl-5"
        >
          <h3
            className={`${headingFont} text-lg font-bold text-[var(--text-primary)]`}
          >
            {item.title}
          </h3>
          <div className="mt-1.5 text-[15px] leading-7 text-[var(--text-secondary)]">
            {item.body}
          </div>
        </li>
      ))}
    </ul>
  );
}

function TermsList({ items }: { items: readonly TermItem[] }) {
  return (
    <ol className="space-y-7">
      {items.map((item, index) => (
        <li key={item.title} className="flex gap-3">
          <span className="mt-0.5 font-mono text-xs font-bold text-[var(--accent-primary)]">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <h3
              className={`${headingFont} text-base font-bold text-[var(--text-primary)]`}
            >
              {item.title}
            </h3>
            <div className="mt-1.5 text-sm leading-6 text-[var(--text-secondary)]">
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

function formatPickMonth(month: string, locale: "en-GB" | "de-DE") {
  const [year, monthNumber] = month.split("-").map(Number);
  if (!year || !monthNumber) return month;

  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
}

function formatProgramDate(date: string, locale: "en-GB" | "de-DE") {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function formatPrizeValue(locale: "en-GB" | "de-DE") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    currencyDisplay: "code",
    maximumFractionDigits: 0,
  }).format(PICK_PROGRAM.prize.approximateValueEur);
}

const howItWorksEn: readonly ContentItem[] = [
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
        Pick of the Month opens on the 1st. The winner is announced in the first
        week of the following month and receives a permanent place in the Hall
        of Fame.
      </>
    ),
  },
];

const howItWorksDe: readonly ContentItem[] = [
  {
    title: "In der Gruppe posten",
    body: (
      <>
        Teile deinen eigenen Beitrag in der Awesome Intune LinkedIn-Gruppe, zum
        Beispiel ein Tool, Skript, Modul, einen Blogbeitrag, eine Anleitung oder
        eine ausführliche Problemlösung. Es gibt kein Teilnahmeformular. Dein
        Beitrag ist deine Teilnahme. Reine Reshares ohne eigenen Inhalt, bloße
        Link-Posts und Werbebeiträge qualifizieren sich nicht.
      </>
    ),
  },
  {
    title: "Die Jury prüft zum Monatsende",
    body: (
      <>
        Alle qualifizierenden Beiträge des Kalendermonats werden geprüft. Für
        die Monatsgrenzen gilt die Zeitzone {PICK_PROGRAM.timeZone}. Die
        endgültige Entscheidung treffen {PICK_PROGRAM.jury.lead} und eingeladene
        Co-Jurorinnen und Co-Juroren aus der Community.
      </>
    ),
  },
  {
    title: "Der ausgezeichnete Beitrag erhält Sichtbarkeit und den Preis",
    body: (
      <>
        Der Pick of the Month beginnt am 1. des Monats. Die Bekanntgabe erfolgt
        in der ersten Woche des Folgemonats. Der ausgezeichnete Beitrag erhält
        einen dauerhaften Platz in der Hall of Fame.
      </>
    ),
  },
];

const criteriaEn: readonly ContentItem[] = [
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

const criteriaDe: readonly ContentItem[] = [
  {
    title: "Nutzen für Intune-Admins",
    body: "Wie direkt und praktisch der Beitrag Intune-Admins bei ihrer täglichen Arbeit hilft.",
  },
  {
    title: "Originalität",
    body: "Ob der Beitrag eine eigenständige Idee, Herangehensweise oder Perspektive in die Community einbringt.",
  },
  {
    title: "Aufwand und Tiefe",
    body: "Welche erkennbare Recherche, Umsetzung, Prüfung oder Erklärung in der Arbeit steckt.",
  },
];

const prizeEn: readonly ContentItem[] = [
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
    body: `Reimbursed after a valid payment receipt is provided, with an approximate value of ${formatPrizeValue("en-GB")}.`,
  },
];

const prizeDe: readonly ContentItem[] = [
  {
    title: "Dauerhafter Eintrag in der Hall of Fame",
    body: "Die ausgezeichnete Person und ihr Beitrag bleiben dauerhaft auf dieser Seite sichtbar.",
  },
  {
    title: "LinkedIn-Shoutout",
    body: `Ein eigener Anerkennungsbeitrag über den LinkedIn-Account von ${PICK_PROGRAM.jury.lead}.`,
  },
  {
    title: `${PICK_PROGRAM.prize.durationMonths} Monate ${PICK_PROGRAM.prize.subscriptionName}`,
    body: `Erstattung nach Vorlage eines gültigen Zahlungsbelegs, im ungefähren Wert von ${formatPrizeValue("de-DE")}.`,
  },
];

const termsEn: readonly TermItem[] = [
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
    body: (
      <>
        The jury selects the winner using the published criteria. The
        jury&apos;s decision is final. Legal recourse is excluded (Der Rechtsweg
        ist ausgeschlossen).
      </>
    ),
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

const termsDe: readonly TermItem[] = [
  {
    title: "Veranstalter",
    body: `${PICK_PROGRAM.organizer.name}, ${PICK_PROGRAM.organizer.address}.`,
  },
  {
    title: "Teilnahmeberechtigung",
    body: "Teilnahmeberechtigt sind Mitglieder der Awesome Intune LinkedIn-Gruppe ab 18 Jahren. Mitglieder der Jury sind während ihrer Tätigkeit von der Auszeichnung ausgeschlossen.",
  },
  {
    title: "Teilnahme",
    body: "Die Teilnahme erfolgt automatisch durch einen qualifizierenden Beitrag, der im jeweiligen Kalendermonat in der Gruppe veröffentlicht wird. Die Teilnahme ist kostenlos und nicht an einen Kauf gebunden.",
  },
  {
    title: "Auswahl",
    body: "Die Jury wählt den ausgezeichneten Beitrag anhand der veröffentlichten Kriterien aus. Die Entscheidung der Jury ist endgültig. Der Rechtsweg ist ausgeschlossen.",
  },
  {
    title: "Kontaktaufnahme",
    body: "Die ausgezeichnete Person wird per LinkedIn-Direktnachricht kontaktiert. Erfolgt innerhalb von 14 Tagen keine Antwort, kann die Jury eine andere Person auswählen.",
  },
  {
    title: "Veröffentlichung und Einwilligung",
    body: (
      <>
        Mit der Teilnahme willigen Mitglieder ein, im Fall einer Auszeichnung
        mit Name, Profillink und Beitragslink auf dieser Seite sowie auf den
        Social-Media-Kanälen von Awesome Intune genannt zu werden.
        Rechtsgrundlage nach DSGVO ist die Einwilligung. Sie kann jederzeit per
        LinkedIn-Direktnachricht an den Veranstalter oder per E-Mail an{" "}
        <a
          href={`mailto:${PICK_PROGRAM.contact.email}`}
          className="font-semibold text-[var(--accent-primary)] underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current"
        >
          {PICK_PROGRAM.contact.email}
        </a>{" "}
        widerrufen werden.
      </>
    ),
  },
  {
    title: "Preis",
    body: `Der Preis ist nicht übertragbar. Eine Barauszahlung ist ausgeschlossen. Für die Erstattung des ${PICK_PROGRAM.prize.subscriptionName}-Abonnements ist ein gültiger Zahlungsbeleg erforderlich.`,
  },
  {
    title: "Unabhängigkeit von LinkedIn",
    body: "Dieses Programm wird weder von LinkedIn gesponsert, unterstützt oder verwaltet, noch steht es mit LinkedIn in Verbindung.",
  },
  {
    title: "Künftige Änderungen",
    body: "Der Veranstalter kann das Programm mit Wirkung für zukünftige Monate ändern oder einstellen.",
  },
];

export default function PickPage() {
  const sortedPicks = [...picks].sort((a, b) => b.month.localeCompare(a.month));
  const firstMonthEn = formatPickMonth(
    PICK_PROGRAM.firstEligibleMonth,
    "en-GB",
  );
  const firstMonthDe = formatPickMonth(
    PICK_PROGRAM.firstEligibleMonth,
    "de-DE",
  );
  const firstEligibleDateEn = formatProgramDate(
    PICK_PROGRAM.firstEligibleDate,
    "en-GB",
  );
  const firstEligibleDateDe = formatProgramDate(
    PICK_PROGRAM.firstEligibleDate,
    "de-DE",
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
        <div className="container-main relative py-20 sm:py-24 lg:py-28">
          <div className="max-w-5xl">
            <p className="font-mono text-xs font-bold tracking-[0.17em] text-[#bceeff] uppercase">
              <span lang="en">Monthly community recognition</span>
              <span aria-hidden="true" className="mx-2 text-white/40">
                /
              </span>
              <span lang="de">Monatliche Community-Auszeichnung</span>
            </p>
            <h1
              id="pick-title"
              translate="no"
              className={`${headingFont} mt-5 text-[clamp(4.25rem,12vw,8.5rem)] leading-[0.88] font-bold tracking-[-0.065em] text-balance text-white`}
            >
              Awesome Pick
            </h1>

            <div
              className="mt-10 grid gap-7 text-lg leading-8 text-white/90 md:grid-cols-2 md:gap-12"
              data-language-pair="hero-copy"
            >
              <p lang="en" className="max-w-xl">
                Every month we recognize the most useful community contribution
                in the Awesome Intune group.
              </p>
              <p
                lang="de"
                className="max-w-xl md:border-l md:border-white/20 md:pl-12"
              >
                Jeden Monat würdigen wir den nützlichsten Community-Beitrag in
                der Awesome Intune Gruppe.
              </p>
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <JoinCommunityCta appearance="hero" />
              <a
                href="#rules"
                className="inline-flex min-h-12 touch-manipulation items-center justify-center rounded-[10px] border border-white/45 px-5 py-3 text-sm font-bold text-white transition-colors duration-200 hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span lang="en">See the rules</span>
                <span aria-hidden="true" className="mx-2 opacity-50">
                  /
                </span>
                <span lang="de">Regeln ansehen</span>
              </a>
            </div>

            <div className="mt-12 grid max-w-4xl gap-4 rounded-2xl border border-white/20 bg-[#005a9e]/35 p-5 backdrop-blur-sm sm:p-6 md:grid-cols-2 md:gap-0">
              <p lang="en" className="text-sm leading-6 text-white/90 md:pr-8">
                <strong className="text-white">
                  Started in {firstMonthEn}.
                </strong>{" "}
                Every qualifying post published from {firstEligibleDateEn} is
                included. No entry form, no registration.
              </p>
              <p
                lang="de"
                className="border-t border-white/15 pt-4 text-sm leading-6 text-white/90 md:border-t-0 md:border-l md:pt-0 md:pl-8"
              >
                <strong className="text-white">Start im {firstMonthDe}.</strong>{" "}
                Alle qualifizierenden Beiträge seit dem {firstEligibleDateDe}{" "}
                sind dabei. Kein Teilnahmeformular, keine Registrierung.
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
          <div id="how-it-works">
            <SectionHeading en="How it works" de="So funktioniert es" />
          </div>
          <BilingualColumns pairId="how-it-works">
            <NumberedList items={howItWorksEn} />
            <NumberedList items={howItWorksDe} />
          </BilingualColumns>
        </div>
      </section>

      <section
        aria-labelledby="criteria"
        className="border-y border-[color:var(--border-subtle)] bg-[var(--bg-secondary)] py-20 sm:py-24"
      >
        <div className="container-main">
          <div className="mx-auto max-w-6xl">
            <div id="criteria">
              <SectionHeading en="Selection criteria" de="Auswahlkriterien" />
            </div>
            <BilingualColumns pairId="criteria">
              <FeatureList items={criteriaEn} />
              <FeatureList items={criteriaDe} />
            </BilingualColumns>

            <div className="mt-10 grid gap-5 rounded-2xl border border-[color:var(--border-accent)] bg-[var(--accent-glow)] p-6 sm:p-8 md:grid-cols-2 md:gap-0">
              <p
                lang="en"
                className="leading-7 text-[var(--text-primary)] md:pr-10"
              >
                <strong>
                  Likes and comments are not the selection metric.
                </strong>{" "}
                Engagement may give the jury context, but it never decides the
                winner. No contribution is ranked or featured because someone
                paid.
              </p>
              <p
                lang="de"
                className="border-t border-[color:var(--border-subtle)] pt-5 leading-7 text-[var(--text-primary)] md:border-t-0 md:border-l md:pt-0 md:pl-10"
              >
                <strong>Likes und Kommentare sind kein Auswahlmaßstab.</strong>{" "}
                Resonanz kann der Jury Kontext geben, entscheidet aber nie über
                die Auszeichnung. Kein Beitrag wird aufgrund einer Zahlung
                bewertet oder hervorgehoben.
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
          <div id="prize">
            <SectionHeading en="What the winner receives" de="Der Preis" />
          </div>
          <BilingualColumns pairId="prize">
            <FeatureList items={prizeEn} />
            <FeatureList items={prizeDe} />
          </BilingualColumns>
        </div>
      </section>

      <section
        aria-labelledby="hall-of-fame"
        className="border-y border-[color:var(--border-subtle)] bg-[var(--bg-secondary)] py-20 sm:py-24"
      >
        <div className="container-main">
          <div className="mx-auto max-w-6xl">
            <div id="hall-of-fame">
              <SectionHeading en="Hall of Fame" de="Hall of Fame" />
            </div>

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
                      {formatPickMonth(pick.month, "en-GB")} /{" "}
                      {formatPickMonth(pick.month, "de-DE")}
                    </time>
                    <h3
                      className={`${headingFont} mt-4 text-2xl font-bold text-[var(--text-primary)]`}
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
                      <span lang="en">Winning post</span>
                      <span aria-hidden="true" className="opacity-50">
                        /
                      </span>
                      <span lang="de">Ausgezeichneter Beitrag</span>
                      <ExternalArrow />
                    </OutboundLink>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-[color:var(--border-accent)] bg-[var(--accent-glow)] p-6 sm:p-10">
                <BilingualColumns pairId="hall-of-fame-empty">
                  <div>
                    <h3
                      className={`${headingFont} text-2xl font-bold text-[var(--text-primary)]`}
                    >
                      First Pick: {firstMonthEn}
                    </h3>
                    <p className="mt-3 max-w-md leading-7 text-[var(--text-secondary)]">
                      The first place in the Hall of Fame is waiting. Post your
                      own contribution in the group to be in the running.
                    </p>
                  </div>
                  <div>
                    <h3
                      className={`${headingFont} text-2xl font-bold text-[var(--text-primary)]`}
                    >
                      Erster Pick: {firstMonthDe}
                    </h3>
                    <p className="mt-3 max-w-md leading-7 text-[var(--text-secondary)]">
                      Der erste Platz in der Hall of Fame ist noch frei. Poste
                      deinen eigenen Beitrag in der Gruppe, um berücksichtigt zu
                      werden.
                    </p>
                  </div>
                </BilingualColumns>
                <div className="mt-8">
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
            <div id="terms-title">
              <SectionHeading
                en="Participation terms"
                de="Teilnahmebedingungen"
              />
            </div>

            <div className="mb-6 grid gap-4 rounded-2xl border border-[color:var(--border-medium)] bg-[var(--bg-secondary)] p-5 text-sm leading-6 text-[var(--text-secondary)] sm:p-6 md:grid-cols-2 md:gap-0">
              <p lang="en" className="md:pr-8">
                This program is not sponsored, endorsed, administered by, or
                associated with LinkedIn.
              </p>
              <p
                lang="de"
                className="border-t border-[color:var(--border-subtle)] pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-8"
              >
                Dieses Programm wird weder von LinkedIn gesponsert, unterstützt
                oder verwaltet, noch steht es mit LinkedIn in Verbindung.
              </p>
            </div>

            <details className="group rounded-2xl border border-[color:var(--border-subtle)] bg-[var(--bg-secondary)] shadow-[var(--shadow-sm)]">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 font-bold text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)] sm:px-6 [&::-webkit-details-marker]:hidden">
                <span>
                  <span lang="en">Read the full terms</span>
                  <span
                    aria-hidden="true"
                    className="mx-2 text-[var(--text-tertiary)]"
                  >
                    /
                  </span>
                  <span lang="de">Vollständige Bedingungen lesen</span>
                </span>
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
                <BilingualColumns pairId="terms">
                  <TermsList items={termsEn} />
                  <TermsList items={termsDe} />
                </BilingualColumns>
              </div>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}
