import Link from "next/link";
import { formatReleaseDate } from "@/lib/format";

export interface ReleaseArchiveItem {
  version: string;
  href: string;
  /** ISO date, YYYY-MM-DD. */
  dateISO: string;
  /** Derived display line, e.g. "Android 16 • QPR2 • GMS". */
  meta: string;
  isLatest?: boolean;
  isNew?: boolean;
}

/**
 * Compact release-history list shared by the ROM and kernel detail pages.
 * Items must arrive sorted newest first; the first item is expected to be
 * the latest release (marked with a red badge).
 */
export function ReleaseArchive({ items }: { items: ReleaseArchiveItem[] }) {
  if (items.length === 0) {
    return (
      <p className="border-b border-line py-10 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
        No releases available yet.
      </p>
    );
  }

  return (
    <ul>
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="group -mx-2 flex items-center gap-4 border-b border-line px-2 py-4 transition-colors last:border-b-0 hover:bg-surface sm:-mx-3 sm:px-3"
          >
            <div className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-mono text-[16px] font-semibold text-fg transition-colors group-hover:text-accent">
                  {item.version}
                </span>
                {item.isLatest && <span className="badge-new">Latest</span>}
                {item.isNew && !item.isLatest && (
                  <span className="inline-flex items-center border border-line bg-raised px-1.5 py-px font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                    New
                  </span>
                )}
              </span>
              <p className="mt-1 truncate text-[13px] text-muted">{item.meta}</p>
              <time
                dateTime={item.dateISO}
                className="mt-0.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-faint"
              >
                {formatReleaseDate(item.dateISO)}
              </time>
            </div>
            <span
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-faint transition-colors group-hover:text-accent"
            >
              View →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}