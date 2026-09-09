"use client";
import { useEffect, useState } from "react";
import { freshCommunityCount } from "~/lib/community-count";
export function CommunityCount() {
  const [value, setValue] = useState<{
    count: number;
    updatedAt: string;
  } | null>(null);
  useEffect(() => {
    let disposed = false;
    let controller: AbortController | undefined;
    const refresh = async () => {
      controller?.abort();
      controller = new AbortController();
      const timeout = setTimeout(() => controller?.abort(), 10000);
      try {
        const response = await fetch("/api/community-count", {
          cache: "no-store",
          signal: controller.signal,
        });
        const data: unknown = response.ok ? await response.json() : null;
        const candidate = data as {
          count?: unknown;
          updatedAt?: unknown;
        } | null;
        const next = freshCommunityCount({
          member_count: candidate?.count,
          observed_at: candidate?.updatedAt,
        });
        if (!disposed) setValue(next);
      } catch {
        if (!disposed) setValue(null);
      } finally {
        clearTimeout(timeout);
      }
    };
    void refresh();
    const timer = setInterval(() => {
      void refresh();
    }, 60000);
    const expire = setInterval(
      () =>
        setValue(
          (previous) =>
            previous &&
            freshCommunityCount({
              member_count: previous.count,
              observed_at: previous.updatedAt,
            }),
        ),
      10000,
    );
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      disposed = true;
      controller?.abort();
      clearInterval(timer);
      clearInterval(expire);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  return value ? (
    <div title="Member count refreshed every five minutes">
      <p className="font-display text-2xl leading-none font-bold text-[var(--text-primary)] tabular-nums">
        {new Intl.NumberFormat("en-US").format(value.count)}
      </p>
      <p className="mt-1 text-xs text-[var(--text-secondary)]">
        community members
      </p>
    </div>
  ) : (
    <p className="text-sm font-medium text-[var(--text-secondary)]">
      Awesome Intune
      <br />
      on WhatsApp
    </p>
  );
}
