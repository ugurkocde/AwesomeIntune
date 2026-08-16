"use client";

import { useEffect, useState } from "react";

type RemainingTime = {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type PickCountdownProps = {
  target: string;
  cycleLabel: string;
  deadlineLabel: string;
  announcementLabel: string;
};

const emptyRemaining: RemainingTime = {
  total: 1,
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
};

function getRemainingTime(target: string): RemainingTime {
  const total = Math.max(0, new Date(target).getTime() - Date.now());

  return {
    total,
    days: Math.floor(total / 86_400_000),
    hours: Math.floor((total / 3_600_000) % 24),
    minutes: Math.floor((total / 60_000) % 60),
    seconds: Math.floor((total / 1_000) % 60),
  };
}

const units = [
  ["days", "Days"],
  ["hours", "Hours"],
  ["minutes", "Minutes"],
  ["seconds", "Seconds"],
] as const;

export function PickCountdown({
  target,
  cycleLabel,
  deadlineLabel,
  announcementLabel,
}: PickCountdownProps) {
  const [remaining, setRemaining] = useState<RemainingTime | null>(null);

  useEffect(() => {
    const update = () => setRemaining(getRemainingTime(target));

    update();
    const interval = window.setInterval(update, 1_000);

    return () => window.clearInterval(interval);
  }, [target]);

  const display = remaining ?? emptyRemaining;
  const hasClosed = remaining?.total === 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/25 bg-[#004c86]/45 p-5 shadow-[0_24px_70px_rgba(0,43,78,0.28)] backdrop-blur-md sm:p-7">
      <div
        aria-hidden="true"
        className="absolute -top-8 -right-8 h-28 w-28 rotate-45 rounded-[24px] border border-[#bceeff]/25 bg-[#63d2fa]/10"
      />

      <div className="relative">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            <p className="font-mono text-[11px] font-bold tracking-[0.16em] text-[#bceeff] uppercase">
              Current cycle
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-pick)] text-2xl leading-tight font-bold text-white sm:text-3xl">
              {cycleLabel} closes in
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-white/75 sm:text-right">
            Contributions posted by {deadlineLabel} may be considered.
          </p>
        </div>

        {hasClosed ? (
          <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-6">
            <p className="font-[family-name:var(--font-pick)] text-2xl font-bold text-white">
              Selection in progress
            </p>
            <p className="mt-2 text-base leading-7 text-white/80">
              The Picks will be announced in {announcementLabel}.
            </p>
          </div>
        ) : (
          <>
            <p className="sr-only">
              The {cycleLabel} recognition cycle closes on {deadlineLabel}.
            </p>
            <div
              aria-hidden="true"
              className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
            >
              {units.map(([key, label]) => (
                <div
                  key={key}
                  className="rounded-2xl border border-white/20 bg-white/10 px-3 py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] sm:py-5"
                >
                  <span className="block font-mono text-3xl leading-none font-bold tracking-[-0.05em] text-white tabular-nums sm:text-4xl">
                    {remaining ? String(display[key]).padStart(2, "0") : "--"}
                  </span>
                  <span className="mt-2 block text-[10px] font-bold tracking-[0.14em] text-[#bceeff] uppercase sm:text-[11px]">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
