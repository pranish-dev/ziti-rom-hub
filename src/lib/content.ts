import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import { renderMarkdown, stripMarkdown } from "./markdown";
import { getImageDimensions } from "./image-size";
import {
  VERSION_DIR_RE,
  formatContentError,
  guideSchema,
  kernelReleaseSchema,
  kernelSchema,
  releaseSchema,
  romSchema,
} from "./schemas";
import type {
  Guide,
  KernelRelease,
  KernelReleaseWithKernel,
  KernelWithReleases,
  Release,
  ReleaseWithRom,
  RomWithReleases,
} from "./types";

/**
 * Content loader.
 *
 * GitHub is the database: everything is read from `content/` at build time,
 * validated with Zod, and memoized for the lifetime of the process. Any
 * malformed content throws a descriptive error so the Vercel build fails
 * loudly instead of publishing broken data.
 */

const CONTENT_ROOT = path.join(process.cwd(), "content");
const ROMS_ROOT = path.join(CONTENT_ROOT, "roms");
const KERNELS_ROOT = path.join(CONTENT_ROOT, "kernels");
const GUIDES_ROOT = path.join(CONTENT_ROOT, "guides");

const IMAGE_EXTENSIONS = new Set([
  ".webp",
  ".png",
  ".jpg",
  ".jpeg",
  ".avif",
  ".gif",
]);
const BANNER_CANDIDATES = [
  "banner.webp",
  "banner.png",
  "banner.jpg",
  "banner.jpeg",
  "banner.avif",
];

interface HubData {
  roms: RomWithReleases[];
  kernels: KernelWithReleases[];
  guides: Guide[];
}

let cache: HubData | null = null;

function fail(message: string): never {
  throw new Error(`\n\n${message}\n`);
}

function readDirs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function readFileIfExists(filePath: string): string | null {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf8");
}

/**
 * Parse frontmatter, reporting YAML syntax errors as clean, file-anchored
 * failures instead of an uncaught stack trace.
 */
function parseFrontmatter(
  raw: string,
  mdPath: string,
  errors: string[]
): { data: unknown; content: string } | null {
  try {
    return matter(raw);
  } catch (error) {
    const detail = String(error instanceof Error ? error.message : error)
      .split("\n")
      .map((line) => `  ${line}`)
      .join("\n");
    errors.push(
      ["Unparseable YAML frontmatter:", "", mdPath, "", detail].join("\n")
    );
    return null;
  }
}

/** Map a file inside content/ to its public URL under /media. */
function mediaUrl(contentRelativePath: string): string {
  const segments = contentRelativePath.split("/").map(encodeURIComponent);
  return `/media/${segments.join("/")}`;
}

function findBanner(
  section: "roms" | "kernels",
  slug: string,
  versionDir: string,
  releaseDir: string
): { url: string; width: number; height: number } | undefined {
  for (const candidate of BANNER_CANDIDATES) {
    const absolutePath = path.join(releaseDir, candidate);
    if (fs.existsSync(absolutePath)) {
      const { width, height } = getImageDimensions(absolutePath);
      // Derive the public URL from the release dir's ACTUAL content-relative
      // path (copy-media preserves it verbatim) — this keeps ROM URLs
      // (`roms/<slug>/releases/<v>/…`) and supports kernel layouts with or
      // without a `releases/` segment.
      const contentRel = path
        .relative(CONTENT_ROOT, releaseDir)
        .split(path.sep)
        .join("/");
      return {
        url: mediaUrl(`${contentRel}/${candidate}`),
        width,
        height,
      };
    }
  }
  return undefined;
}

function findScreenshots(
  section: "roms" | "kernels",
  slug: string,
  versionDir: string,
  releaseDir: string
): string[] {
  const screenshotsDir = path.join(releaseDir, "screenshots");
  if (!fs.existsSync(screenshotsDir)) return [];
  const natural = new Intl.Collator(undefined, { numeric: true });
  // Same as findBanner: URL follows the dir's real content-relative path.
  const contentRel = path
    .relative(CONTENT_ROOT, screenshotsDir)
    .split(path.sep)
    .join("/");
  return fs
    .readdirSync(screenshotsDir)
    .filter((name) =>
      IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase())
    )
    .sort(natural.compare)
    .map((name) => mediaUrl(`${contentRel}/${name}`));
}

