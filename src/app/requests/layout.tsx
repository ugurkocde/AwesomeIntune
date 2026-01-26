import type { Metadata } from "next";
import { SITE_CONFIG } from "~/lib/constants";

export const metadata: Metadata = {
  title: `Tool Requests - ${SITE_CONFIG.name}`,
  description:
    "Request tools that don't exist yet for Microsoft Intune. Vote for the features you need most and help shape the future of the Intune community tooling.",
  openGraph: {
    title: `Tool Requests - ${SITE_CONFIG.name}`,
    description:
      "Request tools that don't exist yet for Microsoft Intune. Vote for the features you need most.",
    type: "website",
    url: `${SITE_CONFIG.url}/requests`,
    images: [
      {
        url: "/api/og?title=Tool%20Requests&category=other",
        width: 1200,
        height: 630,
        alt: "Tool Requests - Awesome Intune",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Tool Requests - ${SITE_CONFIG.name}`,
    description:
      "Request tools that don't exist yet for Microsoft Intune. Vote for the features you need most.",
    images: ["/api/og?title=Tool%20Requests&category=other"],
  },
};

export default function RequestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
