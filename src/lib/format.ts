import type { Release, ReleaseListItem, Rom, RomWithReleases } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;
const NEW_WINDOW_MS = 7 * DAY_MS;

/** Parse YYYY-MM-DD as UTC so formatting never shifts by a day. */
export function parseISODateUTC(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

const DATE_LABEL = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatReleaseDate(iso: string): string {
  return DATE_LABEL.format(parseISODateUTC(iso));
}

/** A release counts as NEW for ~7 days after its release date. */
export function isNewRelease(iso: string, now: number = Date.now()): boolean {
  const t = parseISODateUTC(iso).getTime();
  return now - t <= NEW_WINDOW_MS && now - t >= -DAY_MS;
}

export function romHref(rom: Pick<Rom, "slug">): string {
  return `/ziti/roms/${rom.slug}`;
}

export function releaseHref(
  romSlug: string,
  versionDir: string
): string {
  return `/ziti/roms/${romSlug}/${versionDir}`;
}

/** Flatten a release + ROM into the serializable list-item shape. */
export function toReleaseListItem(
  release: Release,
  rom: RomWithReleases | Rom,
  now: number = Date.now()
): ReleaseListItem {
  return {
    romName: rom.name,
    romSlug: rom.slug,
    version: release.version,
    href: releaseHref(release.romSlug, release.versionDir),
    dateISO: release.releaseDate,
    dateLabel: formatReleaseDate(release.releaseDate),
    isNew: isNewRelease(release.releaseDate, now),
    android: release.android,
    qpr: release.qpr,
    buildTypes: release.buildType,
    maintainer: release.maintainer ?? rom.maintainer,
  };
}

const HOST_LABELS: Record<string, string> = {
  "github.com": "GitHub",
  "sourceforge.net": "SourceForge",
  "pling.com": "Pling",
  "www.pling.com": "Pling",
  "odindrive.com": "OdinDrive",
  "mega.nz": "MEGA",
  "drive.google.com": "Google Drive",
  "t.me": "Telegram",
};

/** Human label for an external download host, e.g. "SourceForge". */
export function downloadHostLabel(url: string): string {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (HOST_LABELS[host]) return HOST_LABELS[host];
    if (host.startsWith("www.")) return host.slice(4);
    return host;
  } catch {
    return "external site";
  }
}
