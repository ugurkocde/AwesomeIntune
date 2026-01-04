import "~/styles/globals.css";

import { type Metadata } from "next";
import { Suspense } from "react";
import { Outfit, DM_Sans, JetBrains_Mono } from "next/font/google";

import { GradientMesh } from "~/components/GradientMesh";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { SubscriptionToast } from "~/components/newsletter/SubscriptionToast";
import { generateOrganizationStructuredData } from "~/lib/structured-data";

// Outfit - Display font (similar to Cabinet Grotesk)
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

// DM Sans - Body font (similar to Satoshi)
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

// JetBrains Mono - Monospace font
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://awesomeintune.com"),
  title: "Awesome Intune | Community Tools Directory",
  description:
    "Discover the best community-built tools, scripts, and resources for Microsoft Intune. All in one place, curated by the community.",
  keywords: [
    "Microsoft Intune",
    "Intune tools",
    "Intune scripts",
    "PowerShell Intune",
    "Intune automation",
    "Endpoint management",
    "MDM tools",
  ],
  authors: [{ name: "Intune Community" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://awesomeintune.com",
    siteName: "Awesome Intune",
    title: "Awesome Intune | Community Tools Directory",
    description:
      "Discover the best community-built tools, scripts, and resources for Microsoft Intune.",
    images: [
      {
        url: "/api/og?title=Awesome%20Intune&category=automation",
        width: 1200,
        height: 630,
        alt: "Awesome Intune - Community Tools Directory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Awesome Intune | Community Tools Directory",
    description:
      "Discover the best community-built tools, scripts, and resources for Microsoft Intune.",
    images: ["/api/og?title=Awesome%20Intune&category=automation"],
  },
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const organizationSchema = generateOrganizationStructuredData();

  return (
    <html
      lang="en"
      className={`${outfit.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <GradientMesh />
        <Header />
        <Suspense fallback={null}>
          <SubscriptionToast />
        </Suspense>
        <main className="relative z-10 flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
