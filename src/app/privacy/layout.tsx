import type { Metadata } from "next";
import { SITE_CONFIG } from "~/lib/constants";

export const metadata: Metadata = {
  title: `Privacy Policy - ${SITE_CONFIG.name}`,
  description:
    "How Awesome Intune collects, uses, and protects your data. Read the privacy policy for the community-curated Microsoft Intune tools directory.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/privacy`,
  },
  openGraph: {
    title: `Privacy Policy - ${SITE_CONFIG.name}`,
    description:
      "How Awesome Intune collects, uses, and protects your data.",
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
