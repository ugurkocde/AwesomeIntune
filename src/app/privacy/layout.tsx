import type { Metadata } from "next";
import { SITE_CONFIG } from "~/lib/constants";

export const metadata: Metadata = {
  title: `Privacy Policy - ${SITE_CONFIG.name}`,
  description:
    "How Awesome Intune processes personal data when you browse, search, vote, subscribe, or submit content.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/privacy`,
  },
  openGraph: {
    title: `Privacy Policy - ${SITE_CONFIG.name}`,
    description:
      "How Awesome Intune processes personal data when you browse, search, vote, subscribe, or submit content.",
    type: "website",
    url: `${SITE_CONFIG.url}/privacy`,
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
