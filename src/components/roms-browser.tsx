"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import { formatReleaseDate } from "@/lib/format";

/** Lean serializable shape for the listing — no release bodies/payloads. */
export interface RomsListItem {
  name: string;
  slug: string;
  support: "official" | "unofficial";
  androidBase: string;
  maintainer: string;
  maintainerTelegram?: string;
  description: string;
  latestVersion?: string;
  latestDate?: string;
  releaseCount: number;
}

type StatusFilter = "official" | "unofficial";

const FILTERS: Array<{ label: string; href: string; value?: StatusFilter }> = [
  { label: "All ROMs", href: "/ziti/roms" },
  { label: "Official", href: "/ziti/roms?status=official", value: "official" },
  {
    label: "Unofficial",
    href: "/ziti/roms?status=unofficial",
    value: "unofficial",
  },
];

function readStatusFilter(): StatusFilter | undefined {
  const value = new URLSearchParams(window.location.search).get("status");
  return value === "official" || value === "unofficial" ? value : undefined;
}

export function RomsBrowser({ roms }: { roms: RomsListItem[] }) {
  const [status, setStatus] = useState<StatusFilter | undefined>();

  // Read the ?status= param on load (shareable/bookmarked URLs) and on
  // back/forward navigation.
  useEffect(() => {
    const sync = () => setStatus(readStatusFilter());
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const filtered = status
    ? roms.filter((rom) => rom.support === status)
    : roms;

  return (
    <>
      {/* Compact status filter */}
      <div
        role="group"
        aria-label="Filter ROMs by status"
        className="mt-8 flex flex-wrap items-center gap-2"
      >
        {FILTERS.map((filter) => {
          const isActive = status === filter.value;
          return (
            <Link
              key={filter.label}
              href={filter.href}
              onClick={() => setStatus(filter.value)}
              aria-pressed={isActive}
              className={`inline-flex items-center border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                isActive
                  ? "border-accent/50 bg-accent/10 text-accent"
                  : "border-line bg-raised text-muted hover:border-muted/60 hover:text-fg"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
        {status && (
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
            {filtered.length} of {roms.length}{" "}
            {roms.length === 1 ? "ROM" : "ROMs"}
          </span>
        )}
      </div>

      <ul className="mt-10 border-t border-line">
        {filtered.map((rom) => (
          <li key={rom.slug} className="border-b border-line">
            <Link
              href={`/ziti/roms/${rom.slug}`}
              className="group grid gap-1.5 px-2 py-5 transition-colors hover:bg-surface sm:-mx-2 sm:grid-cols-[minmax(0,20rem)_minmax(0,1fr)_auto] sm:gap-6 sm:px-3"
            >
              <span>
                <span className="block text-[16px] font-semibold text-fg transition-colors group-hover:text-accent">
                  {rom.name}
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-x-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
                  <StatusBadge support={rom.support} />
                  <span>{rom.androidBase}</span>
                  <span>·</span>
                  <span>
                    Maintainer{" "}
                    {rom.maintainerTelegram ? (
                      <a
                        href={rom.maintainerTelegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-line underline-offset-2 transition-colors hover:text-accent hover:decoration-accent"
                      >
                        {rom.maintainer}
                      </a>
                    ) : (
                      rom.maintainer
                    )}
                  </span>
                </span>
              </span>
              <span className="max-w-xl self-center text-[13px] leading-relaxed text-muted line-clamp-2">
                {rom.description}
              </span>
              <span className="self-center font-mono text-[11px] uppercase tracking-[0.14em] text-faint sm:text-right">
                Latest <span className="text-muted">{rom.latestVersion ?? "—"}</span>
                {rom.latestDate && (
                  <span className="mt-1 block">
                    {formatReleaseDate(rom.latestDate)}
                  </span>
                )}
                <span className="mt-1 block">
                  {rom.releaseCount}{" "}
                  {rom.releaseCount === 1 ? "release" : "releases"}
                </span>
              </span>
            </Link>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="border-b border-line py-10 text-center text-[14px] text-faint">
            {status
              ? `No ${status} ROMs available yet.`
              : "No ROMs published yet."}
          </li>
        )}
      </ul>
    </>
  );
}