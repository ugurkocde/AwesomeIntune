import type { Metadata } from "next";
import { UnsubscribeConfirmation } from "./UnsubscribeConfirmation";

export const metadata: Metadata = {
  title: "Unsubscribe | Awesome Intune",
  description: "Unsubscribe from Awesome Intune email notifications.",
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return <UnsubscribeConfirmation token={token ?? ""} />;
}
