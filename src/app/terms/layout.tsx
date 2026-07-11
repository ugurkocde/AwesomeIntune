import type { Metadata } from "next";
import { SITE_CONFIG } from "~/lib/constants";

export const metadata: Metadata = {
  title: `Terms of Service - ${SITE_CONFIG.name}`,
  description:
    "Terms of service for Awesome Intune, the community-curated directory of free Microsoft Intune tools, scripts, and resources.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/terms`,
  },
  openGraph: {
    title: `Terms of Service - ${SITE_CONFIG.name}`,
    description:
      "Terms of service for Awesome Intune, the community-curated directory of free Microsoft Intune tools.",
    type: "website",
    url: `${SITE_CONFIG.url}/terms`,
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
