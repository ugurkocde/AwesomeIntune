"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-screen items-center pt-32 pb-20">
      <div className="container-main">
        <div className="mx-auto max-w-2xl text-center">
          <h1
            className="font-display text-3xl font-bold md:text-4xl"
            style={{ color: "var(--text-primary)" }}
          >
            Something went wrong
          </h1>
          <p
            className="mt-4 text-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            An unexpected error occurred while loading this page. You can try
            again or head back to the homepage.
          </p>
          {error.digest && (
            <p
              className="mt-2 text-sm"
              style={{ color: "var(--text-tertiary)" }}
            >
              Error reference: {error.digest}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button onClick={() => reset()} className="btn btn-primary">
              Try Again
            </button>
            <Link href="/" className="btn btn-secondary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
