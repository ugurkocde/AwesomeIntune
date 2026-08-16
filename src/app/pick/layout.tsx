import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { SITE_CONFIG } from "~/lib/constants";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-pick",
  display: "swap",
});

const title = "Awesome Pick - Monthly Community Recognition | Awesome Intune";
const description =
  "Awesome Pick recognizes up to 3 contributions each month for the practical value and knowledge they share with the free, vendor-neutral Awesome Intune community.";
const ogImage = "/api/og?title=Awesome%20Pick&variant=pick";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${SITE_CONFIG.url}/pick`,
  },
  openGraph: {
    title,
    description,
    type: "website",
    locale: "en_US",
    url: `${SITE_CONFIG.url}/pick`,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Awesome Pick monthly community recognition by Awesome Intune",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage],
  },
};

export default function PickLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={archivo.variable}>{children}</div>;
}
