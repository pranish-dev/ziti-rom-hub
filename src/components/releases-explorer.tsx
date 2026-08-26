"use client";

import { useMemo, useState } from "react";
import type { ReleaseListItem } from "@/lib/types";
import { ReleaseRow } from "./release-row";

interface ReleasesExplorerProps {
  releases: ReleaseListItem[];
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-0 items-center gap-2">
      <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full min-w-0 border border-line bg-raised px-2.5 text-[13px] text-fg"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "all" ? "All" : option}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Editorial, filterable list of every release across every ROM.
 * Filtering happens client-side over data generated at build time.
 */
export function ReleasesExplorer({ releases }: ReleasesExplorerProps) {
  const [query, setQuery] = useState("");
  const [rom, setRom] = useState("all");
  const [android, setAndroid] = useState("all");
  const [buildType, setBuildType] = useState("all");

  const romOptions = useMemo(
    () => ["all", ...Array.from(new Set(releases.map((r) => r.romName))).sort()],
    [releases]
  );
  const androidOptions = useMemo(
    () =>
      ["all", ...Array.from(new Set(releases.map((r) => r.android))).sort()].reverse(),
    [releases]
  );
  const buildTypeOptions = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(releases.flatMap((r) => r.buildTypes))
      ).sort(),
    ],
    [releases]
  );

  const filtered = useMemo(() => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return releases.filter((release) => {
      if (rom !== "all" && release.romName !== rom) return false;
      if (android !== "all" && release.android !== android) return false;
      if (buildType !== "all" && !release.buildTypes.includes(buildType))
        return false;
      if (tokens.length > 0) {
        const haystack = [
          release.romName,
          release.version,
          release.android,
          release.qpr ?? "",
          release.maintainer,
          release.dateLabel,
          ...release.buildTypes,
        ]
          .join(" ")
          .toLowerCase();
        if (!tokens.every((token) => haystack.includes(token))) return false;
      }
      return true;
    });
  }, [releases, query, rom, android, buildType]);

  return (
    <div>
      <div className="panel p-3 sm:p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
          <label className="flex items-center gap-2">
            <span className="sr-only">Search releases</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              aria-hidden="true"
              className="shrink-0 text-faint"
            >
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" fill="none" />
              <path d="M10.5 10.5 14 14" stroke="currentColor" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search version, maintainer…"
              className="h-10 w-full border border-line bg-raised px-3 text-[13px] text-fg placeholder:text-faint focus:border-muted/60 focus:outline-none focus-visible:outline-none"
            />
          </label>
          <Select
            label="ROM"
            value={rom}
            options={romOptions}
            onChange={setRom}
          />
          <Select
            label="Android"
            value={android}
            options={androidOptions}
            onChange={setAndroid}
          />
          <Select
            label="Build"
            value={buildType}
            options={buildTypeOptions}
            onChange={setBuildType}
          />
        </div>
      </div>

      <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
        {filtered.length} of {releases.length}{" "}
        {releases.length === 1 ? "release" : "releases"}
      </p>

      <div className="mt-2">
        {filtered.length === 0 ? (
          <p className="border-b border-line py-8 text-center text-[14px] text-muted">
            No releases match these filters.
          </p>
        ) : (
          filtered.map((item) => <ReleaseRow key={item.href} item={item} />)
        )}
      </div>
    </div>
  );
}
