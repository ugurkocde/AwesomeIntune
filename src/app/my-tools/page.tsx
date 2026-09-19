import type { Metadata } from "next";
import { getAllTools } from "~/lib/tools.server";
import { SITE_CONFIG } from "~/lib/constants";
import { MyToolsClient } from "./MyToolsClient";

export const metadata: Metadata = {
  title: "My tools",
  description: "Tools you saved on this device.",
  alternates: { canonical: `${SITE_CONFIG.url}/my-tools` },
  robots: { index: false, follow: true },
};

export default function MyToolsPage() {
  const tools = getAllTools();

  return (
    <div className="container-main py-24">
      <div className="mx-auto max-w-7xl">
        <h1
          className="font-display text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ color: "var(--text-primary)" }}
        >
          My tools
        </h1>
        <p
          className="mt-3 max-w-2xl text-base leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Saved in this browser only. Use the bookmark button on any tool to
          add or remove it here.
        </p>

        <div className="mt-10">
          <MyToolsClient tools={tools} />
        </div>
      </div>
    </div>
  );
}
