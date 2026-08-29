import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import type { ReleaseListItem, Rom } from "@/lib/types";

/**
 * Dense editorial row for a release. Presentational only — safe to use
 * from server and client components.
 */
export function ReleaseRow({ item }: { item: ReleaseListItem }) {
  const metaParts = [
    item.android,
    item.qpr,
    item.buildTypes.length > 0 ? item.buildTypes.join(" / ") : null,
  ].filter(Boolean);

  return (
    <Link
      href={item.href}
      className="group -mx-2 flex items-center gap-3 border-b border-line px-2 py-4 transition-colors last:border-b-0 hover:bg-surface sm:-mx-3 sm:gap-4 sm:px-3"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[15px] font-semibold text-fg transition-colors group-hover:text-accent">
            {item.romName}
          </span>
          <span className="font-mono text-[14px] font-medium text-muted">
            {item.version}
          </span>
          {item.isNew && <span className="badge-new">New</span>}
        </div>
        <p className="mt-1 truncate text-[13px] text-muted">
          {metaParts.join(" • ")}
        </p>
      </div>
      <time
        dateTime={item.dateISO}
        className="hidden shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-faint sm:block"
      >
        {item.dateLabel}
      </time>
      <span
        aria-hidden="true"
        className="shrink-0 text-faint transition-all group-hover:translate-x-0.5 group-hover:text-accent"
      >
        →
      </span>
    </Link>
  );
}

/** Compact row for a ROM (used on the homepage). */
export function RomRow({
  name,
  href,
  description,
  androidBase,
  support,
  latestVersion,
  releaseCount,
}: {
  name: string;
  href: string;
  description?: string;
  androidBase: string;
  support?: Rom["support"];
  latestVersion?: string;
  releaseCount: number;
}) {
  return (
    <Link
      href={href}
      className="group -mx-2 grid gap-1 border-b border-line px-2 py-4 transition-colors last:border-b-0 hover:bg-surface sm:-mx-3 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6 sm:px-3"
    >
      <div className="min-w-0">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[15px] font-semibold text-fg transition-colors group-hover:text-accent">
            {name}
          </span>
          {support && <StatusBadge support={support} />}
        </span>
        {description && (
          <p className="mt-0.5 line-clamp-1 max-w-xl text-[13px] text-muted">
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between gap-6 sm:justify-end">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
          {androidBase}
          {latestVersion && (
            <>
              {" · Latest "}
              <span className="text-muted">{latestVersion}</span>
            </>
          )}
          {" · "}
          {releaseCount} {releaseCount === 1 ? "release" : "releases"}
        </p>
        <span
          aria-hidden="true"
          className="shrink-0 text-faint transition-all group-hover:translate-x-0.5 group-hover:text-accent"
        >
          →
        </span>
      </div>
    </Link>
  );
}
