import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-screen items-center pt-32 pb-20">
      <div className="container-main">
        <div className="mx-auto max-w-2xl text-center">
          <p
            className="font-display text-7xl font-bold md:text-8xl"
            style={{ color: "var(--accent-primary)" }}
          >
            404
          </p>
          <h1
            className="mt-4 font-display text-3xl font-bold md:text-4xl"
            style={{ color: "var(--text-primary)" }}
          >
            Page not found
          </h1>
          <p
            className="mt-4 text-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            The page you are looking for does not exist or may have been
            moved.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/" className="btn btn-primary">
              Back to Home
            </Link>
            <Link href="/#tools" className="btn btn-secondary">
              Browse Tools
            </Link>
            <Link href="/collections" className="btn btn-secondary">
              Collections
            </Link>
          </div>

          <div
            className="mx-auto mt-12 max-w-md rounded-xl p-6 text-left"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <p
              className="text-xs font-medium uppercase tracking-wide"
              style={{ color: "var(--text-tertiary)" }}
            >
              Popular sections
            </p>
            <nav className="mt-3 flex flex-col gap-2">
              <Link
                href="/#tools"
                className="text-sm transition-colors hover:text-[var(--accent-primary)]"
                style={{ color: "var(--text-secondary)" }}
              >
                All Tools
              </Link>
              <Link
                href="/collections"
                className="text-sm transition-colors hover:text-[var(--accent-primary)]"
                style={{ color: "var(--text-secondary)" }}
              >
                Curated Collections
              </Link>
              <Link
                href="/stats"
                className="text-sm transition-colors hover:text-[var(--accent-primary)]"
                style={{ color: "var(--text-secondary)" }}
              >
                Directory Stats
              </Link>
              <Link
                href="/submit"
                className="text-sm transition-colors hover:text-[var(--accent-primary)]"
                style={{ color: "var(--text-secondary)" }}
              >
                Submit a Tool
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
