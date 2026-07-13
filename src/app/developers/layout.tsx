import type { Metadata } from "next";
import { SITE_CONFIG } from "~/lib/constants";

export const metadata: Metadata = {
  title: "Awesome Intune API - Free REST API for Intune Tool Data",
  description:
    "Free REST API for programmatic access to the Awesome Intune directory. Query Microsoft Intune tools, categories, and stats with a free API key.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/developers`,
  },
  openGraph: {
    title: "Awesome Intune API - Free REST API for Intune Tool Data",
    description:
      "Free REST API for programmatic access to the Awesome Intune directory of Microsoft Intune tools.",
    type: "website",
    url: `${SITE_CONFIG.url}/developers`,
  },
};

export default function DevelopersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
