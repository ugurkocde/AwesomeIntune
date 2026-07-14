"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { GITHUB_REPO_URL } from "~/lib/constants";

function HeaderSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) {
      setOpen(true);
      inputRef.current?.focus();
      return;
    }
    router.push(`/?q=${encodeURIComponent(value)}#tools`);
    setOpen(false);
    setQuery("");
  };

  return (
    <form role="search" onSubmit={submit} className="flex items-center">
      {open && (
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
          placeholder="Search tools"
          aria-label="Search tools"
          name="site-search"
          autoComplete="off"
          spellCheck={false}
          className="mr-2 h-9 w-44 rounded-lg border border-[color:var(--border-subtle)] bg-white px-3 text-sm text-[var(--text-primary)] focus-visible:border-[var(--accent-primary)]"
        />
      )}
      <button
        type={open ? "submit" : "button"}
        onClick={open ? undefined : () => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-slate-100 hover:text-[var(--text-primary)]"
        aria-label="Search tools"
        aria-expanded={open}
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>
    </form>
  );
}

const navItems = [
  { href: "/#tools", label: "Browse" },
  { href: "/collections", label: "Collections" },
  { href: "/ideas", label: "Ideas" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[color:var(--border-subtle)] bg-white/95 backdrop-blur-md">
      <div className="container-main">
        <nav
          aria-label="Primary navigation"
          className="flex h-[68px] items-center justify-between"
        >
          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label="Awesome Intune home"
          >
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-[color:var(--border-accent)] bg-[var(--accent-glow)] text-[var(--accent-primary)]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M12 2 2 7l10 5 10-5-10-5Z" />
                <path d="m2 17 10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </span>
            <span className="font-display text-base font-bold tracking-[-0.02em] text-[var(--text-primary)]">
              AWESOME
              <span className="text-[var(--accent-primary)]"> INTUNE</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {pathname !== "/" && <HeaderSearch />}
            {navItems.map((item) => {
              const active =
                item.href !== "/#tools" && pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-[10px] px-3.5 py-2 text-[13px] font-medium transition-colors ${
                    active
                      ? "bg-[var(--accent-glow)] text-[var(--accent-primary)]"
                      : "text-[var(--text-secondary)] hover:bg-slate-100 hover:text-[var(--text-primary)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-[10px] px-3.5 py-2 text-[13px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-slate-100 hover:text-[var(--text-primary)]"
            >
              GitHub
            </a>
            <Link
              href="/submit"
              className="ml-1 inline-flex items-center gap-1.5 rounded-[10px] bg-[var(--accent-primary)] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--accent-secondary)]"
            >
              <span aria-hidden="true">＋</span> Add Tool
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/submit"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-primary)] text-lg text-white"
              aria-label="Add a tool"
            >
              +
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-primary)] hover:bg-slate-100"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                {mobileOpen ? (
                  <path d="M6 6l12 12M18 6 6 18" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>
      </div>

      {mobileOpen && (
        <div className="border-t border-[color:var(--border-subtle)] bg-white px-5 py-4 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-slate-100 hover:text-[var(--text-primary)]"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-slate-100 hover:text-[var(--text-primary)]"
            >
              GitHub
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
