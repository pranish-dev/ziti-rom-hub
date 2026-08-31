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
  /** Optional Telegram profile URL the maintainer name links to. */
  maintainerTelegram?: string;
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
  /** Optional link to a custom recovery image for this release. */
  recovery?: string;
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
  /** Optional Telegram profile URL the maintainer name links to. */
  maintainerTelegram?: string;
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

/* ------------------------------------------------------------------ */
/* Kernels — first-class archive section alongside ROMs                */
/* ------------------------------------------------------------------ */

export interface Kernel {
  /** Display name, e.g. "KernelSU-Next". */
  name: string;
  /** URL segment, matches the content directory name. */
  slug: string;
  maintainer: string;
  maintainerTelegram?: string;
  /** Upstream kernel source repository. */
  source?: string;
  /** Android base the kernel targets, e.g. "Android 16". */
  android?: string;
  /** Linux version the kernel is based on, e.g. "6.1". */
  linux?: string;
  features: string[];
  description: string;
  /** Public URL of the kernel banner, when present. */
  banner?: string;
  bannerWidth?: number;
  bannerHeight?: number;
}

export interface KernelRelease {
  /** Kernel slug this release belongs to (matches directory). */
  kernelSlug: string;
  /** Directory name of the release, used in URLs. */
  versionDir: string;
  /** Human version string from frontmatter. */
  version: string;
  /** ISO date, YYYY-MM-DD. */
  releaseDate: string;
  android: string;
  linux?: string;
  /** KernelSU build/version info, e.g. "KernelSU Next v1.0.5". */
  kernelSu?: string;
  /** SUSFS info, e.g. "SUSFS v1.5.4". */
  susfs?: string;
  supportedOOS: string[];
  supportedROMs: string[];
  downloads: Downloads;
  source?: string;
  changelog?: string;
  /** Whether the build includes KernelSU. */
  ksu: boolean;
  /** Rendered HTML of the release.md markdown body (changelog/notes). */
  bodyHtml: string;
  bodyExcerpt: string;
  banner?: string;
  bannerWidth?: number;
  bannerHeight?: number;
  screenshots: string[];
}

/** A kernel joined with its sorted releases. */
export interface KernelWithReleases extends Kernel {
  releases: KernelRelease[];
  latest?: KernelRelease;
  releaseCount: number;
}

/** A kernel release joined with its parent kernel. */
export interface KernelReleaseWithKernel extends KernelRelease {
  kernel: KernelWithReleases;
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
