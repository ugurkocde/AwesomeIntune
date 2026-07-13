"use client";

// Global error boundary replaces the root layout, so global styles
// are not available here. Keep styling inline and minimal.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          background: "#0a0e14",
          color: "#f0f4f8",
        }}
      >
        <div style={{ maxWidth: "28rem", padding: "2rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0 }}>
            Something went wrong
          </h1>
          <p style={{ marginTop: "1rem", color: "#8899aa", lineHeight: 1.6 }}>
            An unexpected error occurred. Please try again.
          </p>
          {error.digest && (
            <p style={{ marginTop: "0.5rem", color: "#556677", fontSize: "0.875rem" }}>
              Error reference: {error.digest}
            </p>
          )}
          <button
            onClick={() => reset()}
            style={{
              marginTop: "1.5rem",
              padding: "0.6rem 1.5rem",
              borderRadius: "0.5rem",
              border: "1px solid rgba(0, 212, 255, 0.3)",
              background: "rgba(0, 212, 255, 0.15)",
              color: "#00d4ff",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