/**
 * Sort two versioned entries (ROM or kernel releases) newest first, using the
 * release date and falling back to a numeric version-directory comparison.
 */
function newerRelease(
  a: { releaseDate: string; versionDir: string },
  b: { releaseDate: string; versionDir: string }
): number {
  const byDate =
    parseDate(b.releaseDate).getTime() - parseDate(a.releaseDate).getTime();
  if (byDate !== 0) return byDate;
  // Same date: compare versions numerically where possible (3.12 > 3.9).
  return b.versionDir.localeCompare(a.versionDir, undefined, {
    numeric: true,
  });
}

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function loadRoms(errors: string[]): RomWithReleases[] {
  const roms: RomWithReleases[] = [];

  for (const dirName of readDirs(ROMS_ROOT)) {
    const romMdRel = `content/roms/${dirName}/rom.md`;
    const raw = readFileIfExists(path.join(ROMS_ROOT, dirName, "rom.md"));
    if (raw === null) {
      errors.push(
        [
          "Missing ROM metadata:",
          "",
          romMdRel,
          "",
          "Every ROM directory must contain a rom.md file.",
        ].join("\n")
      );
      continue;
    }

    const parsedFile = parseFrontmatter(raw, romMdRel, errors);
    if (!parsedFile) continue;
    const parsed = romSchema.safeParse(parsedFile.data);
    if (!parsed.success) {
      errors.push(formatContentError("ROM", romMdRel, parsed.error));
      continue;
    }

    const frontmatter = parsed.data;
    if (frontmatter.slug !== dirName) {
      errors.push(
        [
          "Invalid ROM metadata:",
          "",
          romMdRel,
          "",
          `  • slug "${frontmatter.slug}" must match the directory name "${dirName}"`,
        ].join("\n")
      );
      continue;
    }

    const releases = loadReleases(dirName, errors);
    releases.sort(newerRelease);

    roms.push({
      name: frontmatter.name,
      slug: frontmatter.slug,
      codename: frontmatter.codename,
      device: frontmatter.device,
      maintainer: frontmatter.maintainer,
      maintainerTelegram: frontmatter.maintainer_telegram,
      androidBase: frontmatter.android_base,
      support: frontmatter.support,
      officialSite: frontmatter.official_site,
      github: frontmatter.github,
      links: frontmatter.links,
      description: frontmatter.description,
      releases,
      latest: releases[0],
      releaseCount: releases.length,
    });
  }

  return roms;
}

function loadReleases(romSlug: string, errors: string[]): Release[] {
  const releasesRoot = path.join(ROMS_ROOT, romSlug, "releases");
  const releases: Release[] = [];

  for (const versionDir of readDirs(releasesRoot)) {
    const releaseDir = path.join(releasesRoot, versionDir);
    const relMdRel = `content/roms/${romSlug}/releases/${versionDir}/release.md`;

    if (!VERSION_DIR_RE.test(versionDir)) {
      errors.push(
        [
          "Invalid release directory name:",
          "",
          relMdRel,
          "",
          `  • "${versionDir}" — use letters, digits, dots, underscores or hyphens only`,
        ].join("\n")
      );
      continue;
    }

    const raw = readFileIfExists(path.join(releaseDir, "release.md"));
    if (raw === null) {
      errors.push(
        [
          "Missing release metadata:",
          "",
          relMdRel,
          "",
          "Every release directory must contain a release.md file.",
        ].join("\n")
      );
      continue;
    }

    const parsedFile = parseFrontmatter(raw, relMdRel, errors);
    if (!parsedFile) continue;
    const parsed = releaseSchema.safeParse(parsedFile.data);
    if (!parsed.success) {
      errors.push(formatContentError("release", relMdRel, parsed.error));
      continue;
    }

    const frontmatter = parsed.data;
    const bodyHtml = renderMarkdown(parsedFile.content);
    const bodyExcerpt = stripMarkdown(parsedFile.content).slice(0, 600);
    const banner = findBanner("roms", romSlug, versionDir, releaseDir);

    releases.push({
      romSlug,
      versionDir,
      version: frontmatter.version,
      releaseDate: frontmatter.release_date,
      android: frontmatter.android,
      qpr: frontmatter.qpr,
      build: frontmatter.build,
      buildType: frontmatter.build_type,
      maintainer: frontmatter.maintainer,
      maintainerTelegram: frontmatter.maintainer_telegram,
      downloads: frontmatter.downloads,
      requirements: frontmatter.requirements,
      warnings: frontmatter.warnings,
      cleanFlash: frontmatter.clean_flash,
      backupRequired: frontmatter.backup_required,
      features: frontmatter.features,
      credits: frontmatter.credits,
      bodyHtml,
      bodyExcerpt,
      banner: banner?.url,
      bannerWidth: banner?.width,
      bannerHeight: banner?.height,
      screenshots: findScreenshots("roms", romSlug, versionDir, releaseDir),
    });
  }

  return releases;
}

