import type { Metadata } from "next";
import { SITE_CONFIG } from "~/lib/constants";

export const metadata: Metadata = {
  title: `Tool Ideas - ${SITE_CONFIG.name}`,
  description:
    "Submit ideas for tools that don't exist yet for Microsoft Intune. Vote for the features you need most and help shape the future of the Intune community tooling.",
  openGraph: {
    title: `Tool Ideas - ${SITE_CONFIG.name}`,
    description:
      "Submit ideas for tools that don't exist yet for Microsoft Intune. Vote for the features you need most.",
    type: "website",
    url: `${SITE_CONFIG.url}/ideas`,
    images: [
      {
        url: "/api/og?title=Tool%20Ideas&category=other",
        width: 1200,
        height: 630,
        alt: "Tool Ideas - Awesome Intune",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Tool Ideas - ${SITE_CONFIG.name}`,
    description:
      "Submit ideas for tools that don't exist yet for Microsoft Intune. Vote for the features you need most.",
    images: ["/api/og?title=Tool%20Ideas&category=other"],
  },
};

export default function RequestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
