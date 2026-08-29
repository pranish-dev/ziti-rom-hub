/**
 * Generates the client-side search index as a static JSON file.
 *
 * Replaces the former /api/search route: with `output: "export"` a route
 * file is emitted without an extension, which Cloudflare Pages would serve
 * with the wrong content type. Writing public/search-index.json instead
 * guarantees correct headers on any static host.
 *
 * Run directly:  npm run generate-search-index
 * (also runs automatically before `npm run build`)
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";

import { getAllGuides, getAllRoms, getAllReleases } from "../src/lib/content";
import { formatReleaseDate, releaseHref, romHref } from "../src/lib/format";
import type { SearchEntry } from "../src/lib/search";

function toTerms(parts: Array<string | undefined>): string {
  return parts
    .filter((part): part is string => Boolean(part))
    .join(" ")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

async function main() {
  const entries: SearchEntry[] = [];

  for (const rom of getAllRoms()) {
    entries.push({
      kind: "ROM",
      title: rom.name,
      subtitle: `${rom.device} · ${rom.androidBase} · ${rom.maintainer}`,
      url: romHref(rom),
      terms: toTerms([
        rom.name,
        rom.slug,
        rom.codename,
        rom.device,
        rom.maintainer,
        rom.androidBase,
        rom.description,
      ]),
    });
  }

  for (const release of getAllReleases()) {
    entries.push({
      kind: "Release",
      title: `${release.rom.name} ${release.version}`,
      subtitle: `${release.android}${release.qpr ? ` · ${release.qpr}` : ""} · ${formatReleaseDate(release.releaseDate)}`,
      url: releaseHref(release.romSlug, release.versionDir),
      terms: toTerms([
        release.rom.name,
        release.rom.codename,
        release.version,
        release.android,
        release.qpr,
        ...release.buildType,
        release.maintainer ?? release.rom.maintainer,
        release.releaseDate,
        release.bodyExcerpt,
      ]),
    });
  }

  for (const guide of getAllGuides()) {
    entries.push({
      kind: "Guide",
      title: guide.title,
      subtitle: "Guide · OnePlus Nord CE 3 5G (ziti)",
      url: `/guides/${guide.slug}`,
      terms: toTerms([guide.title, guide.slug, guide.description]),
    });
  }

  const destination = path.join(process.cwd(), "public", "search-index.json");
  await writeFile(destination, JSON.stringify(entries), "utf8");
  console.log(
    `[search-index] ${entries.length} entries written to public/search-index.json`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});