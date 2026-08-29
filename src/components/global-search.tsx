"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  loadSearchIndex,
  searchEntries,
  type SearchEntry,
} from "@/lib/search";

const MAX_RESULTS = 8;

function MagnifierIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m13.2 13.2 4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GlobalSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const hasQuery = query.trim().length > 0;
  const results = useMemo(
    () => (index ? searchEntries(index, query) : []),
    [index, query]
  );
  const visible = results.slice(0, MAX_RESULTS);
  const clampedActive = Math.min(activeIndex, visible.length - 1);
  const active = clampedActive >= 0 ? visible[clampedActive] : undefined;

  // Close on navigation so results never point at a stale page.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lazily fetch the static index the first time search is opened.
  useEffect(() => {
    if (!open || index || loadError) return;
    let cancelled = false;
    loadSearchIndex()
      .then((data) => {
        if (!cancelled) setIndex(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [open, index, loadError]);

  // Auto-focus the input and lock page scroll while the dialog is open.
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // Global keyboard shortcuts: "/" opens search anywhere, Esc closes.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (event.key === "/" && !typing && !open) {
        event.preventDefault();
        setOpen(true);
      } else if (event.key === "Escape" && open) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // New query always starts selection from the top result.
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Keep the highlighted result visible while arrowing through the list.
  useEffect(() => {
    if (!open || !listRef.current || clampedActive < 0) return;
    listRef.current
      .querySelector(`#global-search-option-${clampedActive}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [clampedActive, open]);

  function goTo(url: string) {
    setOpen(false);
    router.push(url);
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((value) => Math.min(value + 1, visible.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((value) => Math.max(value - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (active) {
        goTo(active.url);
      } else if (hasQuery) {
        goTo(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
    // Escape is handled by the global listener.
  }

  return (
    <>
      {/* Desktop trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label="Search (press /)"
        className="hidden h-9 items-center gap-2 border border-line px-3 font-mono text-[11px] uppercase tracking-[0.16em] text-faint transition-colors hover:border-muted/60 hover:text-fg md:flex"
      >
        <MagnifierIcon />
        Search
        <kbd
          aria-hidden="true"
          className="border border-line px-1 font-mono text-[10px] text-faint"
        >
          /
        </kbd>
      </button>

      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label="Search"
        className="flex h-11 w-11 items-center justify-center text-muted transition-colors hover:text-fg md:hidden"
      >
        <MagnifierIcon />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          className="fixed inset-0 z-50"
        >
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close search"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-background/90"
          />

          <div className="absolute inset-x-3 top-3 mx-auto max-w-xl border border-line bg-background sm:top-[12vh]">
            <div className="flex items-center border-b border-line transition-colors focus-within:border-muted/60">
              <span className="pl-4 text-faint" aria-hidden="true">
                <MagnifierIcon />
              </span>
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                className="global-search-input h-12 min-w-0 flex-1 bg-transparent px-3 text-[15px] text-fg placeholder:text-faint focus:outline-none focus-visible:outline-none"
                aria-expanded={hasQuery}
                aria-controls="global-search-list"
                aria-activedescendant={
                  active
                    ? `global-search-option-${clampedActive}`
                    : undefined
                }
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Search ROMs, releases and guides..."
                autoComplete="off"
                spellCheck={false}
              />


              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mr-2 flex h-9 w-9 items-center justify-center text-faint transition-colors hover:text-fg"
              >
                <span className="sr-only">Close search</span>
                <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    d="M4 4l12 12M16 4L4 16"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    fill="none"
                  />
                </svg>
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto sm:max-h-[60vh]">
              {loadError && (
                <p className="px-4 py-8 text-center text-[14px] text-muted">
                  The search index could not be loaded.
                </p>
              )}

              {!index && !loadError && (
                <p className="px-4 py-8 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
                  Loading index…
                </p>
              )}

              {index && !hasQuery && (
                <p className="px-4 py-10 text-center text-[14px] text-muted">
                  Search ROMs, releases and guides
                </p>
              )}

              {index && hasQuery && visible.length === 0 && (
                <div className="px-4 py-10 text-center">
                  <p className="text-[14px] text-muted">No results found</p>
                  <p className="mt-1 text-[12.5px] text-faint">
                    Try a different search term.
                  </p>
                </div>
              )}
              {visible.length > 0 && (
                <ul
                  id="global-search-list"
                  ref={listRef}
                  role="listbox"
                  aria-label="Search results"
                >
                  {visible.map((entry, i) => (
                    <li key={entry.url} role="presentation">
                      <Link
                        id={`global-search-option-${i}`}
                        role="option"
                        aria-selected={i === clampedActive}
                        href={entry.url}
                        onClick={() => setOpen(false)}
                        onMouseEnter={() => setActiveIndex(i)}
                        className={`group -mx-px flex items-start gap-3 border-b border-line-soft px-4 py-3 transition-colors last:border-b-0 ${
                          i === clampedActive ? "bg-surface" : ""
                        }`}
                      >
                        <span className="mt-0.5 w-[64px] shrink-0 border border-line bg-raised px-1.5 py-0.5 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                          {entry.kind}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block truncate text-[14px] font-medium transition-colors ${
                              i === clampedActive
                                ? "text-accent"
                                : "text-fg group-hover:text-accent"
                            }`}
                          >
                            {entry.title}
                          </span>
                          <span className="mt-0.5 block truncate font-mono text-[11.5px] text-faint">
                            {entry.subtitle}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className="shrink-0 pt-1 text-faint transition-all group-hover:translate-x-0.5 group-hover:text-accent"
                        >
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
              <span aria-hidden="true" className="truncate">
                ↑↓ navigate · ↵ open · esc close
              </span>
              {results.length > visible.length && (
                <Link
                  href={`/search?q=${encodeURIComponent(query.trim())}`}
                  onClick={() => setOpen(false)}
                  className="shrink-0 transition-colors hover:text-accent"
                >
                  View all {results.length} results →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
