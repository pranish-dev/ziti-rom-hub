/**
 * Shared content types.
 *
 * These are plain serializable shapes safe to import from both server
 * components and client components.
 */

export interface RomLink {
  label: string;
  url: string;
}

export interface Rom {
  /** Display name, e.g. "LunarisAOSP". */
  name: string;
  /** URL segment, matches the content directory name. */
  slug: string;
  /** Device codename, defaults to "ziti". */
  codename: string;
  /** Marketing device name, defaults to "OnePlus Nord CE 3 5G". */
  device: string;
  maintainer: string;
  androidBase: string;
  /** Whether the ROM officially supports the device, or is a community/unofficial build. */
  support: "official" | "unofficial";
  officialSite?: string;
  github?: string;
  links: RomLink[];
  description: string;
}

export interface Downloads {
  primary?: string;
  mirror?: string;
  changelog?: string;
}

export interface Requirements {
  firmware?: string;
  arb?: string;
}

export interface Release {
  /** ROM slug this release belongs to (matches directory). */
  romSlug: string;
  /** Directory name of the release, used in URLs. */
  versionDir: string;
  /** Human version string from frontmatter. */
  version: string;
  /** ISO date, YYYY-MM-DD. */
  releaseDate: string;
  android: string;
  qpr?: string;
  /** Kind of build: a regular release or a hotfix. */
  build: "normal" | "hotfix";
  buildType: string[];
  maintainer?: string;
  downloads: Downloads;
  requirements: Requirements;
  warnings: string[];
  cleanFlash: boolean;
  backupRequired: boolean;
  features: string[];
  credits: string[];
  /** Rendered HTML of the release.md markdown body. */
  bodyHtml: string;
  /** Plain-text excerpt of the body, used for search and previews. */
  bodyExcerpt: string;
  /** Public URL of the banner image, when present. */
  banner?: string;
  /** Intrinsic banner dimensions, used to preserve its aspect ratio. */
  bannerWidth?: number;
  bannerHeight?: number;
  /** Public URLs of discovered screenshots, sorted naturally. */
  screenshots: string[];
}

export interface Guide {
  slug: string;
  title: string;
  description?: string;
  order: number;
  bodyHtml: string;
}

/** A release joined with its parent ROM (including sibling releases). */
export interface ReleaseWithRom extends Release {
  rom: RomWithReleases;
}

/** A ROM joined with its sorted releases. */
export interface RomWithReleases extends Rom {
  releases: Release[];
  latest?: Release;
  releaseCount: number;
}

/**
 * Flat display shape handed to client/list components.
 * Contains no Dates and no filesystem references.
 */
export interface ReleaseListItem {
  romName: string;
  romSlug: string;
  version: string;
  href: string;
  dateISO: string;
  dateLabel: string;
  isNew: boolean;
  android: string;
  qpr?: string;
  buildTypes: string[];
  maintainer: string;
}
