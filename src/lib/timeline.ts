/**
 * Shared timeline constants/types.
 *
 * Lives OUTSIDE the client component module so the server component that maps
 * release data can import `LATEST_RELEASES_LIMIT` as a plain value — importing
 * a non-component export from a "use client" module turns it into a client
 * reference proxy, which breaks `.slice()` at build time.
 */

/** Number of releases shown in the homepage timeline preview. */
export const LATEST_RELEASES_LIMIT = 10;

export interface TimelineItem {
  /** ROM or kernel name. */
  name: string;
  version: string;
  href: string;
  dateISO: string;
  dateLabel: string;
  /** Derived display line: Android · QPR · Variants · Status. */
  meta: string;
  isLatest: boolean;
}