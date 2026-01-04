import type { Metadata } from "next";
import { SITE_CONFIG } from "~/lib/constants";

export const metadata: Metadata = {
  title: `Submit a Tool - ${SITE_CONFIG.name}`,
  description:
    "Submit your Intune tool, script, or resource to be featured in the Awesome Intune community directory. Share your work with the Microsoft Intune community.",
  openGraph: {
    title: `Submit a Tool - ${SITE_CONFIG.name}`,
    description:
      "Submit your Intune tool, script, or resource to be featured in the Awesome Intune community directory.",
    type: "website",
    url: `${SITE_CONFIG.url}/submit`,
    images: [
      {
        url: "/api/og?title=Submit%20Your%20Tool&category=other",
        width: 1200,
        height: 630,
        alt: "Submit a Tool to Awesome Intune",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Submit a Tool - ${SITE_CONFIG.name}`,
    description:
      "Submit your Intune tool, script, or resource to be featured in the Awesome Intune community directory.",
    images: ["/api/og?title=Submit%20Your%20Tool&category=other"],
  },
};

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
