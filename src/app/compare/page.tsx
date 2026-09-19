import type { Metadata } from "next";
import { getAllTools } from "~/lib/tools.server";
import { SITE_CONFIG } from "~/lib/constants";
import { CompareClient } from "./CompareClient";

export const metadata: Metadata = {
  title: "Compare Intune tools",
  description:
    "Compare up to three Microsoft Intune tools side by side by category, type, security scan, maintenance, and links.",
  alternates: { canonical: `${SITE_CONFIG.url}/compare` },
};

export default function ComparePage() {
  const tools = getAllTools();

  return (
    <div className="container-main py-24">
      <div className="mx-auto max-w-6xl">
        <h1
          className="font-display text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ color: "var(--text-primary)" }}
        >
          Compare tools
        </h1>
        <p
          className="mt-3 max-w-3xl text-base leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Pick up to three tools to compare category, type, security scan,
          maintenance, and links. Selection is stored in the URL so a
          comparison can be shared.
        </p>

        <div className="mt-10">
          <CompareClient tools={tools} />
        </div>
      </div>
    </div>
  );
}
