interface TrustStripProps {
  verifiedCount: number;
  toolCount: number;
}

const PILLARS = [
  {
    title: "Automatically security-scanned",
    body: "Every open-source tool's code is scanned for six classes of risk: obfuscation, remote execution, credential theft, data exfiltration, malicious patterns, and hardcoded secrets.",
    icon: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  },
  {
    title: "Curated by the community",
    body: "Tools are reviewed and selected by Intune practitioners. Closed-source tools that can't be scanned are vetted manually before they're listed.",
    icon: (
      <>
        <path d="M12 2 4 5v6c0 5.5 3.8 9.3 8 11 4.2-1.7 8-5.5 8-11V5l-8-3z" />
        <circle cx="12" cy="10" r="2.5" />
        <path d="M8.5 17a3.5 3.5 0 0 1 7 0" />
      </>
    ),
  },
  {
    title: "Free and open",
    body: "Every tool in the directory is free to use. Source links and downloads go straight to the original author's repository - nothing is paywalled here.",
    icon: (
      <>
        <rect x="3" y="8" width="18" height="13" rx="1.5" />
        <path d="M12 8v13M3 12h18" />
        <path d="M12 8S9.5 3 7 4.5 8 8 12 8zM12 8s2.5-5 5-3.5S16 8 12 8z" />
      </>
    ),
  },
];

export function TrustStrip({ verifiedCount, toolCount }: TrustStripProps) {
  return (
    <section className="border-y border-[color:var(--border-subtle)] bg-white py-14 sm:py-16">
      <div className="container-main">
        <div className="max-w-xl">
          <span
            className="text-xs font-bold tracking-[0.14em] uppercase"
            style={{ color: "var(--accent-primary)" }}
          >
            Why you can trust these tools
          </span>
          <p
            className="font-display mt-3 text-2xl font-bold text-balance sm:text-[26px]"
            style={{ color: "var(--text-primary)", lineHeight: 1.3 }}
          >
            {verifiedCount > 0 ? (
              <>
                <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                  {verifiedCount} of {toolCount}
                </span>{" "}
                listed tools passed every automated security check.
              </>
            ) : (
              <>
                Every open-source tool is automatically scanned before it ships.
              </>
            )}
          </p>
        </div>

        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {PILLARS.map((pillar, index) => (
            <div
              key={pillar.title}
              className="rounded-[14px] p-6"
              style={{
                background: "var(--bg-primary)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  background:
                    index === 0
                      ? "rgba(5,150,105,0.08)"
                      : index === 1
                        ? "rgba(0,120,212,0.08)"
                        : "rgba(124,58,237,0.08)",
                  border:
                    index === 0
                      ? "1px solid rgba(5,150,105,0.2)"
                      : index === 1
                        ? "1px solid rgba(0,120,212,0.2)"
                        : "1px solid rgba(124,58,237,0.2)",
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={
                    index === 0
                      ? "var(--signal-success)"
                      : index === 1
                        ? "var(--accent-primary)"
                        : "var(--signal-purple)"
                  }
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {pillar.icon}
                </svg>
              </div>
              <h3
                className="font-display text-base font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {pillar.title}
              </h3>
              <p
                className="mt-2 text-[13px]"
                style={{ color: "var(--text-secondary)", lineHeight: 1.65 }}
              >
                {pillar.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