function loadKernelReleases(
  kernelSlug: string,
  errors: string[]
): KernelRelease[] {
  const kernelRoot = path.join(KERNELS_ROOT, kernelSlug);
  const releasesRoot = path.join(kernelRoot, "releases");
  const releases: KernelRelease[] = [];

  // A version dir lives either under `releases/` (ROM convention) or directly
  // at the kernel root (`content/kernels/<slug>/<version>/`). Collect both,
  // preferring `releases/` when the same name exists twice.
  const versionDirs = new Map<string, string>();
  for (const versionDir of readDirs(releasesRoot)) {
    versionDirs.set(versionDir, path.join(releasesRoot, versionDir));
  }
  for (const versionDir of readDirs(kernelRoot)) {
    const dir = path.join(kernelRoot, versionDir);
    if (
      fs.existsSync(path.join(dir, "release.md")) &&
      !versionDirs.has(versionDir)
    ) {
      versionDirs.set(versionDir, dir);
    }
  }

  for (const [versionDir, releaseDir] of versionDirs) {
    const underReleases = path.basename(releaseDir) === versionDir &&
      path.dirname(releaseDir) === releasesRoot;
    const relMdRel = underReleases
      ? `content/kernels/${kernelSlug}/releases/${versionDir}/release.md`
      : `content/kernels/${kernelSlug}/${versionDir}/release.md`;

    if (!VERSION_DIR_RE.test(versionDir)) {
      errors.push(
        [
          "Invalid kernel release directory name:",
          "",
          relMdRel,
          "",
          `  • "${versionDir}" — use letters, digits, dots, underscores or hyphens only`,
        ].join("\n")
      );
      continue;
    }

    const raw = readFileIfExists(path.join(releaseDir, "release.md"));
    if (raw === null) {
      errors.push(
        [
          "Missing kernel release metadata:",
          "",
          relMdRel,
          "",
          "Every kernel release directory must contain a release.md file.",
        ].join("\n")
      );
      continue;
    }

    const parsedFile = parseFrontmatter(raw, relMdRel, errors);
    if (!parsedFile) continue;
    const parsed = kernelReleaseSchema.safeParse(parsedFile.data);
    if (!parsed.success) {
      errors.push(formatContentError("kernel release", relMdRel, parsed.error));
      continue;
    }

    const frontmatter = parsed.data;
    const banner = findBanner("kernels", kernelSlug, versionDir, releaseDir);

    releases.push({
      kernelSlug,
      versionDir,
      version: frontmatter.version,
      releaseDate: frontmatter.release_date,
      android: frontmatter.android,
      linux: frontmatter.linux,
      kernelSu: frontmatter.kernel_su,
      susfs: frontmatter.susfs,
      supportedOOS: frontmatter.supported_oos,
      supportedROMs: frontmatter.supported_roms,
      downloads: frontmatter.downloads,
      source: frontmatter.source,
      changelog: frontmatter.changelog,
      ksu: frontmatter.ksu,
      bodyHtml: renderMarkdown(parsedFile.content),
      bodyExcerpt: stripMarkdown(parsedFile.content).slice(0, 600),
      banner: banner?.url,
      bannerWidth: banner?.width,
      bannerHeight: banner?.height,
      screenshots: findScreenshots("kernels", kernelSlug, versionDir, releaseDir),
    });
  }

  return releases;
}

