"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

interface SearchEntry {
  kind: "ROM" | "Release" | "Guide";
  title: string;
  subtitle: string;
  url: string;
  terms: string;
}

const KIND_ORDER: Record<SearchEntry["kind"], number> = {
  Release: 0,
  ROM: 1,
  Guide: 2,
};

function scoreEntry(entry: SearchEntry, tokens: string[]): number | null {
  const title = entry.title.toLowerCase();
  const subtitle = entry.subtitle.toLowerCase();
  let total = 0;

  for (const token of tokens) {
    let tokenScore: number | null = null;
    if (title === token) tokenScore = 160;
    else if (title.startsWith(token)) tokenScore = 110;
    else if (title.includes(token)) tokenScore = 70;
    else if (subtitle.includes(token)) tokenScore = 30;
    else if (entry.terms.includes(token)) tokenScore = 12;
    if (tokenScore === null) return null;
    total += tokenScore;
  }

  return total;
}

export function SearchClient() {
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/search")
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<SearchEntry[]>;
      })
      .then((data) => {
        if (!cancelled) setIndex(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (event.key === "/" && !typing) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const results = useMemo(() => {
    if (!index) return [];
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return [];
    const scored: Array<{ entry: SearchEntry; score: number }> = [];
    for (const entry of index) {
      const score = scoreEntry(entry, tokens);
      if (score !== null) scored.push({ entry, score });
    }
    return scored
      .sort(
        (a, b) =>
          b.score - a.score || KIND_ORDER[a.entry.kind] - KIND_ORDER[b.entry.kind]
      )
      .slice(0, 30)
      .map((item) => item.entry);
  }, [index, query]);

  return (
    <div>
      <label className="block">
        <span className="sr-only">Search</span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder='Search ROMs, releases, guides…   (press "/")'
          autoFocus
          className="h-12 w-full border border-line bg-surface px-4 text-[15px] text-fg placeholder:text-faint focus:border-muted/60 focus:outline-none focus-visible:outline-none"
        />
      </label>

      {loadError && (
        <p className="mt-6 border-l-2 border-accent bg-surface px-4 py-3 text-[14px] text-muted">
          The search index could not be loaded.
        </p>
      )}

      {!index && !loadError && (
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
          Loading index…
        </p>
      )}

      {query.trim().length > 0 && index && (
        <>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
            {results.length} {results.length === 1 ? "result" : "results"}
          </p>
          <div className="mt-2">
            {results.length === 0 ? (
              <p className="border-b border-line py-8 text-center text-[14px] text-muted">
                Nothing found. Try a ROM name, version, maintainer or Android
                version.
              </p>
            ) : (
              results.map((entry) => (
                <Link
                  key={entry.url + entry.title}
                  href={entry.url}
                  className="group -mx-2 flex items-start gap-4 border-b border-line px-2 py-3.5 transition-colors last:border-b-0 hover:bg-surface sm:-mx-3 sm:px-3"
                >
                  <span className="mt-0.5 w-[64px] shrink-0 border border-line bg-raised px-1.5 py-0.5 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                    {entry.kind}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14.5px] font-medium text-fg transition-colors group-hover:text-accent">
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
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
