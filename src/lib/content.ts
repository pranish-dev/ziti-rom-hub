import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import { renderMarkdown, stripMarkdown } from "./markdown";
import { getImageDimensions } from "./image-size";
import {
  VERSION_DIR_RE,
  formatContentError,
  guideSchema,
  releaseSchema,
  romSchema,
} from "./schemas";
import type {
  Guide,
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

/** Map a file inside content/ to its public URL under /media. */
function mediaUrl(contentRelativePath: string): string {
  const segments = contentRelativePath.split("/").map(encodeURIComponent);
  return `/media/${segments.join("/")}`;
}

function findBanner(
  romSlug: string,
  versionDir: string,
  releaseDir: string
): { url: string; width: number; height: number } | undefined {
  for (const candidate of BANNER_CANDIDATES) {
    const absolutePath = path.join(releaseDir, candidate);
    if (fs.existsSync(absolutePath)) {
      const { width, height } = getImageDimensions(absolutePath);
      return {
        url: mediaUrl(`roms/${romSlug}/releases/${versionDir}/${candidate}`),
        width,
        height,
      };
    }
  }
  return undefined;
}

function findScreenshots(
  romSlug: string,
  versionDir: string,
  releaseDir: string
): string[] {
  const screenshotsDir = path.join(releaseDir, "screenshots");
  if (!fs.existsSync(screenshotsDir)) return [];
  const natural = new Intl.Collator(undefined, { numeric: true });
  return fs
    .readdirSync(screenshotsDir)
    .filter((name) =>
      IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase())
    )
    .sort(natural.compare)
    .map(
      (name) =>
        mediaUrl(
          `roms/${romSlug}/releases/${versionDir}/screenshots/${name}`
        )
    );
}

function newerRelease(a: Release, b: Release): number {
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

    const parsed = romSchema.safeParse(matter(raw).data);
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

    const { data, content } = matter(raw);
    const parsed = releaseSchema.safeParse(data);
    if (!parsed.success) {
      errors.push(formatContentError("release", relMdRel, parsed.error));
      continue;
    }

    const frontmatter = parsed.data;
    const bodyHtml = renderMarkdown(content);
    const bodyExcerpt = stripMarkdown(content).slice(0, 600);
    const banner = findBanner(romSlug, versionDir, releaseDir);

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
      screenshots: findScreenshots(romSlug, versionDir, releaseDir),
    });
  }

  return releases;
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

    const { data, content } = matter(raw);
    const parsed = guideSchema.safeParse(data);
    if (!parsed.success) {
      errors.push(formatContentError("guide", mdPath, parsed.error));
      continue;
    }

    guides.push({
      slug,
      title: parsed.data.title,
      description: parsed.data.description,
      order: parsed.data.order,
      bodyHtml: renderMarkdown(content),
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
  const guides = loadGuides(errors);

  if (errors.length > 0) {
    throw new Error(
      `\n\nContent validation failed with ${errors.length} problem${
        errors.length === 1 ? "" : "s"
      }:\n\n${errors.join("\n\n")}\n`
    );
  }

  cache = { roms, guides };
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

export interface HubStats {
  romCount: number;
  releaseCount: number;
  guideCount: number;
}

export function getHubStats(): HubStats {
  const hub = loadHub();
  return {
    romCount: hub.roms.length,
    releaseCount: hub.roms.reduce((sum, rom) => sum + rom.releaseCount, 0),
    guideCount: hub.guides.length,
  };
}