/** Find a banner at the kernel root, e.g. content/kernels/<slug>/banner.jpg. */
function findKernelBanner(
  kernelSlug: string
): { url: string; width: number; height: number } | undefined {
  for (const candidate of BANNER_CANDIDATES) {
    const absolutePath = path.join(KERNELS_ROOT, kernelSlug, candidate);
    if (fs.existsSync(absolutePath)) {
      const { width, height } = getImageDimensions(absolutePath);
      return {
        url: mediaUrl(`kernels/${kernelSlug}/${candidate}`),
        width,
        height,
      };
    }
  }
  return undefined;
}

function loadKernels(errors: string[]): KernelWithReleases[] {
  const kernels: KernelWithReleases[] = [];

  for (const dirName of readDirs(KERNELS_ROOT)) {
    const kernelMdRel = `content/kernels/${dirName}/kernel.md`;
    const raw = readFileIfExists(path.join(KERNELS_ROOT, dirName, "kernel.md"));
    if (raw === null) {
      errors.push(
        [
          "Missing kernel metadata:",
          "",
          kernelMdRel,
          "",
          "Every kernel directory must contain a kernel.md file.",
        ].join("\n")
      );
      continue;
    }

    const parsedFile = parseFrontmatter(raw, kernelMdRel, errors);
    if (!parsedFile) continue;
    const parsed = kernelSchema.safeParse(parsedFile.data);
    if (!parsed.success) {
      errors.push(formatContentError("kernel", kernelMdRel, parsed.error));
      continue;
    }

    const frontmatter = parsed.data;
    if (frontmatter.slug !== dirName) {
      errors.push(
        [
          "Invalid kernel metadata:",
          "",
          kernelMdRel,
          "",
          `  • slug "${frontmatter.slug}" must match the directory name "${dirName}"`,
        ].join("\n")
      );
      continue;
    }

    const releases = loadKernelReleases(dirName, errors);
    releases.sort(newerRelease);
    const kernelBanner = findKernelBanner(dirName);

    kernels.push({
      name: frontmatter.name,
      slug: frontmatter.slug,
      maintainer: frontmatter.maintainer,
      maintainerTelegram: frontmatter.maintainer_telegram,
      source: frontmatter.source,
      android: frontmatter.android,
      linux: frontmatter.linux,
      features: frontmatter.features,
      description: frontmatter.description,
      banner: kernelBanner?.url ?? releases[0]?.banner,
      bannerWidth:
        kernelBanner?.width ?? releases[0]?.bannerWidth,
      bannerHeight:
        kernelBanner?.height ?? releases[0]?.bannerHeight,
      releases,
      latest: releases[0],
      releaseCount: releases.length,
    });
  }

  return kernels;
}

function loadGuides(errors: string[]): Guide[] {
  if (!fs.existsSync(GUIDES_ROOT)) return [];
  const guides: Guide[] = [];
  const natural = new Intl.Collator(undefined, { numeric: true });

  const files = fs
    .readdirSync(GUIDES_ROOT, { withFileTypes: true })
    .filter(
      (entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".md")
    )
    .map((entry) => entry.name);

  for (const fileName of files) {
    const slug = fileName.slice(0, -3);
    const filePath = path.join(GUIDES_ROOT, fileName);
    const mdPath = `content/guides/${fileName}`;
    const raw = readFileIfExists(filePath);
    if (raw === null) continue;

    const parsedFile = parseFrontmatter(raw, mdPath, errors);
    if (!parsedFile) continue;
    const parsed = guideSchema.safeParse(parsedFile.data);
    if (!parsed.success) {
      errors.push(formatContentError("guide", mdPath, parsed.error));
      continue;
    }

    guides.push({
      slug,
      title: parsed.data.title,
      description: parsed.data.description,
      order: parsed.data.order,
      bodyHtml: renderMarkdown(parsedFile.content),
    });
  }

  guides.sort(
    (a, b) =>
      a.order - b.order || natural.compare(a.title, b.title)
  );
  return guides;
}

