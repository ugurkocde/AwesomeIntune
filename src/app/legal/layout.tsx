import type { Metadata } from "next";
import { SITE_CONFIG } from "~/lib/constants";

export const metadata: Metadata = {
  title: "Legal Notice - " + SITE_CONFIG.name,
  description:
    "Legal provider, contact, register, and editorial information for Awesome Intune.",
  alternates: {
    canonical: SITE_CONFIG.url + "/legal",
  },
  openGraph: {
    title: "Legal Notice - " + SITE_CONFIG.name,
    description:
      "Legal provider, contact, register, and editorial information for Awesome Intune.",
    type: "website",
    url: SITE_CONFIG.url + "/legal",
  },
};

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
