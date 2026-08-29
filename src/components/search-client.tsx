"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  loadSearchIndex,
  searchEntries,
  type SearchEntry,
} from "@/lib/search";

const MAX_RESULTS = 30;

export function SearchClient() {
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Populate the query from /search?q=... so searches are shareable.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) setQuery(q);
  }, []);

  useEffect(() => {
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
  }, []);

  // Keep the URL in sync with the query (bookmarkable, no navigation).
  useEffect(() => {
    const q = query.trim();
    const url = q ? `/search?q=${encodeURIComponent(q)}` : "/search";
    window.history.replaceState(null, "", url);
  }, [query]);

  const hasQuery = query.trim().length > 0;
  const results = useMemo(
    () => (index ? searchEntries(index, query).slice(0, MAX_RESULTS) : []),
    [index, query]
  );

  return (
    <div>
      <label className="block">
        <span className="sr-only">Search</span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={'Search ROMs, releases and guides...   (press "/")'}
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

      {index && !hasQuery && (
        <p className="mt-8 text-[14px] text-muted">
          Search ROMs, releases and guides
        </p>
      )}

      {index && hasQuery && (
        <>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
            {results.length} {results.length === 1 ? "result" : "results"}
          </p>
          <div className="mt-2">
            {results.length === 0 ? (
              <div className="border-b border-line py-8 text-center">
                <p className="text-[14px] text-muted">No results found</p>
                <p className="mt-1 text-[12.5px] text-faint">
                  Try a different search term.
                </p>
              </div>
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
