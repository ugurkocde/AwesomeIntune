"use client";

import { useState } from "react";
import Link from "next/link";

type Status = "idle" | "loading" | "done" | "error";

export function UnsubscribeConfirmation({ token }: { token: string }) {
  const [status, setStatus] = useState<Status>(token ? "idle" : "error");
  const [errorMessage, setErrorMessage] = useState(
    token ? "" : "This unsubscribe link is missing its token."
  );

  const handleUnsubscribe = async () => {
    setStatus("loading");

    try {
      const response = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (response.ok && data.success) {
        setStatus("done");
      } else {
        setErrorMessage(
          data.error ?? "Failed to unsubscribe. Please try again."
        );
        setStatus("error");
      }
    } catch {
      setErrorMessage("Failed to unsubscribe. Please try again.");
      setStatus("error");
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center px-4 pt-32 pb-20">
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
          {status === "done" ? "You are unsubscribed" : "Unsubscribe"}
        </h1>

        {status === "done" ? (
          <>
            <p className="mb-8 text-sm" style={{ color: "var(--text-secondary)" }}>
              You will no longer receive email notifications from Awesome
              Intune. You can sign up again anytime.
            </p>
            <Link href="/" className="btn btn-primary">
              Back to Home
            </Link>
          </>
        ) : (
          <>
            <p className="mb-8 text-sm" style={{ color: "var(--text-secondary)" }}>
              Click the button below to stop receiving email notifications
              about new tools on Awesome Intune.
            </p>

            {status === "error" && (
              <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
                {errorMessage}
              </p>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => void handleUnsubscribe()}
                disabled={status === "loading" || !token}
                className="btn btn-primary"
                style={
                  status === "loading" || !token
                    ? { opacity: 0.6, cursor: "not-allowed" }
                    : undefined
                }
              >
                {status === "loading" ? "Unsubscribing..." : "Unsubscribe"}
              </button>
              <Link href="/" className="btn btn-secondary">
                Cancel
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
