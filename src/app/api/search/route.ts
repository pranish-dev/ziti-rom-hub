import { getAllGuides, getAllRoms, getAllReleases } from "@/lib/content";
import { formatReleaseDate, releaseHref, romHref } from "@/lib/format";

/**
 * Build-time search index served as static JSON.
 * Covers ROM names, release versions, Android bases, codenames,
 * maintainers, build types and guide content.
 */
export const dynamic = "force-static";

interface SearchEntry {
  kind: "ROM" | "Release" | "Guide";
  title: string;
  subtitle: string;
  url: string;
  terms: string;
}

function toTerms(parts: Array<string | undefined>): string {
  return parts
    .filter((part): part is string => Boolean(part))
    .join(" ")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function GET(): Response {
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

  return Response.json(entries);
}
