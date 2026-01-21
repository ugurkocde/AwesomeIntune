import "~/styles/globals.css";

import { type Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { Outfit, DM_Sans, JetBrains_Mono } from "next/font/google";

import { GradientMesh } from "~/components/GradientMesh";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { SubscriptionToast } from "~/components/newsletter/SubscriptionToast";
import { FloatingSubscribe } from "~/components/newsletter/FloatingSubscribe";
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
  title: "Microsoft Intune Tools & PowerShell Scripts Directory | 86+ Free Resources",
  description:
    "Discover 86+ free Microsoft Intune tools, PowerShell scripts, and automation resources. The largest curated collection for IT professionals - featuring troubleshooting, reporting, packaging, and endpoint management tools.",
  keywords: [
    "Microsoft Intune",
    "Intune tools",
    "Intune scripts",
    "PowerShell Intune",
    "Intune automation",
    "Endpoint management",
    "MDM tools",
    "Intune troubleshooting tools",
    "Intune PowerShell scripts",
    "Intune reporting tools",
    "Win32 app packaging",
    "Autopilot tools",
    "Intune compliance tools",
    "device management tools",
    "Intune security tools",
    "Intune migration tools",
    "free Intune tools",
    "best Intune tools",
  ],
  authors: [{ name: "Intune Community" }],
  alternates: {
    canonical: "https://awesomeintune.com",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://awesomeintune.com",
    siteName: "Awesome Intune",
    title: "Microsoft Intune Tools & PowerShell Scripts Directory | 86+ Free Resources",
    description:
      "Discover 86+ free Microsoft Intune tools and PowerShell scripts. The largest curated collection for IT professionals - troubleshooting, reporting, packaging, and automation.",
    images: [
      {
        url: "/api/og?title=Awesome%20Intune&category=automation",
        width: 1200,
        height: 630,
        alt: "Awesome Intune - The Largest Microsoft Intune Tools Directory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Microsoft Intune Tools & PowerShell Scripts | 86+ Free Resources",
    description:
      "Discover 86+ free Microsoft Intune tools and PowerShell scripts. The largest curated collection for IT professionals.",
    images: ["/api/og?title=Awesome%20Intune&category=automation"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
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
        <meta name="msvalidate.01" content="3E85A4E6616AA104DB060F4E3AC73298" />
        {/* Citation meta tags for GEO (Generative Engine Optimization) */}
        <meta name="citation_title" content="Awesome Intune - Microsoft Intune Tools Directory" />
        <meta name="citation_author" content="Ugur Koc" />
        <meta name="citation_publication_date" content="2024" />
        <meta name="citation_online_date" content={new Date().toISOString().split("T")[0]} />
        <meta name="citation_publisher" content="Awesome Intune" />
        <meta name="citation_abstract" content="The largest curated directory of free Microsoft Intune tools, PowerShell scripts, and automation resources for IT professionals managing endpoint devices." />
        {/* AI crawler hints */}
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLMs.txt - AI Crawler Instructions" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        {/* Plausible Analytics */}
        <Script
          defer
          data-domain="awesomeintune.com"
          src="https://plausible.io/js/pa-ZkotnMeJMBNcsN6hBD9x1.js"
          strategy="afterInteractive"
        />
        <Script id="plausible-init" strategy="afterInteractive">
          {`
            window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) };
            plausible.init = plausible.init || function(i) { plausible.o = i || {} };
            plausible.init();
          `}
        </Script>
      </head>
      <body className="flex min-h-screen flex-col">
        <GradientMesh />
        <Header />
        <Suspense fallback={null}>
          <SubscriptionToast />
        </Suspense>
        <main className="relative z-10 flex-1">{children}</main>
        <Footer />
        <FloatingSubscribe />
      </body>
    </html>
  );
}
