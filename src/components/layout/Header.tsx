"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { COMMUNITY_URL, GITHUB_REPO_URL } from "~/lib/constants";
import { ChangelogBell } from "./ChangelogBell";
import { ThemeToggle } from "./ThemeToggle";

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
          className="mr-2 h-9 w-44 rounded-lg border border-[color:var(--border-subtle)] bg-[var(--bg-secondary)] px-3 text-sm text-[var(--text-primary)] focus-visible:border-[var(--accent-primary)]"
        />
      )}
      <button
        type={open ? "submit" : "button"}
        onClick={open ? undefined : () => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
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
  { href: "/pick", label: "Pick" },
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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[color:var(--border-subtle)] bg-[var(--header-bg)] backdrop-blur-md">
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
            <Image
              src="/favicon.svg"
              alt=""
              width={34}
              height={34}
              priority
              className="h-[34px] w-[34px] shrink-0"
            />
            <span className="font-display text-base leading-none font-bold tracking-[-0.02em] text-[var(--text-primary)]">
              AWESOME
              <span className="text-[var(--accent-primary)]"> INTUNE</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 xl:flex">
            {pathname !== "/" && <HeaderSearch />}
            {navItems.map((item) => {
              const active =
                item.href !== "/#tools" && pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex min-h-11 items-center rounded-[10px] px-3.5 py-2 text-[13px] font-medium transition-colors ${
                    active
                      ? "bg-[var(--accent-glow)] text-[var(--accent-primary)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <a
              href={COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 touch-manipulation items-center gap-1.5 rounded-[10px] px-3.5 text-[13px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--accent-glow)] hover:text-[var(--accent-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Community
            </a>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-[10px] px-3.5 py-2 text-[13px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
            >
              GitHub
            </a>
            <ChangelogBell />
            <ThemeToggle />
            <Link
              href="/submit"
              className="ml-1 inline-flex items-center gap-1.5 rounded-[10px] bg-[var(--accent-solid)] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--accent-solid-hover)]"
            >
              <span aria-hidden="true">＋</span> Add Tool
            </Link>
          </div>

          <div className="flex items-center gap-2 xl:hidden">
            <ChangelogBell />
            <ThemeToggle />
            <Link
              href="/submit"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-solid)] text-lg text-white"
              aria-label="Add a tool"
            >
              +
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
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
        <div className="border-t border-[color:var(--border-subtle)] bg-[var(--bg-secondary)] px-5 py-4 xl:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-11 items-center rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="my-2 flex min-h-16 touch-manipulation items-center gap-3 rounded-xl border border-[color:var(--border-accent)] bg-[var(--accent-glow)] px-3 py-3 transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--accent-primary)] text-white shadow-[var(--shadow-sm)]">
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-[var(--text-primary)]">
                  Community
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-[var(--text-secondary)]">
                  Join the official LinkedIn group
                </span>
              </span>
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="shrink-0 text-[var(--accent-primary)]"
              >
                <path d="M15 3h6v6" />
                <path d="M10 14 21 3" />
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              </svg>
            </a>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
            >
              GitHub
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
