import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Subscription Confirmed | Awesome Intune",
  description: "Your Awesome Intune newsletter subscription is confirmed.",
  robots: { index: false, follow: false },
};

export default async function ConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; message?: string }>;
}) {
  const { status, message } = await searchParams;

  const isError = status === "error";
  const isAlreadyConfirmed = status === "already-confirmed";

  const title = isError
    ? "Confirmation failed"
    : isAlreadyConfirmed
      ? "Already confirmed"
      : "Subscription confirmed";

  const body = isError
    ? message === "invalid-token"
      ? "This confirmation link is invalid or has expired. Try subscribing again to receive a fresh link."
      : "Something went wrong while confirming your subscription. Please try again later."
    : isAlreadyConfirmed
      ? "Your email was already confirmed. You are on the list and will get updates when new tools are added."
      : "Your email is confirmed. You will get updates when new tools are added to the directory.";

  return (
    <section className="flex min-h-screen items-center justify-center px-4 pb-20 pt-32">
      <div
        className="w-full max-w-md rounded-2xl p-8 text-center"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <h1
          className="mb-3 text-2xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h1>
        <p className="mb-8 text-sm" style={{ color: "var(--text-secondary)" }}>
          {body}
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/" className="btn btn-primary">
            Browse tools
          </Link>
        </div>
      </div>
    </section>
  );
}
