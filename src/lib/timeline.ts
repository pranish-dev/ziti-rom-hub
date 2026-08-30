

/** Number of releases shown in the homepage timeline preview. */
export const LATEST_RELEASES_LIMIT = 10;

export interface TimelineItem {
  romName: string;
  version: string;
  href: string;
  dateISO: string;
  dateLabel: string;
  /** Derived display line: Android · QPR · Variants · Status. */
  meta: string;
  isLatest: boolean;
}