function loadHub(): HubData {
  if (cache) return cache;

  const errors: string[] = [];
  const roms = loadRoms(errors);
  const kernels = loadKernels(errors);
  const guides = loadGuides(errors);

  if (errors.length > 0) {
    throw new Error(
      `\n\nContent validation failed with ${errors.length} problem${
        errors.length === 1 ? "" : "s"
      }:\n\n${errors.join("\n\n")}\n`
    );
  }

  cache = { roms, kernels, guides };
  return cache;
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export function getAllRoms(): RomWithReleases[] {
  return loadHub().roms;
}

export function getRom(slug: string): RomWithReleases | undefined {
  return loadHub().roms.find((rom) => rom.slug === slug);
}

export function getRomOrThrow(slug: string): RomWithReleases {
  const rom = getRom(slug);
  if (!rom) fail(`ROM not found: ${slug}`);
  return rom;
}

/** Every release across every ROM, newest first. */
export function getAllReleases(): ReleaseWithRom[] {
  const all: ReleaseWithRom[] = [];
  for (const rom of loadHub().roms) {
    for (const release of rom.releases) {
      all.push({ ...release, rom });
    }
  }
  return all.sort((a, b) => newerRelease(a, b));
}

export function getRecentReleases(count = 6): ReleaseWithRom[] {
  return getAllReleases().slice(0, count);
}

export function getReleasesForRom(slug: string): ReleaseWithRom[] {
  return getAllReleases().filter((release) => release.romSlug === slug);
}

export function getRelease(
  romSlug: string,
  versionDir: string
): ReleaseWithRom | undefined {
  const rom = getRom(romSlug);
  const release = rom?.releases.find(
    (candidate) => candidate.versionDir === versionDir
  );
  if (!rom || !release) return undefined;
  return { ...release, rom };
}

export function getGuide(slug: string): Guide | undefined {
  return loadHub().guides.find((guide) => guide.slug === slug);
}

export function getAllGuides(): Guide[] {
  return loadHub().guides;
}

/* ------------------------------------------------------------------ */
/* Kernels                                                             */
/* ------------------------------------------------------------------ */

export function getAllKernels(): KernelWithReleases[] {
  return loadHub().kernels;
}

export function getKernel(slug: string): KernelWithReleases | undefined {
  return loadHub().kernels.find((kernel) => kernel.slug === slug);
}

export function getKernelOrThrow(slug: string): KernelWithReleases {
  const kernel = getKernel(slug);
  if (!kernel) fail(`Kernel not found: ${slug}`);
  return kernel;
}

/** Every kernel release across every kernel, newest first. */
export function getAllKernelReleases(): KernelReleaseWithKernel[] {
  const all: KernelReleaseWithKernel[] = [];
  for (const kernel of loadHub().kernels) {
    for (const release of kernel.releases) {
      all.push({ ...release, kernel });
    }
  }
  return all.sort((a, b) => newerRelease(a, b));
}

export function getKernelReleasesForKernel(slug: string): KernelReleaseWithKernel[] {
  return getAllKernelReleases().filter((release) => release.kernelSlug === slug);
}

export function getKernelRelease(
  kernelSlug: string,
  versionDir: string
): KernelReleaseWithKernel | undefined {
  const kernel = getKernel(kernelSlug);
  const release = kernel?.releases.find(
    (candidate) => candidate.versionDir === versionDir
  );
  if (!kernel || !release) return undefined;
  return { ...release, kernel };
}

export interface HubStats {
  romCount: number;
  releaseCount: number;
  kernelCount: number;
  guideCount: number;
}

export function getHubStats(): HubStats {
  const hub = loadHub();
  return {
    romCount: hub.roms.length,
    releaseCount: hub.roms.reduce((sum, rom) => sum + rom.releaseCount, 0),
    kernelCount: hub.kernels.length,
    guideCount: hub.guides.length,
  };
}
