const CARD_GRID =
  "repeat(auto-fill, minmax(min(340px, 100%), 1fr))";

/**
 * Route-level loading skeleton. Shown while a server route streams in, so
 * navigation to tool, author, collection, and stats pages is never blank.
 */
export default function Loading() {
  return (
    <div
      className="container-main py-24"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading</span>
      <div className="mx-auto max-w-7xl">
        <div
          className="h-9 w-72 max-w-full rounded-lg"
          style={{ background: "var(--bg-tertiary)" }}
        />
        <div
          className="mt-4 h-5 w-full max-w-xl rounded"
          style={{ background: "var(--bg-tertiary)" }}
        />

        <div
          className="mt-10 grid gap-6"
          style={{ gridTemplateColumns: CARD_GRID }}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl p-6"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                className="h-9 w-9 rounded-xl"
                style={{ background: "var(--bg-tertiary)" }}
              />
              <div
                className="mt-5 h-6 w-3/4 rounded"
                style={{ background: "var(--bg-tertiary)" }}
              />
              <div
                className="mt-3 h-4 w-full rounded"
                style={{ background: "var(--bg-tertiary)" }}
              />
              <div
                className="mt-2 h-4 w-2/3 rounded"
                style={{ background: "var(--bg-tertiary)" }}
              />
              <div
                className="mt-6 h-9 w-32 rounded-lg"
                style={{ background: "var(--bg-tertiary)" }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
